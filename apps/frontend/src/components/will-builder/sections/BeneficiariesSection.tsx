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

export function BeneficiariesSection({ snapshot, onEdit }: Props) {
  const { theme } = useTheme();
  const beneficiaries = snapshot?.beneficiaries ?? [];
  const allocations = snapshot?.allocations ?? [];
  const filled = beneficiaries.length > 0;

  return (
    <SectionCard title="Beneficiaries" status={sectionStatus(filled, true)} onEdit={onEdit}>
      {beneficiaries.length === 0 ? (
        <p className={clsx('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          No beneficiaries recorded yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {beneficiaries.map((beneficiary, index) => {
            const name = displayValue(beneficiary.name, `Beneficiary ${index + 1}`);
            const shares = allocations.filter(
              (a) => String(a.beneficiary) === String(beneficiary.name || name),
            );

            return (
              <li
                key={`beneficiary-${index}`}
                className={clsx(
                  'rounded-xl p-3 text-sm',
                  theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-50',
                )}
              >
                <p className={clsx('font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                  {name}
                </p>
                <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                  Relationship: {displayValue(beneficiary.relationship || beneficiary.relation)}
                </p>
                {beneficiary.contact ? (
                  <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
                    Contact: {String(beneficiary.contact)}
                  </p>
                ) : null}
                {shares.length > 0 ? (
                  <ul className={clsx('mt-2 space-y-1 text-xs', theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700')}>
                    {shares.map((share, shareIndex) => (
                      <li key={`share-${index}-${shareIndex}`}>
                        {String(share.asset)}:{' '}
                        {share.percentage != null
                          ? `${share.percentage}%`
                          : share.share != null
                            ? `${Number(share.share) * 100}%`
                            : 'allocated'}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
