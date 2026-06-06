import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AiService } from '../ai/ai.service';
import { AiMetricsService } from '../metrics/ai-metrics.service';
import { ExtractionResult } from './memory/will-snapshot-state';
import { User } from '../users/entities/user.entity';
import { SnapshotService } from './snapshot.service';
import { UpdateApplierService } from './update-applier.service';
import { WillsService } from './wills.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  private readonly CONFIDENCE_GATE_THRESHOLD = 0.7;

  constructor(
    private readonly willsService: WillsService,
    private readonly aiService: AiService,
    private readonly snapshotService: SnapshotService,
    private readonly updateApplier: UpdateApplierService,
    private readonly aiMetrics: AiMetricsService,
  ) {}

  async processMessage(user: User, willId: string, message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new BadRequestException('Message is required');
    }

    const will = await this.willsService.findByUserIdAndWillId(user.id, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    const currentSnapshot = await this.snapshotService.loadSnapshot(willId);
    await this.willsService.saveChatMessage(willId, 'user', trimmedMessage);

    const extraction = await this.aiService.extractFromMessage(currentSnapshot, trimmedMessage);
    this.aiMetrics.recordExtraction(extraction.usage ? 'openai' : 'fallback', extraction.usage);

    const askedQuestions = Array.isArray(currentSnapshot.askedQuestions)
      ? currentSnapshot.askedQuestions
      : [];

    const pendingClarification = currentSnapshot.pendingClarification ?? null;

    const shouldGate =
      extraction.confidence < this.CONFIDENCE_GATE_THRESHOLD &&
      (extraction.ambiguities.length > 0 || extraction.missingFields.length > 0);

    // if a clarification is already pending, always gate (user hasn't answered yet)
    const pendingClarificationActive =
      currentSnapshot.pendingClarification !== null &&
      currentSnapshot.pendingClarification !== undefined;

    const finalGate = shouldGate || pendingClarificationActive;

    let nextSnapshot = currentSnapshot;

    if (finalGate) {
      // If clarification is already pending, keep asking the same pending question.
      if (pendingClarification) {
        nextSnapshot = {
          ...currentSnapshot,
          askedQuestions: askedQuestions,
          lastNextQuestion: pendingClarification.question,
        };
      }

      // If clarification is already pending, skip creating a new one.
      // Otherwise create/refresh it based on this extraction.
      if (!pendingClarification) {
        const question =
          extraction.nextQuestion ||
          extraction.ambiguities[0] ||
          extraction.missingFields[0] ||
          'Can you clarify?';

        const ambiguity = extraction.ambiguities[0];

        const alreadyAsked = askedQuestions.some(
          q => q.trim().toLowerCase() === question.trim().toLowerCase()
        );

        const alternate = alreadyAsked
          ? extraction.missingFields[0] ||
            extraction.ambiguities[1] ||
            'Could you provide one more detail?'
          : question;

        nextSnapshot = {
          ...currentSnapshot,
          pendingClarification: {
            ambiguity,
            question: alternate,
            createdAt: new Date().toISOString(),
          },
          askedQuestions: askedQuestions,
          lastNextQuestion: alternate,
        };

        this.logger.warn(
          `Low confidence extraction gated. willId=${willId} confidence=${extraction.confidence} pendingQuestion="${alternate}"`
        );
      }
    } else {
      nextSnapshot = this.updateApplier.apply(currentSnapshot, extraction, will.title);
      // if we were previously pending clarification and the extraction is now confident enough, clear it
      if (pendingClarification) {
        nextSnapshot = {
          ...nextSnapshot,
          pendingClarification: null,
        };
      }
    }

    const assistantMessage = this.buildAssistantMessage(extraction);

    const uniqueAssistantMessage =
      assistantMessage === currentSnapshot.lastNextQuestion
        ? (pendingClarification?.question ??
          'Thanks—please provide any additional details you can.')
        : assistantMessage;

    const updatedAskedQuestions = this.appendAskedQuestionIfNew(
      askedQuestions,
      uniqueAssistantMessage
    );

    nextSnapshot = {
      ...nextSnapshot,
      askedQuestions: updatedAskedQuestions,
      lastNextQuestion: uniqueAssistantMessage,
    };

    const persistedSnapshot = await this.snapshotService.persistSnapshot(willId, nextSnapshot);

    await this.willsService.saveChatMessage(willId, 'assistant', uniqueAssistantMessage, {
      extraction,
      snapshotId: persistedSnapshot.id,
      gated: finalGate,
      confidence: extraction.confidence,
      promptVersion: extraction.promptVersion,
      usage: extraction.usage,
    });

    const costLog = extraction.usage
      ? ` tokens=${extraction.usage.totalTokens} estCostUsd=${extraction.usage.estimatedCostUsd}`
      : '';

    this.logger.log(
      `Extraction processed. willId=${willId} confidence=${extraction.confidence} gated=${finalGate} updates=${Object.keys(extraction.updates).length} ambiguities=${extraction.ambiguities.length} missingFields=${extraction.missingFields.length}${costLog}`
    );

    return {
      message: uniqueAssistantMessage,
      willId: will.id,
      title: will.title,

      snapshot: nextSnapshot,
      extraction,
      gated: finalGate,
      pendingClarification: finalGate ? nextSnapshot.pendingClarification : null,
    };
  }

  private appendAskedQuestionIfNew(askedQuestions: string[], question: string): string[] {
    const trimmed = question.trim();
    if (!trimmed) return askedQuestions;
    const exists = askedQuestions.some(q => q.trim().toLowerCase() === trimmed.toLowerCase());
    return exists ? askedQuestions : [...askedQuestions, trimmed];
  }

  private buildAssistantMessage(extraction: ExtractionResult): string {
    if (extraction.nextQuestion) {
      return extraction.nextQuestion;
    }

    if (extraction.ambiguities.length > 0) {
      return extraction.ambiguities[0];
    }

    if (
      Object.keys(extraction.updates).length > 0 ||
      Object.keys(extraction.replace || {}).length > 0
    ) {
      return 'I have saved those details.';
    }

    return 'Please share one more detail about the will.';
  }
}
