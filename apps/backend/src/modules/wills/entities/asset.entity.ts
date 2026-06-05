import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { Will } from './will.entity';
import { AssetAllocation } from './asset-allocation.entity';

@Entity('assets')
@Index('idx_assets_will_id', ['will'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Will, (will) => will.assets, { onDelete: 'CASCADE' })
  will: Will;

  @Column({ type: 'varchar', length: 100 })
  asset_type: string; // PROPERTY, BANK_ACCOUNT, INVESTMENT, VEHICLE, JEWELRY, etc.

  @Column({ type: 'varchar', length: 255 })
  asset_name: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  estimated_value: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Relations
  @OneToMany(() => AssetAllocation, (allocation) => allocation.asset, { cascade: true })
  asset_allocations: AssetAllocation[];
}
