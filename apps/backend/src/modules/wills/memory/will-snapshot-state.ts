export interface WillSnapshotState {
  title?: string;
  testator: {
    name: string | null;
    age: number | null;
    address: string | null;
    soundMind: boolean;
  };
  assets: Array<Record<string, any>>;
  beneficiaries: Array<Record<string, any>>;
  allocations: Array<Record<string, any>>;
  executor: Record<string, any> | null;
  guardian: Record<string, any> | null;
  witnesses: Array<Record<string, any>>;

  // Phase 6 memory fields (non-legal metadata)
  askedQuestions?: string[];
  lastNextQuestion?: string;
  pendingClarification?: {
    ambiguity?: string;
    question: string;
    createdAt: string;
  } | null;
}

export interface ExtractionUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface ExtractionResult {
  updates: Record<string, any>;
  missingFields: string[];
  ambiguities: string[];
  nextQuestion: string;
  confidence: number;
  replace?: Record<string, any>;
  /** Phase 3: token usage and cost estimate (OpenAI path only). */
  usage?: ExtractionUsage;
  /** Phase 3: prompt contract version used for extraction. */
  promptVersion?: string;
}
