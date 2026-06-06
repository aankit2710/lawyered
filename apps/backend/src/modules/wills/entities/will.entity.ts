import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Beneficiary } from './beneficiary.entity';
import { Asset } from './asset.entity';
import { Executor } from './executor.entity';
import { Guardian } from './guardian.entity';
import { Witness } from './witness.entity';
import { ChatMessage } from './chat-message.entity';
import { WillSnapshot } from './will-snapshot.entity';

@Entity('wills')
@Index('idx_wills_user_id', ['user'])
@Index('idx_wills_user_created', ['user', 'created_at'])
export class Will {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.wills, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 255, default: 'Untitled Will' })
  title: string;

  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  status: string; // DRAFT, INCOMPLETE, COMPLETE, FINALIZED, EXECUTED

  // Testator Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  testator_name: string;

  @Column({ type: 'int', nullable: true })
  testator_age: number;

  @Column({ type: 'text', nullable: true })
  testator_address: string;

  @Column({ type: 'date', nullable: true })
  testator_dob: Date;

  @Column({ type: 'boolean', default: true })
  sound_mind: boolean;

  // Revocation Clause
  @Column({ type: 'text', nullable: true })
  revocation_clause: string;

  // Completion Tracking
  @Column({ type: 'int', default: 0 })
  completion_percentage: number;

  // Timestamps
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @OneToMany(() => Beneficiary, beneficiary => beneficiary.will, { cascade: true })
  beneficiaries: Beneficiary[];

  @OneToMany(() => Asset, asset => asset.will, { cascade: true })
  assets: Asset[];

  @OneToMany(() => Executor, executor => executor.will, { cascade: true })
  executors: Executor[];

  @OneToMany(() => Guardian, guardian => guardian.will, { cascade: true })
  guardians: Guardian[];

  @OneToMany(() => Witness, witness => witness.will, { cascade: true })
  witnesses: Witness[];

  @OneToMany(() => ChatMessage, message => message.will, { cascade: true })
  chat_messages: ChatMessage[];

  @OneToMany(() => WillSnapshot, snapshot => snapshot.will, { cascade: true })
  snapshots: WillSnapshot[];
}
