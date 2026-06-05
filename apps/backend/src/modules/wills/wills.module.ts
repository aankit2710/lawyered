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

@Module({
  imports: [
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
  providers: [WillsService],
  controllers: [WillsController],
  exports: [WillsService],
})
export class WillsModule {}
