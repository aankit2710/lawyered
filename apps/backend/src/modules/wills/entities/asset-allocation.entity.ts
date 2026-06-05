import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Beneficiary } from './beneficiary.entity';

@Entity('asset_allocations')
@Unique(['asset', 'beneficiary'])
@Index('idx_asset_allocations_asset', ['asset'])
@Index('idx_asset_allocations_beneficiary', ['beneficiary'])
export class AssetAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, asset => asset.asset_allocations, { onDelete: 'CASCADE' })
  asset: Asset;

  @ManyToOne(() => Beneficiary, beneficiary => beneficiary.asset_allocations, {
    onDelete: 'CASCADE',
  })
  beneficiary: Beneficiary;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  percentage: number; // 0-100

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
