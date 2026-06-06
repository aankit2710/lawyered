import { Injectable } from '@nestjs/common';
import { ExtractionUsage } from '../ai/extraction-contract';

export interface AiMetricsSummary {
  totalRequests: number;
  openAiRequests: number;
  fallbackRequests: number;
  totalTokens: number;
  estimatedCostUsd: number;
  averageTokensPerRequest: number;
  model: string;
  uptimeSeconds: number;
  lastUpdated: string | null;
}

@Injectable()
export class AiMetricsService {
  private readonly startedAt = Date.now();
  private totalRequests = 0;
  private openAiRequests = 0;
  private fallbackRequests = 0;
  private totalTokens = 0;
  private estimatedCostUsd = 0;
  private lastUpdated: Date | null = null;
  private readonly model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  recordExtraction(source: 'openai' | 'fallback', usage?: ExtractionUsage) {
    this.totalRequests += 1;
    if (source === 'openai') {
      this.openAiRequests += 1;
    } else {
      this.fallbackRequests += 1;
    }

    if (usage) {
      this.totalTokens += usage.totalTokens;
      this.estimatedCostUsd += usage.estimatedCostUsd;
    }

    this.lastUpdated = new Date();
  }

  getSummary(): AiMetricsSummary {
    const avg =
      this.openAiRequests > 0 ? Math.round(this.totalTokens / this.openAiRequests) : 0;

    return {
      totalRequests: this.totalRequests,
      openAiRequests: this.openAiRequests,
      fallbackRequests: this.fallbackRequests,
      totalTokens: this.totalTokens,
      estimatedCostUsd: Number(this.estimatedCostUsd.toFixed(6)),
      averageTokensPerRequest: avg,
      model: this.model,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      lastUpdated: this.lastUpdated?.toISOString() ?? null,
    };
  }
}
