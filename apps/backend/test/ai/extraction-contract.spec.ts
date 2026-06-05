import {
  buildExtractionUsage,
  estimateExtractionCost,
  validateExtractionContract,
} from '../../src/modules/ai/extraction-contract';
import type { ExtractionResult } from '../../src/modules/wills/memory/will-snapshot-state';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('extraction contract (Phase 3)', () => {
  it('validates a correct extraction payload', () => {
    const input: ExtractionResult = {
      updates: { testator: { name: 'Jane' } },
      missingFields: ['executor'],
      ambiguities: [],
      nextQuestion: 'Who is the executor?',
      confidence: 0.9,
    };

    const { valid, errors, result } = validateExtractionContract(input);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
    expect(result.updates.testator).toEqual({ name: 'Jane' });
  });

  it('rejects invalid confidence and missing fields shape', () => {
    const { valid, errors } = validateExtractionContract({
      updates: {},
      missingFields: [123 as unknown as string],
      ambiguities: [],
      nextQuestion: '',
      confidence: 2,
    } as ExtractionResult);

    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('estimates per-message cost from token usage', () => {
    const usage = buildExtractionUsage('gpt-4o-mini', 800, 200);
    expect(usage.totalTokens).toBe(1000);
    expect(usage.estimatedCostUsd).toBeGreaterThan(0);
    expect(estimateExtractionCost('gpt-4o-mini', 800, 200)).toBe(usage.estimatedCostUsd);
  });
});
