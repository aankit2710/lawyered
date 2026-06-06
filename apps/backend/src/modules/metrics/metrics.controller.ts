import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiMetricsService } from './ai-metrics.service';

@SkipThrottle()
@UseGuards(JwtAuthGuard)
@Controller('metrics')
export class MetricsController {
  constructor(private readonly aiMetrics: AiMetricsService) {}

  @Get()
  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      ai: this.aiMetrics.getSummary(),
    };
  }
}
