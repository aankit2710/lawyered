import { ValidationService } from '../../src/modules/wills/validation.service';
import type { WillSnapshotState } from '../../src/modules/wills/memory/will-snapshot-state';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('ValidationService (Phase 5)', () => {
  const service = new ValidationService({} as any, {} as any);

  function baseSnapshot(overrides: Partial<WillSnapshotState> = {}): WillSnapshotState {
    return {
      title: 'Test Will',
      testator: { name: 'Jane', age: 45, address: 'Pune', soundMind: true },
      assets: [{ name: 'House' }],
      beneficiaries: [{ name: 'Rahul', relationship: 'son' }],
      allocations: [{ asset: 'House', beneficiary: 'Rahul', share: 1 }],
      executor: { name: 'Amit', contact: '9999999999' },
      guardian: null,
      witnesses: [
        { name: 'W1', signature_date: '2026-01-01' },
        { name: 'W2', signature_date: '2026-01-01' },
      ],
      ...overrides,
    };
  }

  it('accepts share-based allocations as 100%', () => {
    const result = service.evaluateSnapshot(
      baseSnapshot({
        allocations: [
          { asset: 'House', beneficiary: 'Rahul', share: 0.5 },
          { asset: 'House', beneficiary: 'Rohit', share: 0.5 },
        ],
        beneficiaries: [
          { name: 'Rahul', relationship: 'son' },
          { name: 'Rohit', relationship: 'son' },
        ],
      }),
    );

    expect(result.errors.some((e: any) => e.code === 'allocation_percentage_invalid')).toBe(false);
  });

  it('requires guardian when a beneficiary is a minor', () => {
    const result = service.evaluateSnapshot(
      baseSnapshot({
        beneficiaries: [{ name: 'Child', age: 10, relationship: 'daughter' }],
        guardian: null,
      }),
    );

    expect(result.errors.some((e: any) => e.code === 'guardian_missing')).toBe(true);
  });

  it('accepts executor.contact as contact field', () => {
    const result = service.evaluateSnapshot(
      baseSnapshot({
        executor: { name: 'Amit', contact: '8888888888' },
      }),
    );

    expect(result.errors.some((e: any) => e.code === 'executor_contact_missing')).toBe(false);
  });

  it('errors when beneficiaries are missing', () => {
    const result = service.evaluateSnapshot(baseSnapshot({ beneficiaries: [] }));

    expect(result.errors.some((e: any) => e.code === 'beneficiaries_missing')).toBe(true);
  });
});
