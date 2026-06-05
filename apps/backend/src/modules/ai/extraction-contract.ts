import { ExtractionResult } from '../wills/memory/will-snapshot-state';

/** Bump when system prompt or response contract changes materially. */
export const EXTRACTION_PROMPT_VERSION = 'v1.1.0';

export interface ExtractionUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface ExtractionMeta {
  promptVersion: string;
  usage?: ExtractionUsage;
  source: 'openai' | 'fallback';
}

export interface ValidatedExtraction {
  result: ExtractionResult;
  valid: boolean;
  errors: string[];
}

/** GPT-4o-mini approximate USD per 1M tokens (input / output). */
const MODEL_COST_PER_MILLION: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
};

export function estimateExtractionCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const rates = MODEL_COST_PER_MILLION[model] ?? MODEL_COST_PER_MILLION['gpt-4o-mini'];
  const inputCost = (promptTokens / 1_000_000) * rates.input;
  const outputCost = (completionTokens / 1_000_000) * rates.output;
  return Number((inputCost + outputCost).toFixed(6));
}

export function buildExtractionUsage(
  model: string,
  promptTokens: number,
  completionTokens: number,
): ExtractionUsage {
  return {
    model,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    estimatedCostUsd: estimateExtractionCost(model, promptTokens, completionTokens),
  };
}

export function validateExtractionContract(value: ExtractionResult): ValidatedExtraction {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    return {
      valid: false,
      errors: ['Extraction result must be an object'],
      result: emptyExtraction(0.35),
    };
  }

  if (typeof value.confidence !== 'number' || value.confidence < 0 || value.confidence > 1) {
    errors.push('confidence must be a number between 0 and 1');
  }

  if (typeof value.nextQuestion !== 'string') {
    errors.push('nextQuestion must be a string');
  }

  if (!value.updates || typeof value.updates !== 'object' || Array.isArray(value.updates)) {
    errors.push('updates must be an object');
  }

  if (!Array.isArray(value.missingFields) || !value.missingFields.every(f => typeof f === 'string')) {
    errors.push('missingFields must be an array of strings');
  }

  if (!Array.isArray(value.ambiguities) || !value.ambiguities.every(a => typeof a === 'string')) {
    errors.push('ambiguities must be an array of strings');
  }

  if (value.replace !== undefined) {
    if (typeof value.replace !== 'object' || Array.isArray(value.replace)) {
      errors.push('replace must be an object when provided');
    }
  }

  const sanitized: ExtractionResult = {
    updates: asObject(value.updates),
    missingFields: asStringArray(value.missingFields),
    ambiguities: asStringArray(value.ambiguities),
    nextQuestion: asString(value.nextQuestion),
    confidence: clampConfidence(Number(value.confidence)),
    replace: value.replace ? asObject(value.replace) : undefined,
  };

  return {
    valid: errors.length === 0,
    errors,
    result: sanitized,
  };
}

export function emptyExtraction(confidence = 0.35): ExtractionResult {
  return {
    updates: {},
    missingFields: [],
    ambiguities: [],
    nextQuestion: 'Please share one more detail about the will.',
    confidence,
  };
}

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}
