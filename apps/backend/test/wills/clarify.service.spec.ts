import { BadRequestException } from '@nestjs/common';
import { ClarifyService } from '../../src/modules/wills/clarify.service';
import type { WillSnapshotState } from '../../src/modules/wills/memory/will-snapshot-state';

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const jest: any;

describe('ClarifyService (Phase 6)', () => {
  let willsService: any;
  let aiService: any;
  let snapshotService: any;
  let updateApplier: any;
  let clarifyService: ClarifyService;

  const snapshot = (): WillSnapshotState => ({
    title: 'Test Will',
    testator: { name: 'Jane', age: 45, address: 'Pune', soundMind: true },
    assets: [],
    beneficiaries: [],
    allocations: [],
    executor: null,
    guardian: null,
    witnesses: [],
    pendingClarification: {
      question: 'Which son should inherit everything?',
      ambiguity: 'Which son?',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  });

  beforeEach(() => {
    willsService = {
      findByUserIdAndWillId: jest.fn().mockResolvedValue({ id: 'will-1', title: 'Test Will' }),
      saveChatMessage: jest.fn().mockResolvedValue({ id: 'msg-1' }),
    };

    snapshotService = {
      loadSnapshot: jest.fn().mockResolvedValue(snapshot()),
      persistSnapshot: jest.fn().mockImplementation((_id: string, snap: WillSnapshotState) =>
        Promise.resolve({ id: 'snap-2', snapshot: snap }),
      ),
    };

    updateApplier = {
      apply: jest.fn().mockImplementation((snap: WillSnapshotState, extraction: any) => ({
        ...snap,
        beneficiaries: extraction.updates.beneficiaries ?? snap.beneficiaries,
      })),
    };

    aiService = {
      extractFromMessage: jest.fn(),
    };

    clarifyService = new ClarifyService(
      willsService,
      aiService,
      snapshotService,
      updateApplier,
    );
  });

  it('rejects clarify when no pending clarification exists', async () => {
    snapshotService.loadSnapshot.mockResolvedValue({
      ...snapshot(),
      pendingClarification: null,
    });

    await expect(
      clarifyService.processClarification('user-1', 'will-1', { clarification: 'Rahul' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('clears pending clarification and applies updates on confident answer', async () => {
    aiService.extractFromMessage.mockResolvedValue({
      updates: { beneficiaries: [{ name: 'Rahul', relationship: 'son' }] },
      missingFields: [],
      ambiguities: [],
      nextQuestion: '',
      confidence: 0.9,
    });

    const response = await clarifyService.processClarification('user-1', 'will-1', {
      clarification: 'Rahul is my eldest son',
    });

    expect(response.message).toContain('updated');
    expect(response.snapshot.pendingClarification).toBeNull();
    expect(updateApplier.apply).toHaveBeenCalled();
    expect(willsService.saveChatMessage).toHaveBeenCalledTimes(2);
  });

  it('keeps pending clarification when answer is still low confidence', async () => {
    aiService.extractFromMessage.mockResolvedValue({
      updates: {},
      missingFields: [],
      ambiguities: ['Still unclear which son'],
      nextQuestion: 'Please provide his full legal name',
      confidence: 0.4,
    });

    const response = await clarifyService.processClarification('user-1', 'will-1', {
      clarification: 'my son',
    });

    expect(response.gated).toBe(true);
    expect(response.snapshot.pendingClarification).not.toBeNull();
    expect(updateApplier.apply).not.toHaveBeenCalled();
  });
});
