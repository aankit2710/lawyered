'use client';

import clsx from 'clsx';
import { displayValue, sectionStatus } from '@/lib/will-format';
import { useTheme } from '@/providers/ThemeProvider';
import type { SnapshotState } from '@/types/will';
import { SectionCard } from './SectionCard';

type Props = {
  snapshot: SnapshotState | null;
  onEdit?: () => void;
};

export function TestatorSection({ snapshot, onEdit }: Props) {
  const { theme } = useTheme();
  const testator = snapshot?.testator;
  const filled = Boolean(testator?.name && testator?.age && testator?.address);

  return (
    <SectionCard
      title="Testator"
      status={sectionStatus(filled, true)}
      onEdit={onEdit}
    >
      <dl className="space-y-2 text-sm">
        <div>
          <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
            Full Name
          </dt>
          <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
            {displayValue(testator?.name)}
          </dd>
        </div>
        <div>
          <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
            Age
          </dt>
          <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
            {displayValue(testator?.age)}
          </dd>
        </div>
        <div>
          <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
            Address
          </dt>
          <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
            {displayValue(testator?.address)}
          </dd>
        </div>
        <div>
          <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
            Sound Mind
          </dt>
          <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
            {testator?.soundMind === false ? 'No' : 'Yes'}
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}
