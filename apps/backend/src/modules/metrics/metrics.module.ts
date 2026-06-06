import { Global, Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { AiMetricsService } from './ai-metrics.service';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [AiMetricsService],
  exports: [AiMetricsService],
})
export class MetricsModule {}
