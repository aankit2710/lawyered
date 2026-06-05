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

export function GuardianSection({ snapshot, onEdit }: Props) {
  const { theme } = useTheme();
  const guardian = snapshot?.guardian;
  const hasMinorBeneficiary = (snapshot?.beneficiaries ?? []).some((b) => {
    const age = Number(b.age);
    return !Number.isNaN(age) && age < 18;
  });
  const required = hasMinorBeneficiary;
  const filled = Boolean(guardian?.name);

  return (
    <SectionCard
      title="Guardian"
      status={sectionStatus(filled, required)}
      onEdit={onEdit}
    >
      {!guardian ? (
        <p className={clsx('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          {required
            ? 'A guardian is required because minor beneficiaries are listed.'
            : 'No guardian appointed (not required unless minors are beneficiaries).'}
        </p>
      ) : (
        <dl className="space-y-2 text-sm">
          <div>
            <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
              Name
            </dt>
            <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
              {displayValue(guardian.name)}
            </dd>
          </div>
          {guardian.relationship ? (
            <div>
              <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                Relationship
              </dt>
              <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
                {String(guardian.relationship)}
              </dd>
            </div>
          ) : null}
          {guardian.contact ? (
            <div>
              <dt className={clsx('font-medium', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                Contact
              </dt>
              <dd className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
                {String(guardian.contact)}
              </dd>
            </div>
          ) : null}
        </dl>
      )}
    </SectionCard>
  );
}
