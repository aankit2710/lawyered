import { WillSnapshotState } from './will-snapshot-state';

export interface SnapshotValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSnapshotState(snapshot: WillSnapshotState): SnapshotValidationResult {
  const errors: string[] = [];

  if (!snapshot || typeof snapshot !== 'object') {
    return { valid: false, errors: ['Snapshot must be an object'] };
  }

  if (!snapshot.testator || typeof snapshot.testator !== 'object') {
    errors.push('testator must be an object');
  } else {
    if (typeof snapshot.testator.soundMind !== 'boolean') {
      errors.push('testator.soundMind must be a boolean');
    }
  }

  for (const field of ['assets', 'beneficiaries', 'allocations', 'witnesses'] as const) {
    if (!Array.isArray(snapshot[field])) {
      errors.push(`${field} must be an array`);
    }
  }

  if (snapshot.executor !== null && snapshot.executor !== undefined) {
    if (typeof snapshot.executor !== 'object' || Array.isArray(snapshot.executor)) {
      errors.push('executor must be an object or null');
    }
  }

  if (snapshot.guardian !== null && snapshot.guardian !== undefined) {
    if (typeof snapshot.guardian !== 'object' || Array.isArray(snapshot.guardian)) {
      errors.push('guardian must be an object or null');
    }
  }

  if (snapshot.askedQuestions !== undefined && !Array.isArray(snapshot.askedQuestions)) {
    errors.push('askedQuestions must be an array when provided');
  }

  return { valid: errors.length === 0, errors };
}
