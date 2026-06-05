'use client';

import clsx from 'clsx';
import { useTheme } from '@/providers/ThemeProvider';
type SectionStatus = 'complete' | 'missing' | 'optional';

type SectionCardProps = {
  title: string;
  status: SectionStatus;
  onEdit?: () => void;
  children: React.ReactNode;
};

const statusLabel: Record<SectionStatus, string> = {
  complete: 'Complete',
  missing: 'Required',
  optional: 'Optional',
};

export function SectionCard({ title, status, onEdit, children }: SectionCardProps) {
  const { theme } = useTheme();

  return (
    <section
      className={clsx(
        'rounded-2xl border p-4 transition',
        theme === 'dark'
          ? 'border-slate-700 bg-slate-900/60'
          : 'border-slate-200 bg-white shadow-sm',
        status === 'missing' && (theme === 'dark' ? 'border-amber-700/60' : 'border-amber-300'),
      )}
      aria-label={`${title} section`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3
            className={clsx(
              'text-sm font-semibold uppercase tracking-[0.15em]',
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600',
            )}
          >
            {title}
          </h3>
          <span
            className={clsx(
              'mt-1 inline-block text-xs font-medium',
              status === 'complete' && 'text-emerald-500',
              status === 'missing' && 'text-amber-500',
              status === 'optional' && (theme === 'dark' ? 'text-slate-500' : 'text-slate-400'),
            )}
          >
            {statusLabel[status]}
          </span>
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className={clsx(
              'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
              theme === 'dark'
                ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
            )}
            aria-label={`Edit ${title}`}
          >
            Edit
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
