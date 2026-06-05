import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Will } from './will.entity';

@Entity('will_snapshots')
@Index('idx_will_snapshots_will_id', ['will'])
export class WillSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Will, will => will.snapshots, { onDelete: 'CASCADE' })
  will: Will;

  @Column({ type: 'jsonb' })
  snapshot: Record<string, any>; // Snapshot of entire will state at a point in time
  // {
  //   testator: { name, age, address, dob, sound_mind },
  //   beneficiaries: [...],
  //   assets: [...],
  //   allocations: [...],
  //   executors: [...],
  //   guardians: [...],
  //   witnesses: [...],
  //   timestamp: ISO8601
  // }

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
