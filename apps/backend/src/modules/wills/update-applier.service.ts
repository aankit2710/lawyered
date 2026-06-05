import { Injectable } from '@nestjs/common';
import { ExtractionResult, WillSnapshotState } from './memory/will-snapshot-state';

@Injectable()
export class UpdateApplierService {
  apply(
    snapshot: WillSnapshotState,
    extraction: ExtractionResult,
    title: string
  ): WillSnapshotState {
    const updates = this.asObject(extraction.updates);
    const replace = this.asObject(extraction.replace);

    return {
      ...snapshot,
      title: title || snapshot.title,
      testator: this.mergeTestator(snapshot, updates, replace),
      assets: this.resolveArray(snapshot.assets, updates.assets, replace.assets),
      beneficiaries: this.resolveArray(
        snapshot.beneficiaries,
        updates.beneficiaries,
        replace.beneficiaries
      ),
      allocations: this.resolveArray(
        snapshot.allocations,
        updates.allocations,
        replace.allocations
      ),
      executor: this.resolveObject(snapshot.executor, updates.executor, replace.executor),
      guardian: this.resolveObject(snapshot.guardian, updates.guardian, replace.guardian),
      witnesses: this.resolveArray(snapshot.witnesses, updates.witnesses, replace.witnesses),
      askedQuestions: snapshot.askedQuestions,
      lastNextQuestion: snapshot.lastNextQuestion,
      pendingClarification: snapshot.pendingClarification,
    };
  }

  private mergeTestator(
    snapshot: WillSnapshotState,
    updates: Record<string, any>,
    replace: Record<string, any>
  ) {
    return {
      ...snapshot.testator,
      ...(this.asObject(updates.testator) || {}),
      ...(this.asObject(replace.testator) || {}),
    };
  }

  private resolveArray(
    current: Array<Record<string, any>>,
    directValue: any,
    replaceValue: any
  ): Array<Record<string, any>> {
    if (Array.isArray(replaceValue)) {
      return replaceValue;
    }

    if (Array.isArray(directValue)) {
      return directValue;
    }

    return current;
  }

  private resolveObject(
    current: Record<string, any> | null,
    directValue: any,
    replaceValue: any
  ): Record<string, any> | null {
    if (replaceValue && typeof replaceValue === 'object' && !Array.isArray(replaceValue)) {
      return replaceValue;
    }

    if (directValue && typeof directValue === 'object' && !Array.isArray(directValue)) {
      return { ...(current || {}), ...directValue };
    }

    return current;
  }

  private asObject(value: any): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }
}
