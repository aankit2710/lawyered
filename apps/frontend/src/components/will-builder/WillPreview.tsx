'use client';

import clsx from 'clsx';
import { useTheme } from '@/providers/ThemeProvider';
import type { SnapshotState } from '@/types/will';
import { AssetsSection } from './sections/AssetsSection';
import { BeneficiariesSection } from './sections/BeneficiariesSection';
import { ExecutorSection } from './sections/ExecutorSection';
import { GuardianSection } from './sections/GuardianSection';
import { TestatorSection } from './sections/TestatorSection';
import { WitnessesSection } from './sections/WitnessesSection';

type Props = {
  snapshot: SnapshotState | null;
  title?: string;
  onEditSection: (section: string, suggestion: string) => void;
};

const editSuggestions: Record<string, string> = {
  Testator: 'Update my testator details: my name is ..., I am ... years old, and I live at ...',
  Assets: 'Add an asset: my ... located at ... should be included in my will.',
  Beneficiaries: 'Add a beneficiary: ... (relationship: ...) should inherit from my estate.',
  Executor: 'Appoint ... as the executor of my will with contact ...',
  Witnesses: 'Add witnesses: ... and ... witnessed my will on ...',
  Guardian: 'Appoint ... as guardian for my minor children.',
};

export function WillPreview({ snapshot, title, onEditSection }: Props) {
  const { theme } = useTheme();
  const willTitle = title || snapshot?.title || 'Last Will and Testament';

  return (
    <div
      className={clsx(
        'h-full min-h-[520px] rounded-2xl border',
        theme === 'dark' ? 'border-slate-700 bg-slate-950/80' : 'border-slate-200 bg-slate-50 shadow-sm',
      )}
    >
      <div
        className={clsx(
          'border-b px-6 py-5 text-center',
          theme === 'dark' ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white',
        )}
      >
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-500">Live Preview</p>
        <h2 className={clsx('mt-2 font-serif text-2xl font-bold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
          {willTitle}
        </h2>
        <p className={clsx('mt-2 text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          This document updates in real time as you chat with the AI.
        </p>
      </div>

      <div className="space-y-4 overflow-y-auto p-4 lg:max-h-[calc(100vh-280px)]">
        <article
          className={clsx(
            'mx-auto max-w-2xl space-y-4 rounded-2xl border p-5 font-serif',
            theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white',
          )}
          aria-label="Will document preview"
        >
          <header className="border-b border-dashed pb-4 text-center">
            <p className={clsx('text-lg', theme === 'dark' ? 'text-slate-200' : 'text-slate-800')}>
              I,{' '}
              <span className="font-semibold">
                {snapshot?.testator?.name || '________________'}
              </span>
              , being of sound mind, hereby declare this to be my Last Will and Testament.
            </p>
          </header>

          <TestatorSection
            snapshot={snapshot}
            onEdit={() => onEditSection('Testator', editSuggestions.Testator)}
          />
          <AssetsSection
            snapshot={snapshot}
            onEdit={() => onEditSection('Assets', editSuggestions.Assets)}
          />
          <BeneficiariesSection
            snapshot={snapshot}
            onEdit={() => onEditSection('Beneficiaries', editSuggestions.Beneficiaries)}
          />
          <ExecutorSection
            snapshot={snapshot}
            onEdit={() => onEditSection('Executor', editSuggestions.Executor)}
          />
          <WitnessesSection
            snapshot={snapshot}
            onEdit={() => onEditSection('Witnesses', editSuggestions.Witnesses)}
          />
          <GuardianSection
            snapshot={snapshot}
            onEdit={() => onEditSection('Guardian', editSuggestions.Guardian)}
          />

          <footer
            className={clsx(
              'border-t border-dashed pt-4 text-center text-sm italic',
              theme === 'dark' ? 'text-slate-500' : 'text-slate-400',
            )}
          >
            Signature and witness sections appear in the exported PDF.
          </footer>
        </article>
      </div>
    </div>
  );
}
