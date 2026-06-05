import { validateSnapshotState } from '../../src/modules/wills/memory/snapshot-schema';
import type { WillSnapshotState } from '../../src/modules/wills/memory/will-snapshot-state';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('snapshot schema (Phase 4)', () => {
  it('accepts a valid snapshot', () => {
    const snapshot: WillSnapshotState = {
      testator: { name: 'Jane', age: 40, address: 'X', soundMind: true },
      assets: [],
      beneficiaries: [],
      allocations: [],
      executor: null,
      guardian: null,
      witnesses: [],
    };

    expect(validateSnapshotState(snapshot).valid).toBe(true);
  });

  it('rejects invalid snapshot shapes', () => {
    const result = validateSnapshotState({
      testator: { name: 'Jane', age: 40, address: 'X', soundMind: true },
      assets: 'bad',
      beneficiaries: [],
      allocations: [],
      executor: null,
      guardian: null,
      witnesses: [],
    } as unknown as WillSnapshotState);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
