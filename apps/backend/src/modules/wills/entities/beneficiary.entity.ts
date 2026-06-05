import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { Will } from './will.entity';
import { AssetAllocation } from './asset-allocation.entity';

@Entity('beneficiaries')
@Index('idx_beneficiaries_will_id', ['will'])
export class Beneficiary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Will, (will) => will.beneficiaries, { onDelete: 'CASCADE' })
  will: Will;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relationship: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Relations
  @OneToMany(() => AssetAllocation, (allocation) => allocation.beneficiary, { cascade: true })
  asset_allocations: AssetAllocation[];
}
