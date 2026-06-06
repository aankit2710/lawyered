import { ChatService } from '../../src/modules/wills/chat.service';
import type { ExtractionResult, WillSnapshotState } from '../../src/modules/wills/memory/will-snapshot-state';
import type { User } from '../../src/modules/users/entities/user.entity';

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const jest: any;

describe('ChatService (Phase 3 integration)', () => {
  const user = { id: 'user-1', email: 'test@example.com' } as User;
  const willId = 'will-1';

  let willsService: any;
  let aiService: any;
  let snapshotService: any;
  let updateApplier: any;
  let aiMetrics: any;
  let chatService: ChatService;

  const baseSnapshot = (): WillSnapshotState => ({
    title: 'Test Will',
    testator: { name: 'Jane', age: 45, address: 'Pune', soundMind: true },
    assets: [],
    beneficiaries: [],
    allocations: [],
    executor: null,
    guardian: null,
    witnesses: [],
    askedQuestions: [],
    pendingClarification: null,
  });

  beforeEach(() => {
    willsService = {
      findByUserIdAndWillId: jest.fn().mockResolvedValue({ id: willId, title: 'Test Will' }),
      saveChatMessage: jest.fn().mockResolvedValue({ id: 'msg-1' }),
    };

    snapshotService = {
      loadSnapshot: jest.fn().mockResolvedValue(baseSnapshot()),
      persistSnapshot: jest.fn().mockImplementation((_id: string, snapshot: WillSnapshotState) =>
        Promise.resolve({ id: 'snap-1', snapshot }),
      ),
    };

    updateApplier = {
      apply: jest.fn().mockImplementation((snapshot: WillSnapshotState, extraction: ExtractionResult) => ({
        ...snapshot,
        ...extraction.updates,
        assets: extraction.updates.assets ?? snapshot.assets,
        beneficiaries: extraction.updates.beneficiaries ?? snapshot.beneficiaries,
      })),
    };

    aiService = {
      extractFromMessage: jest.fn(),
    };

    aiMetrics = {
      recordExtraction: jest.fn(),
    };

    chatService = new ChatService(
      willsService,
      aiService,
      snapshotService,
      updateApplier,
      aiMetrics,
    );
  });

  it('runs full chat flow: save messages, apply extraction, persist snapshot', async () => {
    const extraction: ExtractionResult = {
      updates: {
        assets: [{ name: 'House', description: 'Family home' }],
        beneficiaries: [{ name: 'Rahul' }],
      },
      missingFields: ['executor'],
      ambiguities: [],
      nextQuestion: 'Who should be the executor?',
      confidence: 0.92,
      promptVersion: 'v1.1.0',
      usage: {
        model: 'gpt-4o-mini',
        promptTokens: 500,
        completionTokens: 120,
        totalTokens: 620,
        estimatedCostUsd: 0.000147,
      },
    };

    aiService.extractFromMessage.mockResolvedValue(extraction);

    const response = await chatService.processMessage(user, willId, 'My house goes to Rahul');

    expect(willsService.saveChatMessage).toHaveBeenCalledTimes(2);
    expect(aiService.extractFromMessage).toHaveBeenCalled();
    expect(updateApplier.apply).toHaveBeenCalled();
    expect(snapshotService.persistSnapshot).toHaveBeenCalled();
    expect(response.extraction.confidence).toBe(0.92);
    expect(response.extraction.usage?.totalTokens).toBe(620);
    expect(response.gated).toBe(false);
  });

  it('gates low-confidence ambiguous extractions without applying updates', async () => {
    const extraction: ExtractionResult = {
      updates: { beneficiaries: [{ name: 'Unknown' }] },
      missingFields: [],
      ambiguities: ['Which son should inherit?'],
      nextQuestion: 'Which son should inherit everything?',
      confidence: 0.4,
      promptVersion: 'v1.1.0',
    };

    aiService.extractFromMessage.mockResolvedValue(extraction);

    const response = await chatService.processMessage(user, willId, 'My son gets everything');

    expect(response.gated).toBe(true);
    expect(response.pendingClarification?.question).toContain('Which son');
    expect(updateApplier.apply).not.toHaveBeenCalled();
  });
});
