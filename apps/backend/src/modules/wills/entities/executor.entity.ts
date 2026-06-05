import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Will } from './will.entity';

@Entity('executors')
@Index('idx_executors_will_id', ['will'])
export class Executor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Will, will => will.executors, { onDelete: 'CASCADE' })
  will: Will;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relationship: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_number: string;

  @Column({ type: 'boolean', default: false })
  primary_backup: boolean; // true for primary executor, false for backup

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
