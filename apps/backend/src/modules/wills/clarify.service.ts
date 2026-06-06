import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AiMetricsService } from '../metrics/ai-metrics.service';
import { ClarifyRequestDto } from './dto/clarify-request.dto';
import { ExtractionResult } from './memory/will-snapshot-state';
import { SnapshotService } from './snapshot.service';
import { UpdateApplierService } from './update-applier.service';
import { WillsService } from './wills.service';
import { WillSnapshotState } from './memory/will-snapshot-state';

@Injectable()
export class ClarifyService {
  private readonly logger = new Logger(ClarifyService.name);
  private readonly CONFIDENCE_GATE_THRESHOLD = 0.7;

  constructor(
    private readonly willsService: WillsService,
    private readonly aiService: AiService,
    private readonly snapshotService: SnapshotService,
    private readonly updateApplier: UpdateApplierService,
    private readonly aiMetrics: AiMetricsService,
  ) {}

  async processClarification(userId: string, willId: string, dto: ClarifyRequestDto) {
    const will = await this.willsService.findByUserIdAndWillId(userId, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    const snapshot = await this.snapshotService.loadSnapshot(willId);
    const pending = snapshot.pendingClarification ?? null;
    if (!pending) {
      throw new BadRequestException('No pending clarification to answer');
    }

    const clarification = dto.clarification.trim();
    await this.willsService.saveChatMessage(willId, 'user', clarification);

    const extraction = await this.aiService.extractFromMessage(snapshot, clarification);
    this.aiMetrics.recordExtraction(extraction.usage ? 'openai' : 'fallback', extraction.usage);
    const askedQuestions = Array.isArray(snapshot.askedQuestions) ? snapshot.askedQuestions : [];

    const shouldGate =
      extraction.confidence < this.CONFIDENCE_GATE_THRESHOLD &&
      (extraction.ambiguities.length > 0 || extraction.missingFields.length > 0);

    let nextSnapshot: WillSnapshotState;
    if (shouldGate) {
      const question = extraction.nextQuestion || pending.question;
      nextSnapshot = {
        ...snapshot,
        pendingClarification: {
          ambiguity: extraction.ambiguities[0] ?? pending.ambiguity,
          question,
          createdAt: new Date().toISOString(),
        },
        lastNextQuestion: question,
        askedQuestions: this.appendAskedQuestionIfNew(askedQuestions, question),
      };
    } else {
      nextSnapshot = this.updateApplier.apply(snapshot, extraction, will.title);
      nextSnapshot = {
        ...nextSnapshot,
        pendingClarification: null,
        askedQuestions,
        lastNextQuestion: undefined,
      };
    }

    const persistedSnapshot = await this.snapshotService.persistSnapshot(willId, nextSnapshot);
    const assistantMessage = this.buildAssistantMessage(extraction, shouldGate, pending.question);

    await this.willsService.saveChatMessage(willId, 'assistant', assistantMessage, {
      extraction,
      snapshotId: persistedSnapshot.id,
      gated: shouldGate,
      confidence: extraction.confidence,
      clarification: true,
    });

    this.logger.log(
      `Clarification processed. willId=${willId} confidence=${extraction.confidence} gated=${shouldGate}`
    );

    return {
      message: assistantMessage,
      willId: will.id,
      title: will.title,
      snapshot: nextSnapshot,
      extraction,
      gated: shouldGate,
      pendingClarification: shouldGate ? nextSnapshot.pendingClarification : null,
      snapshotId: persistedSnapshot.id,
    };
  }

  private buildAssistantMessage(
    extraction: ExtractionResult,
    gated: boolean,
    previousQuestion: string
  ): string {
    if (gated) {
      return extraction.nextQuestion || extraction.ambiguities[0] || previousQuestion;
    }

    if (
      Object.keys(extraction.updates).length > 0 ||
      Object.keys(extraction.replace || {}).length > 0
    ) {
      return 'Thanks — I have updated the will with your clarification.';
    }

    return 'Thanks — your clarification has been recorded.';
  }

  private appendAskedQuestionIfNew(askedQuestions: string[], question: string): string[] {
    const trimmed = question.trim();
    if (!trimmed) return askedQuestions;
    const exists = askedQuestions.some(q => q.trim().toLowerCase() === trimmed.toLowerCase());
    return exists ? askedQuestions : [...askedQuestions, trimmed];
  }
}
