import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Will } from './will.entity';

@Entity('chat_messages')
@Index('idx_chat_messages_will_id', ['will'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Will, (will) => will.chat_messages, { onDelete: 'CASCADE' })
  will: Will;

  @Column({ type: 'varchar', length: 20 })
  role: string; // 'user' or 'assistant'

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Optional: extraction results, confidence, etc.

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
