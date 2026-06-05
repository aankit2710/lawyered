export type WillSummary = {
  id: string;
  title: string;
  status: string;
  completion_percentage: number;
  created_at: string;
};

export type SnapshotState = {
  title?: string;
  testator: {
    name: string | null;
    age: number | null;
    address: string | null;
    soundMind: boolean;
  };
  assets: Array<Record<string, unknown>>;
  beneficiaries: Array<Record<string, unknown>>;
  allocations: Array<Record<string, unknown>>;
  executor: Record<string, unknown> | null;
  guardian: Record<string, unknown> | null;
  witnesses: Array<Record<string, unknown>>;
  askedQuestions?: string[];
  lastNextQuestion?: string;
  pendingClarification?: {
    ambiguity?: string;
    question: string;
    createdAt: string;
  } | null;
};

export type ValidationIssue = {
  code: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
  critical?: boolean;
};

export type ValidationResult = {
  status: 'COMPLETE' | 'INCOMPLETE' | 'INVALID' | 'VALID_WITH_WARNINGS';
  completeness: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  criticalErrors: ValidationIssue[];
  missingFields: string[];
  canProceed: boolean;
  summary: string;
};

export type ExtractionResult = {
  updates?: Record<string, unknown>;
  missingFields?: string[];
  ambiguities?: string[];
  nextQuestion?: string;
  confidence?: number;
};

export type ChatEntry = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  extraction?: ExtractionResult;
};

export type ChatResponse = {
  message: string;
  snapshot: SnapshotState;
  extraction: ExtractionResult;
  gated?: boolean;
  pendingClarification?: SnapshotState['pendingClarification'];
};

export type WillDetail = WillSummary & {
  chat_messages?: Array<{
    id: string;
    role: string;
    content: string;
    metadata?: { extraction?: ExtractionResult };
    created_at: string;
  }>;
};

export type SnapshotHistoryItem = {
  id: string;
  snapshot: SnapshotState;
  created_at: string;
};
