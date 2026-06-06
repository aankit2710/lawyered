import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateWillDto } from './dto/update-will.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Will } from './entities/will.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { SnapshotService } from './snapshot.service';

@Injectable()
export class WillsService {
  constructor(
    @InjectRepository(Will)
    private readonly willsRepository: Repository<Will>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly snapshotService: SnapshotService
  ) {}

  async create(userId: string, title?: string): Promise<Will> {
    const will = await this.willsRepository.save(
      this.willsRepository.create({
        user: { id: userId },
        title: title?.trim() || 'Untitled Will',
        status: 'DRAFT',
        completion_percentage: 0,
      })
    );

    await this.snapshotService.createInitialSnapshot(will.id);

    return will;
  }

  async saveChatMessage(
    willId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: Record<string, any>
  ): Promise<ChatMessage> {
    const message = this.chatMessageRepository.create({
      will: { id: willId },
      role,
      content,
      metadata: metadata ?? undefined,
    } as DeepPartial<ChatMessage>);

    return this.chatMessageRepository.save(message) as Promise<ChatMessage>;
  }

  async findById(willId: string): Promise<Will | null> {
    return this.willsRepository.findOne({
      where: { id: willId },
      relations: [
        'beneficiaries',
        'assets',
        'executors',
        'guardians',
        'witnesses',
        'chat_messages',
        'snapshots',
      ],
    });
  }

  async findByUserIdAndWillId(userId: string, willId: string): Promise<Will | null> {
    return this.willsRepository.findOne({
      where: { id: willId, user: { id: userId } },
      relations: [
        'beneficiaries',
        'assets',
        'executors',
        'guardians',
        'witnesses',
        'chat_messages',
        'snapshots',
      ],
    });
  }

  async findAllByUserId(userId: string): Promise<Will[]> {
    return this.willsRepository.find({
      where: { user: { id: userId } },
      relations: [
        'beneficiaries',
        'assets',
        'executors',
        'guardians',
        'witnesses',
        'chat_messages',
        'snapshots',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async updateWill(willId: string, updates: UpdateWillDto): Promise<Will | null> {
    const payload: Partial<Will> = {};

    if (updates.title !== undefined) {
      payload.title = updates.title.trim();
    }
    if (updates.status !== undefined) {
      payload.status = updates.status;
    }

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('At least one of title or status is required');
    }

    await this.willsRepository.update(willId, payload);
    return this.findById(willId);
  }

  async syncValidationFields(
    willId: string,
    fields: { completion_percentage: number; status: string },
  ): Promise<void> {
    await this.willsRepository.update(willId, fields);
  }

  async updateCompletionPercentage(willId: string, percentage: number): Promise<Will | null> {
    await this.willsRepository.update(willId, { completion_percentage: percentage });
    return this.findById(willId);
  }

  async deleteWill(willId: string): Promise<void> {
    await this.willsRepository.delete(willId);
  }
}
