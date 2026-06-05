import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Will } from './will.entity';

@Entity('guardians')
@Index('idx_guardians_will_id', ['will'])
export class Guardian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Will, will => will.guardians, { onDelete: 'CASCADE' })
  will: Will;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relationship: string;

  @Column({ type: 'boolean', default: true })
  for_minors: boolean; // true if guardian for minors, false if for other dependents

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
