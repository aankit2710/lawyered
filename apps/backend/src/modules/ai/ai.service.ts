import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import {
  buildExtractionUsage,
  EXTRACTION_PROMPT_VERSION,
  validateExtractionContract,
} from './extraction-contract';
import { ExtractionResult, WillSnapshotState } from '../wills/memory/will-snapshot-state';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI | null;
  private readonly model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  private consecutiveFailures = 0;
  private circuitOpenUntil = 0;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async extractFromMessage(
    snapshot: WillSnapshotState,
    latestMessage: string
  ): Promise<ExtractionResult> {
    if (!this.client) {
      return this.withMeta(this.fallbackExtract(snapshot, latestMessage), 'fallback');
    }

    if (Date.now() < this.circuitOpenUntil) {
      this.logger.warn('OpenAI circuit open — using fallback heuristics');
      return this.withMeta(this.fallbackExtract(snapshot, latestMessage), 'fallback');
    }

    const maxRetries = Number(process.env.OPENAI_MAX_RETRIES ?? 3);
    const baseDelayMs = Number(process.env.OPENAI_RETRY_BASE_DELAY_MS ?? 400);

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: this.buildSystemPrompt() },
            {
              role: 'user',
              content: JSON.stringify(
                {
                  currentSnapshot: snapshot,
                  latestMessage,
                },
                null,
                2
              ),
            },
          ],
        });

        const raw = response.choices[0]?.message?.content ?? '{}';
        const normalized = this.normalizeExtraction(JSON.parse(raw));
        const validated = validateExtractionContract(normalized);

        if (!validated.valid) {
          this.logger.warn(
            `Extraction contract validation failed (prompt=${EXTRACTION_PROMPT_VERSION}): ${validated.errors.join('; ')}`
          );
          return this.withMeta(this.fallbackExtract(snapshot, latestMessage), 'fallback');
        }

        const usage = response.usage
          ? buildExtractionUsage(
              this.model,
              response.usage.prompt_tokens ?? 0,
              response.usage.completion_tokens ?? 0
            )
          : undefined;

        if (usage) {
          this.logger.log(
            `OpenAI extraction ok. model=${usage.model} tokens=${usage.totalTokens} estCostUsd=${usage.estimatedCostUsd} prompt=${EXTRACTION_PROMPT_VERSION}`
          );
        }

        this.consecutiveFailures = 0;

        return {
          ...validated.result,
          usage,
          promptVersion: EXTRACTION_PROMPT_VERSION,
        };
      } catch (error) {
        lastError = error;
        const message = (error as Error)?.message ?? String(error);
        const retryable = this.isRetryableOpenAIError(error);

        this.logger.warn(
          `OpenAI extraction attempt failed (attempt ${attempt + 1}/${maxRetries + 1}). retryable=${retryable}. error="${message}"`
        );

        if (!retryable || attempt >= maxRetries) {
          this.registerCircuitFailure();
          this.logger.warn(
            `OpenAI extraction failed after retries, using fallback heuristics: ${message}`
          );
          return this.withMeta(this.fallbackExtract(snapshot, latestMessage), 'fallback');
        }

        const delay = Math.floor(baseDelayMs * Math.pow(2, attempt));
        await this.sleep(delay);
      }
    }

    this.registerCircuitFailure();
    this.logger.warn(
      `OpenAI extraction failed, using fallback heuristics: ${String(lastError)}`
    );
    return this.withMeta(this.fallbackExtract(snapshot, latestMessage), 'fallback');
  }

  private registerCircuitFailure() {
    this.consecutiveFailures += 1;
    const threshold = Number(process.env.OPENAI_CIRCUIT_FAILURE_THRESHOLD ?? 5);
    const cooldownMs = Number(process.env.OPENAI_CIRCUIT_COOLDOWN_MS ?? 60000);
    if (this.consecutiveFailures >= threshold) {
      this.circuitOpenUntil = Date.now() + cooldownMs;
      this.consecutiveFailures = 0;
      this.logger.error(`OpenAI circuit opened for ${cooldownMs}ms after repeated failures`);
    }
  }

  /** Exposed for unit tests against deterministic fallback heuristics. */
  extractFromMessageFallback(
    snapshot: WillSnapshotState,
    latestMessage: string
  ): ExtractionResult {
    return this.withMeta(this.fallbackExtract(snapshot, latestMessage), 'fallback');
  }

  private withMeta(result: ExtractionResult, source: 'openai' | 'fallback'): ExtractionResult {
    return {
      ...result,
      promptVersion: EXTRACTION_PROMPT_VERSION,
      usage: source === 'fallback' ? undefined : result.usage,
    };
  }

  private buildSystemPrompt(): string {
    return [
      `Extraction prompt version: ${EXTRACTION_PROMPT_VERSION}.`,
      'You are an extraction engine for a will-building application.',
      'You are not a chatbot.',
      'Only return valid JSON matching this contract:',
      '{',
      '  "updates": {},',
      '  "missingFields": [],',
      '  "ambiguities": [],',
      '  "nextQuestion": "",',
      '  "confidence": 0.95,',
      '  "replace": {}',
      '}',
      'Use the current snapshot as memory.',
      'If the user changes their mind, replace the old value with the new one.',
      'Do not validate legal completeness.',
      'Do not explain your reasoning.',
      'Keep updates minimal and structured for database storage.',
      'Prefer concrete fields such as testator, assets, beneficiaries, allocations, executor, guardian, and witnesses.',
      'If the user message is vague, add the ambiguity and ask one concise follow-up question.',
    ].join(' ');
  }

  private normalizeExtraction(value: any): ExtractionResult {
    return {
      updates: this.asObject(value?.updates),
      missingFields: this.asStringArray(value?.missingFields),
      ambiguities: this.asStringArray(value?.ambiguities),
      nextQuestion: this.asString(value?.nextQuestion),
      confidence: this.clampConfidence(Number(value?.confidence)),
      replace: value?.replace ? this.asObject(value?.replace) : undefined,
    };
  }

  private isRetryableOpenAIError(error: unknown): boolean {
    const message = (error as any)?.message ? String((error as any).message) : '';
    const status = (error as any)?.status ?? (error as any)?.response?.status;

    if (status === 408 || status === 409 || status === 429) return true;
    if (typeof status === 'number' && status >= 500) return true;

    if (/timeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN/i.test(message)) return true;

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private fallbackExtract(snapshot: WillSnapshotState, latestMessage: string): ExtractionResult {
    const message = latestMessage.trim();
    const lower = message.toLowerCase();
    const updates: Record<string, any> = {};
    const missingFields = this.getMissingFields(snapshot);
    const ambiguities: string[] = [];
    let nextQuestion = '';

    const nameMatch = message.match(/\bmy name is ([A-Za-z][A-Za-z\s'-]+)/i);
    if (nameMatch) {
      updates.testator = {
        ...(snapshot.testator || {}),
        name: nameMatch[1].trim(),
      };
    }

    const ageMatch = message.match(/\b(?:i am|i'm|age is) (\d{1,3})\b/i);
    if (ageMatch) {
      updates.testator = {
        ...(updates.testator || snapshot.testator || {}),
        age: Number(ageMatch[1]),
      };
    }

    const addressMatch = message.match(/\b(?:my address is|i live at|i live in) (.+)$/i);
    if (addressMatch) {
      updates.testator = {
        ...(updates.testator || snapshot.testator || {}),
        address: addressMatch[1].trim(),
      };
    }

    const executorMatch = message.match(
      /\b(?:executor is|make|appoint) ([A-Za-z][A-Za-z\s'-]+?) (?:my )?executor/i
    );
    if (executorMatch) {
      updates.executor = { name: executorMatch[1].trim() };
    }

    const replaceExecutorMatch = message.match(
      /\b(?:actually|instead|change it to) ([A-Za-z][A-Za-z\s'-]+?) (?:the )?executor\b/i
    );

    const backupExecutorMatch = message.match(
      /\b(?:make|appoint)\s+(.+?)\s+executor\b.*\b(?:if (?:she|he|they) refuse|but if .+ refuse),?\s+(?:my\s+)?([A-Za-z][A-Za-z\s'-]+)/i
    );

    const assetMatch = message.match(
      /\b(my\s+)?(house|home|flat|apartment|property|car|vehicle|land|bank account)\b(?:.*?\b(?:goes to|to)\b\s+(.+))?/i
    );
    if (assetMatch) {
      const assetName = assetMatch[2].replace(/\b\w/, c => c.toUpperCase());
      updates.assets = [
        ...snapshot.assets,
        {
          name: assetName,
          description: message,
        },
      ];

      if (assetMatch[3]) {
        const beneficiaries = this.extractBeneficiaries(assetMatch[3]);
        if (beneficiaries.length > 0) {
          updates.beneficiaries = this.mergeBeneficiaries(snapshot, beneficiaries);
          if (beneficiaries.length > 1 && message.toLowerCase().includes('equally')) {
            updates.allocations = beneficiaries.map((beneficiary: any) => ({
              beneficiary: beneficiary.name,
              percentage: Math.floor(100 / beneficiaries.length),
            }));
          }
        }
      }
    }

    let replace: Record<string, any> | undefined;
    if (replaceExecutorMatch) {
      replace = {
        executor: { name: replaceExecutorMatch[1].trim() },
      };
    }

    if (backupExecutorMatch) {
      updates.executor = {
        name: backupExecutorMatch[1].trim(),
        backup: backupExecutorMatch[2].trim(),
      };
    }

    if (/\bmy children inherit equally\b/i.test(message) && snapshot.beneficiaries.length >= 2) {
      const share = 1 / snapshot.beneficiaries.length;
      updates.allocations = snapshot.beneficiaries.map((beneficiary: Record<string, any>) => ({
        asset: 'residue',
        beneficiary: beneficiary.name,
        share,
      }));
    }

    if (/\bmy son gets everything\b/i.test(message) || /\bmy son inherit(s)? everything\b/i.test(message)) {
      ambiguities.push('Which son should inherit everything?');
      nextQuestion = 'Which son should inherit everything? Please provide his full name.';
    }

    if (!Object.keys(updates).length && !replace && !ambiguities.length) {
      if (!snapshot.testator.name) {
        nextQuestion = 'What is the testator name?';
      } else if (!snapshot.executor) {
        nextQuestion = 'Who should be the executor?';
      } else if (!snapshot.witnesses?.length) {
        nextQuestion = 'Who are the witnesses?';
      } else if (missingFields.length > 0) {
        nextQuestion = `Please provide: ${missingFields.join(', ')}`;
      }
    }

    const hasChanges = Object.keys(updates).length > 0 || Boolean(replace);
    return this.normalizeExtraction({
      updates,
      missingFields,
      ambiguities,
      nextQuestion,
      confidence: ambiguities.length > 0 ? 0.45 : hasChanges ? 0.72 : 0.42,
      replace,
    });
  }

  private extractBeneficiaries(raw: string): Array<Record<string, any>> {
    const cleaned = raw
      .replace(/\band\b/gi, ',')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    return cleaned.map(name => ({
      name: name.replace(/^my\s+/i, ''),
    }));
  }

  private mergeBeneficiaries(
    snapshot: WillSnapshotState,
    beneficiaries: Array<Record<string, any>>
  ): Array<Record<string, any>> {
    const existing = snapshot.beneficiaries || [];
    const combined = [...existing];

    for (const beneficiary of beneficiaries) {
      const exists = combined.some(
        item => item.name?.toLowerCase() === beneficiary.name?.toLowerCase()
      );
      if (!exists) {
        combined.push(beneficiary);
      }
    }

    return combined;
  }

  private getMissingFields(snapshot: WillSnapshotState): string[] {
    const missing: string[] = [];
    if (!snapshot.testator?.name) missing.push('testator.name');
    if (snapshot.testator?.age === null || snapshot.testator?.age === undefined) {
      missing.push('testator.age');
    }
    if (!snapshot.testator?.address) missing.push('testator.address');
    if (!snapshot.executor) missing.push('executor');
    if (!snapshot.witnesses?.length) missing.push('witnesses');
    return missing;
  }

  private clampConfidence(value: number): number {
    if (Number.isNaN(value)) {
      return 0.5;
    }
    return Math.max(0, Math.min(1, value));
  }

  private asObject(value: any): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  private asString(value: any): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringArray(value: any): string[] {
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
  }
}
