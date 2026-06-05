import { AiService } from '../../src/modules/ai/ai.service';
import { EXTRACTION_PROMPT_VERSION } from '../../src/modules/ai/extraction-contract';
import type { WillSnapshotState } from '../../src/modules/wills/memory/will-snapshot-state';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('AiService fallback extraction (Phase 3)', () => {
  const ai = new AiService();

  function emptySnapshot(): WillSnapshotState {
    return {
      title: 'Test Will',
      testator: { name: null, age: null, address: null, soundMind: true },
      assets: [],
      beneficiaries: [],
      allocations: [],
      executor: null,
      guardian: null,
      witnesses: [],
    };
  }

  it('extracts a simple asset and beneficiary from "My house goes to my son"', () => {
    const result = ai.extractFromMessageFallback(
      emptySnapshot(),
      'My house goes to my son',
    );

    expect(result.promptVersion).toBe(EXTRACTION_PROMPT_VERSION);
    expect(result.updates.assets).toHaveLength(1);
    expect(result.updates.assets[0].name).toBe('House');
    expect(result.updates.beneficiaries).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'son' })]),
    );
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('extracts multiple beneficiaries with equal split', () => {
    const result = ai.extractFromMessageFallback(
      emptySnapshot(),
      'My house in Pune should go equally to Rahul and Rohit',
    );

    expect(result.updates.beneficiaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Rahul' }),
        expect.objectContaining({ name: 'Rohit' }),
      ]),
    );
    expect(result.updates.allocations).toHaveLength(2);
    expect(result.updates.allocations[0].percentage).toBe(50);
    expect(result.updates.allocations[1].percentage).toBe(50);
  });

  it('detects ambiguity when "my son gets everything" is underspecified', () => {
    const result = ai.extractFromMessageFallback(
      emptySnapshot(),
      'My son gets everything',
    );

    expect(result.ambiguities.length).toBeGreaterThan(0);
    expect(result.nextQuestion.toLowerCase()).toContain('which son');
    expect(result.confidence).toBeLessThan(0.7);
  });
});
