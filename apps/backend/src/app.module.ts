import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WillsModule } from './modules/wills/wills.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { User } from './modules/users/entities/user.entity';
import { Will } from './modules/wills/entities/will.entity';
import { Beneficiary } from './modules/wills/entities/beneficiary.entity';
import { Asset } from './modules/wills/entities/asset.entity';
import { AssetAllocation } from './modules/wills/entities/asset-allocation.entity';
import { Executor } from './modules/wills/entities/executor.entity';
import { Guardian } from './modules/wills/entities/guardian.entity';
import { Witness } from './modules/wills/entities/witness.entity';
import { ChatMessage } from './modules/wills/entities/chat-message.entity';
import { WillSnapshot } from './modules/wills/entities/will-snapshot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL_MS ?? '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'lawyered',
      entities: [
        User,
        Will,
        Beneficiary,
        Asset,
        AssetAllocation,
        Executor,
        Guardian,
        Witness,
        ChatMessage,
        WillSnapshot,
      ],
      migrations: [join(__dirname, 'migrations', '*.js')],
      synchronize:
        process.env.TYPEORM_SYNCHRONIZE === 'true' ||
        (process.env.NODE_ENV !== 'production' && process.env.TYPEORM_SYNCHRONIZE !== 'false'),
      logging: process.env.NODE_ENV === 'development',
      extra: {
        max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      },
    }),
    HealthModule,
    MetricsModule,
    AuthModule,
    UsersModule,
    WillsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
