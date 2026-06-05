import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WillsModule } from './modules/wills/wills.module';
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
      migrations: ['src/migrations/*.ts'],
      synchronize:
        process.env.TYPEORM_SYNCHRONIZE === 'true' || process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    WillsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
