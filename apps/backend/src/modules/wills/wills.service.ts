import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Will } from './entities/will.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WillsService {
  constructor(
    @InjectRepository(Will)
    private willsRepository: Repository<Will>,
  ) {}

  async create(userId: string, title?: string): Promise<Will> {
    const will = this.willsRepository.create({
      user: { id: userId },
      status: 'DRAFT',
      completion_percentage: 0,
    });
    return this.willsRepository.save(will);
  }

  async findById(willId: string): Promise<Will> {
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

  async findByUserIdAndWillId(userId: string, willId: string): Promise<Will> {
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

  async updateWill(willId: string, updates: Partial<Will>): Promise<Will> {
    await this.willsRepository.update(willId, updates);
    return this.findById(willId);
  }

  async updateCompletionPercentage(willId: string, percentage: number): Promise<Will> {
    return this.updateWill(willId, { completion_percentage: percentage });
  }

  async deleteWill(willId: string): Promise<void> {
    await this.willsRepository.delete(willId);
  }
}
