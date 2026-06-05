'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import type { ValidationResult } from '@/types/will';

type Props = {
  validation: ValidationResult | null | undefined;
  isLoading?: boolean;
};

export function ValidationPanel({ validation, isLoading }: Props) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className={clsx('rounded-2xl border p-4 text-sm', theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500')}>
        Checking validation...
      </div>
    );
  }

  if (!validation) {
    return (
      <div className={clsx('rounded-2xl border p-4 text-sm', theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500')}>
        Start the interview to see validation feedback.
      </div>
    );
  }

  const nextSteps: string[] = [];
  if (validation.criticalErrors.length > 0) {
    nextSteps.push('Resolve critical errors before finalizing your will.');
  }
  if (validation.missingFields.length > 0) {
    nextSteps.push(`Complete: ${validation.missingFields.slice(0, 3).join(', ')}${validation.missingFields.length > 3 ? '…' : ''}`);
  }
  if (validation.warnings.length > 0 && validation.criticalErrors.length === 0) {
    nextSteps.push('Review warnings — they are recommendations, not blockers.');
  }
  if (validation.status === 'COMPLETE') {
    nextSteps.push('Your will meets all required fields. You can proceed to export when ready.');
  }

  return (
    <div
      className={clsx(
        'rounded-2xl border',
        theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className={clsx(
          'flex w-full items-center justify-between px-4 py-3 text-left',
          theme === 'dark' ? 'text-white' : 'text-slate-900',
        )}
        aria-expanded={expanded}
        aria-controls="validation-details"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.15em]">Validation</span>
        <span className="text-xs">{expanded ? 'Hide' : 'Show'}</span>
      </button>

      {expanded ? (
        <div id="validation-details" className="space-y-4 border-t px-4 py-4">
          <p className={clsx('text-sm', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
            {validation.summary}
          </p>

          {validation.criticalErrors.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-red-500">
                Critical Errors
              </h4>
              <ul className="mt-2 space-y-2">
                {validation.criticalErrors.map((issue) => (
                  <li
                    key={`${issue.code}-${issue.field}`}
                    className={clsx(
                      'rounded-xl px-3 py-2 text-sm text-red-700',
                      theme === 'dark' ? 'bg-red-950/40 text-red-300' : 'bg-red-50',
                    )}
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {validation.errors.length > validation.criticalErrors.length ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-red-500">Errors</h4>
              <ul className="mt-2 space-y-2">
                {validation.errors
                  .filter((e) => !e.critical)
                  .map((issue) => (
                    <li
                      key={`${issue.code}-${issue.field}`}
                      className={clsx(
                        'rounded-xl px-3 py-2 text-sm',
                        theme === 'dark' ? 'bg-red-950/30 text-red-200' : 'bg-red-50 text-red-700',
                      )}
                    >
                      {issue.message}
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}

          {validation.warnings.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-500">Warnings</h4>
              <ul className="mt-2 space-y-2">
                {validation.warnings.map((issue) => (
                  <li
                    key={`${issue.code}-${issue.field}`}
                    className={clsx(
                      'rounded-xl px-3 py-2 text-sm',
                      theme === 'dark' ? 'bg-amber-950/30 text-amber-200' : 'bg-amber-50 text-amber-800',
                    )}
                  >
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {validation.missingFields.length > 0 ? (
            <div>
              <h4 className={clsx('text-xs font-semibold uppercase tracking-[0.15em]', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                Missing Fields
              </h4>
              <ul className="mt-2 flex flex-wrap gap-2">
                {validation.missingFields.map((field) => (
                  <li
                    key={field}
                    className={clsx(
                      'rounded-full px-3 py-1 text-xs font-medium',
                      theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700',
                    )}
                  >
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {nextSteps.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-500">Suggested Next Steps</h4>
              <ul className={clsx('mt-2 list-disc space-y-1 pl-5 text-sm', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                {nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
