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

export function WitnessesSection({ snapshot, onEdit }: Props) {
  const { theme } = useTheme();
  const witnesses = snapshot?.witnesses ?? [];
  const filled = witnesses.length >= 2;

  return (
    <SectionCard title="Witnesses" status={sectionStatus(filled, true)} onEdit={onEdit}>
      {witnesses.length === 0 ? (
        <p className={clsx('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          At least two witnesses are required.
        </p>
      ) : (
        <ul className="space-y-3">
          {witnesses.map((witness, index) => (
            <li
              key={`witness-${index}`}
              className={clsx(
                'rounded-xl p-3 text-sm',
                theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-50',
              )}
            >
              <p className={clsx('font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                {displayValue(witness.name, `Witness ${index + 1}`)}
              </p>
              <div className={clsx('mt-1 flex flex-wrap gap-3 text-xs', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                {witness.age ? <span>Age: {String(witness.age)}</span> : null}
                {witness.contact ? <span>Contact: {String(witness.contact)}</span> : null}
                {witness.signature_date ? (
                  <span>Signed: {String(witness.signature_date)}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
