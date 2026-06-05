import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Will } from './will.entity';

@Entity('witnesses')
@Index('idx_witnesses_will_id', ['will'])
export class Witness {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Will, will => will.witnesses, { onDelete: 'CASCADE' })
  will: Will;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'date', nullable: true })
  signature_date: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
