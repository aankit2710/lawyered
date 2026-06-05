'use client';

import clsx from 'clsx';
import { statusBadgeClass } from '@/lib/will-format';
import { useTheme } from '@/providers/ThemeProvider';
import type { SnapshotState, ValidationResult } from '@/types/will';

type Props = {
  validation: ValidationResult | null | undefined;
  snapshot: SnapshotState | null;
  isLoading?: boolean;
};

type SectionCheck = {
  label: string;
  complete: boolean;
  critical: boolean;
};

function buildSectionChecks(snapshot: SnapshotState | null): SectionCheck[] {
  const testator = snapshot?.testator;
  const witnesses = snapshot?.witnesses ?? [];

  return [
    {
      label: 'Testator',
      complete: Boolean(testator?.name && testator?.age && testator?.address),
      critical: true,
    },
    {
      label: 'Assets',
      complete: (snapshot?.assets?.length ?? 0) > 0,
      critical: true,
    },
    {
      label: 'Beneficiaries',
      complete: (snapshot?.beneficiaries?.length ?? 0) > 0,
      critical: true,
    },
    {
      label: 'Allocations',
      complete: (snapshot?.allocations?.length ?? 0) > 0,
      critical: true,
    },
    {
      label: 'Executor',
      complete: Boolean(snapshot?.executor?.name),
      critical: true,
    },
    {
      label: 'Witnesses',
      complete: witnesses.length >= 2,
      critical: true,
    },
    {
      label: 'Guardian',
      complete: Boolean(snapshot?.guardian?.name),
      critical: false,
    },
  ];
}

export function ProgressTracker({ validation, snapshot, isLoading }: Props) {
  const { theme } = useTheme();
  const completeness = validation?.completeness ?? 0;
  const sections = buildSectionChecks(snapshot);

  return (
    <div
      className={clsx(
        'rounded-2xl border p-4',
        theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white',
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className={clsx(
              'text-xs font-semibold uppercase tracking-[0.2em]',
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
            )}
          >
            Progress
          </p>
          <p className={clsx('mt-1 text-2xl font-bold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
            {isLoading ? '—' : `${completeness}%`}
          </p>
        </div>
        {validation ? (
          <span className={statusBadgeClass(validation.status, theme)}>
            {validation.status.replace(/_/g, ' ')}
          </span>
        ) : null}
      </div>

      <div
        className={clsx('mt-4 h-2.5 overflow-hidden rounded-full', theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200')}
        role="progressbar"
        aria-valuenow={completeness}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Will completion progress"
      >
        <div
          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, completeness))}%` }}
        />
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {sections.map((section) => (
          <li
            key={section.label}
            className={clsx(
              'flex items-center justify-between rounded-xl px-3 py-2 text-sm',
              theme === 'dark' ? 'bg-slate-800/70' : 'bg-slate-50',
              !section.complete && section.critical && (theme === 'dark' ? 'ring-1 ring-amber-700/50' : 'ring-1 ring-amber-200'),
            )}
          >
            <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{section.label}</span>
            <span
              className={clsx(
                'text-xs font-semibold',
                section.complete ? 'text-emerald-500' : section.critical ? 'text-amber-500' : 'text-slate-400',
              )}
            >
              {section.complete ? 'Done' : section.critical ? 'Needed' : 'Optional'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
