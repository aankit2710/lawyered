import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';

@SkipThrottle()
@Controller()
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get('health')
  async getHealth(@Res({ passthrough: true }) res: Response) {
    const database = await this.pingDatabase();
    const ok = database === 'up';

    if (!ok) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database,
        api: 'up',
      },
    };
  }

  @Get('ready')
  async getReadiness(@Res({ passthrough: true }) res: Response) {
    const database = await this.pingDatabase();
    const ready = database === 'up';

    if (!ready) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      ready,
      status: ready ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database,
        api: 'up',
      },
    };
  }

  private async pingDatabase(): Promise<'up' | 'down'> {
    try {
      await this.dataSource.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }
}
