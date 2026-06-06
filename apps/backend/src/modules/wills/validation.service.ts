import { Injectable } from '@nestjs/common';
import { SnapshotService } from './snapshot.service';
import { WillsService } from './wills.service';
import { WillSnapshotState } from './memory/will-snapshot-state';

export type ValidationStatus = 'COMPLETE' | 'INCOMPLETE' | 'INVALID' | 'VALID_WITH_WARNINGS';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  code: string;
  field: string;
  message: string;
  severity: ValidationSeverity;
  critical?: boolean;
}

export interface ValidationResult {
  status: ValidationStatus;
  completeness: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  criticalErrors: ValidationIssue[];
  missingFields: string[];
  canProceed: boolean;
  summary: string;
}

@Injectable()
export class ValidationService {
  constructor(
    private readonly snapshotService: SnapshotService,
    private readonly willsService: WillsService
  ) {}

  async validateWill(willId: string): Promise<ValidationResult> {
    const snapshot = await this.snapshotService.loadSnapshot(willId);
    const result = this.evaluateSnapshot(snapshot);

    await this.willsService.syncValidationFields(willId, {
      completion_percentage: result.completeness,
      status: result.status,
    });

    return result;
  }

  evaluateSnapshot(snapshot: WillSnapshotState): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const missingFields = new Set<string>();
    let score = 0;

    const testator = this.asObject(snapshot.testator);
    const executor = this.asObject(snapshot.executor);
    const guardian = this.asObject(snapshot.guardian);
    const assets = this.asArray(snapshot.assets);
    const beneficiaries = this.asArray(snapshot.beneficiaries);
    const allocations = this.asArray(snapshot.allocations);
    const witnesses = this.asArray(snapshot.witnesses);

    score += this.validateTestator(testator, errors, missingFields);
    score += this.validateExecutor(executor, errors, missingFields);
    score += this.validateWitnesses(witnesses, errors, missingFields);
    score += this.validateAssets(assets, warnings, errors, missingFields);
    score += this.validateAllocations(assets, allocations, errors, missingFields);
    score += this.validateBeneficiariesRequired(beneficiaries, errors, missingFields);
    score += this.validateGuardian(beneficiaries, guardian, errors, missingFields);

    this.validateBeneficiaryWarnings(beneficiaries, warnings);

    const criticalErrors = errors.filter(issue => issue.critical);
    const completeness = Math.max(0, Math.min(100, Math.round(score)));
    const status = this.resolveStatus(completeness, errors, warnings, criticalErrors);

