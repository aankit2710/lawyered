import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WillsService } from './wills.service';
import { WillsController } from './wills.controller';
import { Will } from './entities/will.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { Asset } from './entities/asset.entity';
import { AssetAllocation } from './entities/asset-allocation.entity';
import { Executor } from './entities/executor.entity';
import { Guardian } from './entities/guardian.entity';
import { Witness } from './entities/witness.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { WillSnapshot } from './entities/will-snapshot.entity';
import { AiModule } from '../ai/ai.module';
import { ChatService } from './chat.service';
import { SnapshotService } from './snapshot.service';
import { UpdateApplierService } from './update-applier.service';
import { ValidationService } from './validation.service';
import { ClarifyService } from './clarify.service';

@Module({
  imports: [
    AiModule,
    TypeOrmModule.forFeature([
      Will,
      Beneficiary,
      Asset,
      AssetAllocation,
      Executor,
      Guardian,
      Witness,
      ChatMessage,
      WillSnapshot,
    ]),
  ],
  providers: [
    WillsService,
    SnapshotService,
    UpdateApplierService,
    ValidationService,
    ChatService,
    ClarifyService,
  ],

  controllers: [WillsController],
  exports: [WillsService, SnapshotService, ChatService],
})
export class WillsModule {}
