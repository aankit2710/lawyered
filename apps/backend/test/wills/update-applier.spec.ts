import { UpdateApplierService } from '../../src/modules/wills/update-applier.service';
import type {
  ExtractionResult,
  WillSnapshotState,
} from '../../src/modules/wills/memory/will-snapshot-state';

// Jest is present at runtime; these declarations avoid TS compile errors.
declare const describe: any;
declare const it: any;
declare const expect: any;

describe('UpdateApplierService (Phase 6 semantics)', () => {
  const applier = new UpdateApplierService();

  function baseSnapshot(): WillSnapshotState {
    return {
      title: 'Untitled Will',
      testator: { name: 'John', age: 40, address: 'X', soundMind: true },
      assets: [{ kind: 'residue' }],
      beneficiaries: [{ name: 'Alice', relation: 'child' }],
      allocations: [{ asset: 'residue', beneficiary: 'Alice', share: 1 }],
      executor: { name: 'E1' },
      guardian: null,
      witnesses: [],
      askedQuestions: [],
      pendingClarification: null,
      lastNextQuestion: undefined,
    };
  }

  it('replaces executor when extraction.replace.executor is provided', () => {
    const snapshot = baseSnapshot();
    const extraction: ExtractionResult = {
      updates: {},
      missingFields: [],
      ambiguities: [],
      nextQuestion: '',
      confidence: 0.9,
      replace: {
        executor: { name: 'E2' },
      },
    };

    const next = applier.apply(snapshot, extraction, snapshot.title!);
    expect(next.executor).toEqual({ name: 'E2' });
  });

  it('replaces beneficiaries when extraction.replace.beneficiaries is provided', () => {
    const snapshot = baseSnapshot();
    const extraction: ExtractionResult = {
      updates: {},
      missingFields: [],
      ambiguities: [],
      nextQuestion: '',
      confidence: 0.9,
      replace: {
        beneficiaries: [
          { name: 'Bob', relation: 'child' },
          { name: 'Charlie', relation: 'child' },
        ],
      },
    };

    const next = applier.apply(snapshot, extraction, snapshot.title!);
    expect(next.beneficiaries).toHaveLength(2);
    expect(next.beneficiaries.map(b => b.name)).toEqual(['Bob', 'Charlie']);
  });

  it('applies equal shares for asset split when extraction.updates.allocations is provided', () => {
    const snapshot = baseSnapshot();
    const extraction: ExtractionResult = {
      updates: {
        allocations: [
          { asset: 'house', beneficiary: 'Alice', share: 0.5 },
          { asset: 'house', beneficiary: 'Bob', share: 0.5 },
        ],
      },
      missingFields: [],
      ambiguities: [],
      nextQuestion: '',
      confidence: 0.9,
    };

    const next = applier.apply(snapshot, extraction, snapshot.title!);
    expect(next.allocations).toEqual([
      { asset: 'house', beneficiary: 'Alice', share: 0.5 },
      { asset: 'house', beneficiary: 'Bob', share: 0.5 },
    ]);
  });

  it('splits estate equally among multiple children beneficiaries', () => {
    const snapshot = baseSnapshot();
    const extraction: ExtractionResult = {
      updates: {
        beneficiaries: [
          { name: 'Rahul', relation: 'child' },
          { name: 'Rohit', relation: 'child' },
        ],
        allocations: [
          { asset: 'residue', beneficiary: 'Rahul', share: 0.5 },
          { asset: 'residue', beneficiary: 'Rohit', share: 0.5 },
        ],
      },
      missingFields: [],
      ambiguities: [],
      nextQuestion: '',
      confidence: 0.9,
    };

    const next = applier.apply(snapshot, extraction, snapshot.title!);
    expect(next.beneficiaries).toHaveLength(2);
    expect(next.allocations).toEqual([
      { asset: 'residue', beneficiary: 'Rahul', share: 0.5 },
      { asset: 'residue', beneficiary: 'Rohit', share: 0.5 },
    ]);
  });

  it('merges backup executor details when provided via updates', () => {
    const snapshot = baseSnapshot();
    const extraction: ExtractionResult = {
      updates: {
        executor: { name: 'Wife', backup: 'Brother' },
      },
      missingFields: [],
      ambiguities: [],
      nextQuestion: '',
      confidence: 0.9,
    };

    const next = applier.apply(snapshot, extraction, snapshot.title!);
    expect(next.executor).toEqual({ name: 'Wife', backup: 'Brother' });
  });

  it('last-wins by replace semantics for contradictory beneficiary statements', () => {
    const snapshot = baseSnapshot();

    const contradictory: ExtractionResult = {
      updates: {
        beneficiaries: [{ name: 'Alice', relation: 'child' }],
      },
      missingFields: [],
      ambiguities: [],
      nextQuestion: '',
      confidence: 0.95,
      replace: {
        beneficiaries: [{ name: 'Zara', relation: 'child' }],
      },
    };

    const next = applier.apply(snapshot, contradictory, snapshot.title!);
    expect(next.beneficiaries).toEqual([{ name: 'Zara', relation: 'child' }]);
  });
});
