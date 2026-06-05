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

export function ExecutorSection({ snapshot, onEdit }: Props) {
  const { theme } = useTheme();
  const executor = snapshot?.executor;
  const filled = Boolean(executor?.name);

  return (
    <SectionCard title="Executor" status={sectionStatus(filled, true)} onEdit={onEdit}>
      {!executor ? (
        <p className={clsx('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          No executor appointed yet.
        </p>
      ) : (
        <dl className="space-y-2 text-sm">
          <div>
            <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
              Name
            </dt>
            <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
              {displayValue(executor.name)}
            </dd>
          </div>
          {executor.contact ? (
            <div>
              <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                Contact
              </dt>
              <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
                {String(executor.contact)}
              </dd>
            </div>
          ) : null}
          {executor.backup || executor.primary_backup ? (
            <div>
              <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                Backup
              </dt>
              <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
                {String(executor.backup || executor.primary_backup)}
              </dd>
            </div>
          ) : null}
        </dl>
      )}
    </SectionCard>
  );
}