    return {
      status,
      completeness,
      errors,
      warnings,
      criticalErrors,
      missingFields: Array.from(missingFields),
      canProceed: criticalErrors.length === 0 && errors.length === 0,
      summary: this.buildSummary(status, errors, warnings, missingFields),
    };
  }

  private validateTestator(
    testator: Record<string, any>,
    errors: ValidationIssue[],
    missingFields: Set<string>
  ): number {
    let score = 0;

    if (this.isPresent(testator.name)) {
      score += 10;
    } else {
      this.addError(errors, missingFields, {
        code: 'testator_name_missing',
        field: 'testator.name',
        message: 'Testator name is required.',
      });
    }

    if (this.isPositiveNumber(testator.age)) {
      score += 10;
    } else {
      this.addError(errors, missingFields, {
        code: 'testator_age_missing',
        field: 'testator.age',
        message: 'Testator age is required and must be a positive number.',
      });
    }

    if (this.isPresent(testator.address)) {
      score += 10;
    } else {
      this.addError(errors, missingFields, {
        code: 'testator_address_missing',
        field: 'testator.address',
        message: 'Testator address is required.',
      });
    }

    return score;
  }

  private validateExecutor(
    executor: Record<string, any>,
    errors: ValidationIssue[],
    missingFields: Set<string>
  ): number {
    if (!this.isObject(executor)) {
      this.addError(errors, missingFields, {
        code: 'executor_missing',
        field: 'executor',
        message: 'Executor is required and must include a name and contact number.',
        critical: true,
      });
      missingFields.add('executor.name');
      missingFields.add('executor.contact_number');
      return 0;
    }

    let score = 0;

    if (this.isPresent(executor.name)) {
      score += 10;
    } else {
      this.addError(errors, missingFields, {
        code: 'executor_name_missing',
        field: 'executor.name',
        message: 'Executor name is required.',
      });
    }

    if (this.isPresent(this.executorContact(executor))) {
      score += 10;
    } else {
      this.addError(errors, missingFields, {
        code: 'executor_contact_missing',
        field: 'executor.contact',
        message: 'Executor contact number is required.',
      });
    }

    return score;
  }

  private validateWitnesses(
    witnesses: Array<Record<string, any>>,
    errors: ValidationIssue[],
    missingFields: Set<string>
  ): number {
    if (witnesses.length < 2) {
      this.addError(errors, missingFields, {
        code: 'witness_count_insufficient',
        field: 'witnesses',
        message: 'At least 2 witnesses are required.',
        critical: true,
      });
      return 0;
    }

    let score = 0;
    const requiredWitnesses = witnesses.slice(0, 2);

    requiredWitnesses.forEach((witness, index) => {
      const prefix = `witnesses[${index}]`;

      if (!this.isPresent(witness.name)) {
        this.addError(errors, missingFields, {
          code: 'witness_name_missing',
          field: `${prefix}.name`,
          message: `Witness ${index + 1} name is required.`,
        });
      }

      if (!this.isPresent(witness.signature_date)) {
        this.addError(errors, missingFields, {
          code: 'witness_signature_date_missing',
          field: `${prefix}.signature_date`,
          message: `Witness ${index + 1} signature date is required.`,
        });
      }

      if (this.isPresent(witness.name) && this.isPresent(witness.signature_date)) {
        score += 10;
      }
    });

    return score;
  }

  private validateAssets(
    assets: Array<Record<string, any>>,
    warnings: ValidationIssue[],
    errors: ValidationIssue[],
    missingFields: Set<string>
  ): number {
    if (assets.length === 0) {
      this.addError(errors, missingFields, {
        code: 'assets_missing',
        field: 'assets',
        message: 'At least 1 asset is required.',
      });
      return 0;
    }

    assets.forEach((asset, index) => {
      if (!this.isPresent(asset.estimated_value)) {
        warnings.push({
          code: 'asset_value_missing',
          field: `assets[${index}].estimated_value`,
          message: `Asset ${index + 1} is missing an estimated value.`,
          severity: 'warning',
        });
      }
    });

    return 10;
  }

  private validateAllocations(
    assets: Array<Record<string, any>>,
    allocations: Array<Record<string, any>>,
    errors: ValidationIssue[],
    missingFields: Set<string>
  ): number {
    if (assets.length === 0) {
      return 0;
    }

    if (allocations.length === 0) {
      this.addError(errors, missingFields, {
        code: 'allocations_missing',
        field: 'allocations',
        message: 'Asset allocations are required.',
      });
      return 0;
    }

    const matchesByAsset = new Map<string, Array<Record<string, any>>>();
    const unassigned: Array<Record<string, any>> = [];

    allocations.forEach(allocation => {
      const assetKey = this.resolveAllocationAssetKey(allocation, assets);
      if (!assetKey) {
        unassigned.push(allocation);
        return;
      }

      const existing = matchesByAsset.get(assetKey) || [];
      existing.push(allocation);
      matchesByAsset.set(assetKey, existing);
    });

    if (unassigned.length > 0) {
      this.addError(errors, missingFields, {
        code: 'allocation_asset_missing',
        field: 'allocations.asset_id',
        message: 'One or more allocations could not be linked to an asset.',
      });
    }

    if (assets.length > 1 && matchesByAsset.size === 0) {
      this.addError(errors, missingFields, {
        code: 'allocation_asset_mapping_missing',
        field: 'allocations',
        message: 'Allocations must identify which asset they belong to.',
      });
      return 0;
    }

    let score = 0;
    let allAssetsValid = true;

    assets.forEach((asset, index) => {
      const assetKey = this.getAssetKey(asset, index);
      const assetAllocations =
        matchesByAsset.get(assetKey) || (assets.length === 1 ? allocations : []);

      if (assetAllocations.length === 0) {
        allAssetsValid = false;
        this.addError(errors, missingFields, {
          code: 'allocation_missing_for_asset',
          field: `allocations[${assetKey}]`,
          message: `Allocations are missing for asset ${this.getAssetLabel(asset, index)}.`,
        });
        return;
      }

      const total = assetAllocations.reduce((sum, allocation) => {
        return sum + this.allocationPercent(allocation);
      }, 0);

      if (Math.abs(total - 100) <= 0.01) {
        score += 10;
      } else {
        allAssetsValid = false;
        this.addError(errors, missingFields, {
          code: 'allocation_percentage_invalid',
          field: `allocations[${assetKey}]`,
          message: `Allocations for asset ${this.getAssetLabel(asset, index)} must sum to 100%. Current total is ${total.toFixed(2)}%.`,
        });
      }
    });

    return allAssetsValid ? 10 : score;
  }

  private validateGuardian(
    beneficiaries: Array<Record<string, any>>,
    guardian: Record<string, any>,
    errors: ValidationIssue[],
    missingFields: Set<string>
  ): number {
    const hasMinorBeneficiary = beneficiaries.some(beneficiary => this.isMinor(beneficiary));

    if (hasMinorBeneficiary) {
      if (!this.isObject(guardian) || !this.isPresent(guardian.name)) {
        this.addError(errors, missingFields, {
          code: 'guardian_missing',
          field: 'guardian',
          message: 'A guardian is required when a beneficiary is a minor.',
        });
        return 0;
      }
      return 10;
    }

    return 10;
  }

  private validateBeneficiariesRequired(
    beneficiaries: Array<Record<string, any>>,
    errors: ValidationIssue[],
    missingFields: Set<string>
  ): number {
    if (beneficiaries.length === 0) {
      this.addError(errors, missingFields, {
        code: 'beneficiaries_missing',
        field: 'beneficiaries',
        message: 'At least 1 beneficiary is required.',
      });
      return 0;
    }

    return 10;
  }

  private validateBeneficiaryWarnings(
    beneficiaries: Array<Record<string, any>>,
    warnings: ValidationIssue[]
  ): void {
    beneficiaries.forEach((beneficiary, index) => {
      if (!this.isPresent(beneficiary.relationship)) {
        warnings.push({
          code: 'beneficiary_relationship_missing',
          field: `beneficiaries[${index}].relationship`,
          message: `Beneficiary ${index + 1} relationship is missing.`,
          severity: 'warning',
        });
      }
    });
  }

  private resolveStatus(
    completeness: number,
    errors: ValidationIssue[],
    warnings: ValidationIssue[],
    criticalErrors: ValidationIssue[]
  ): ValidationStatus {
    if (criticalErrors.length > 0) {
      return 'INVALID';
    }

    if (errors.length > 0) {
      return 'INCOMPLETE';
    }

    if (warnings.length > 0) {
      return 'VALID_WITH_WARNINGS';
    }

    return completeness >= 100 ? 'COMPLETE' : 'INCOMPLETE';
  }

  private buildSummary(
    status: ValidationStatus,
    errors: ValidationIssue[],
    warnings: ValidationIssue[],
    missingFields: Set<string>
  ): string {
    if (status === 'COMPLETE') {
      return 'Will is complete and ready for final review.';
    }

    if (status === 'VALID_WITH_WARNINGS') {
      return `Will is valid with ${warnings.length} warning${warnings.length === 1 ? '' : 's'}.`;
    }

    if (errors.length > 0) {
      const primary = errors.slice(0, 2).map(issue => issue.message);
      return `Missing ${primary.join(' ')}`.trim();
    }

    if (missingFields.size > 0) {
      return `Missing fields: ${Array.from(missingFields).slice(0, 3).join(', ')}`;
    }

    return 'Will needs additional information.';
  }

  private resolveAllocationAssetKey(
    allocation: Record<string, any>,
    assets: Array<Record<string, any>>
  ): string | null {
    const directCandidates = [
      allocation.asset_id,
      allocation.assetId,
      allocation.asset?.id,
      allocation.asset?.asset_id,
      allocation.asset?.assetId,
    ];

    for (const candidate of directCandidates) {
      if (this.isPresent(candidate)) {
        return this.normalizeKey(candidate);
      }
    }

    const assetName = this.firstPresentString(
      allocation.asset_name,
      allocation.assetName,
      allocation.name
    );

    if (assetName) {
      const match = assets.find(asset => {
        const labels = [
          asset.id,
          asset.asset_id,
          asset.assetId,
          asset.asset_name,
          asset.assetName,
          asset.name,
        ];

        return labels.some(
          label =>
            this.isPresent(label) && this.normalizeKey(label) === this.normalizeKey(assetName)
        );
      });

      if (match) {
        return this.getAssetKey(match, assets.indexOf(match));
      }
    }

    if (assets.length === 1) {
      return this.getAssetKey(assets[0], 0);
    }

    return null;
  }

  private getAssetKey(asset: Record<string, any>, index: number): string {
    return this.normalizeKey(
      asset.id ||
        asset.asset_id ||
        asset.assetId ||
        asset.asset_name ||
        asset.assetName ||
        `asset-${index}`
    );
  }

  private getAssetLabel(asset: Record<string, any>, index: number): string {
    return (
      this.firstPresentString(asset.asset_name, asset.assetName, asset.name) || `asset ${index + 1}`
    );
  }

  private addError(
    errors: ValidationIssue[],
    missingFields: Set<string>,
    issue: Omit<ValidationIssue, 'severity'>
  ): void {
    errors.push({
      ...issue,
      severity: 'error',
    });
    missingFields.add(issue.field);
  }

  private asObject(value: any): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  private asArray(value: any): Array<Record<string, any>> {
    return Array.isArray(value) ? value : [];
  }

  private isObject(value: any): value is Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  private isPresent(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return true;
  }

  private isPositiveNumber(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0;
  }

  private executorContact(executor: Record<string, any>): string | null {
    return this.firstPresentString(executor.contact_number, executor.contact);
  }

  private allocationPercent(allocation: Record<string, any>): number {
    if (this.isPresent(allocation.percentage)) {
      return this.toNumber(allocation.percentage);
    }

    if (this.isPresent(allocation.share)) {
      const share = this.toNumber(allocation.share);
      return share <= 1 ? share * 100 : share;
    }

    return 0;
  }

  private isMinor(person: Record<string, any>): boolean {
    if (this.isPositiveNumber(person.age) && Number(person.age) < 18) {
      return true;
    }

    const relationship = String(person.relationship || person.relation || '').toLowerCase();
    return relationship.includes('minor');
  }

  private toNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private firstPresentString(...values: Array<any>): string | null {
    for (const value of values) {
      if (this.isPresent(value)) {
        return String(value).trim();
      }
    }

    return null;
  }

  private normalizeKey(value: any): string {
    return String(value).trim().toLowerCase();
  }
}
