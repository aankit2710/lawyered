import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Will } from './entities/will.entity';
import { WillSnapshot } from './entities/will-snapshot.entity';
import { WillSnapshotState } from './memory/will-snapshot-state';
import { validateSnapshotState } from './memory/snapshot-schema';

@Injectable()
export class SnapshotService {
  constructor(
    @InjectRepository(Will)
    private readonly willsRepository: Repository<Will>,
    @InjectRepository(WillSnapshot)
    private readonly snapshotRepository: Repository<WillSnapshot>
  ) {}

  async createInitialSnapshot(willId: string): Promise<WillSnapshotState> {
    const will = await this.getWillOrThrow(willId);
    const existing = await this.getLatestSnapshotEntity(willId);

    if (existing) {
      return this.normalizeSnapshot(existing.snapshot, will.title);
    }

    const snapshot = this.getDefaultSnapshot(will.title);
    await this.persistSnapshot(willId, snapshot);
    return snapshot;
  }

  async loadSnapshot(willId: string): Promise<WillSnapshotState> {
    const will = await this.getWillOrThrow(willId);
    const latest = await this.getLatestSnapshotEntity(willId);

    if (!latest) {
      return this.createInitialSnapshot(willId);
    }

    return this.normalizeSnapshot(latest.snapshot, will.title);
  }

  async updateSnapshot(
    willId: string,
    updates: Partial<WillSnapshotState>
  ): Promise<WillSnapshotState> {
    const current = await this.loadSnapshot(willId);
    const next = this.mergeSnapshot(current, updates);
    await this.persistSnapshot(willId, next);
    return next;
  }

  async persistSnapshot(willId: string, snapshot: WillSnapshotState): Promise<WillSnapshot> {
    const validation = validateSnapshotState(snapshot);
    if (!validation.valid) {
      throw new Error(`Invalid snapshot state: ${validation.errors.join('; ')}`);
    }

    const snapshotEntity = this.snapshotRepository.create({
      will: { id: willId },
      snapshot,
    });
    return this.snapshotRepository.save(snapshotEntity);
  }

  async getSnapshotHistory(willId: string): Promise<WillSnapshot[]> {
    await this.getWillOrThrow(willId);
    return this.snapshotRepository.find({
      where: { will: { id: willId } },
      order: { created_at: 'ASC' },
    });
  }

  getDefaultSnapshot(title?: string): WillSnapshotState {
    return {
      title: title || 'Untitled Will',
      testator: {
        name: null,
        age: null,
        address: null,
        soundMind: true,
      },
      assets: [],
      beneficiaries: [],
      allocations: [],
      executor: null,
      guardian: null,
      witnesses: [],

      askedQuestions: [],
      lastNextQuestion: undefined,
      pendingClarification: null,
    };
  }

  private async getWillOrThrow(willId: string): Promise<Will> {
    const will = await this.willsRepository.findOne({ where: { id: willId } });
    if (!will) {
      throw new NotFoundException('Will not found');
    }
    return will;
  }

  private async getLatestSnapshotEntity(willId: string): Promise<WillSnapshot | null> {
    return this.snapshotRepository.findOne({
      where: { will: { id: willId } },
      order: { created_at: 'DESC' },
    });
  }

  private normalizeSnapshot(snapshot: Record<string, any>, title?: string): WillSnapshotState {
    return this.mergeSnapshot(this.getDefaultSnapshot(title), snapshot);
  }

  private mergeSnapshot(base: WillSnapshotState, updates: Record<string, any>): WillSnapshotState {
    return {
      title: typeof updates?.title === 'string' ? updates.title : base.title,
      testator: {
        ...base.testator,
        ...(updates?.testator || {}),
      },
      assets: Array.isArray(updates?.assets) ? updates.assets : base.assets,
      beneficiaries: Array.isArray(updates?.beneficiaries)
        ? updates.beneficiaries
        : base.beneficiaries,
      allocations: Array.isArray(updates?.allocations) ? updates.allocations : base.allocations,
      executor: updates?.executor ?? base.executor,
      guardian: updates?.guardian ?? base.guardian,
      witnesses: Array.isArray(updates?.witnesses) ? updates.witnesses : base.witnesses,

      askedQuestions: Array.isArray(updates?.askedQuestions)
        ? updates.askedQuestions
        : base.askedQuestions || [],
      lastNextQuestion:
        typeof updates?.lastNextQuestion === 'string'
          ? updates.lastNextQuestion
          : base.lastNextQuestion,
      pendingClarification: Object.prototype.hasOwnProperty.call(updates, 'pendingClarification')
        ? updates.pendingClarification
        : base.pendingClarification,
    };
  }
}
