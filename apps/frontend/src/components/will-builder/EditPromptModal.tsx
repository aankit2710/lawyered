'use client';

import clsx from 'clsx';
import { useTheme } from '@/providers/ThemeProvider';

type Props = {
  section: string;
  suggestion: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (prompt: string) => void;
};

export function EditPromptModal({ section, suggestion, open, onClose, onConfirm }: Props) {
  const { theme } = useTheme();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div
        className={clsx(
          'w-full max-w-md rounded-2xl border p-6 shadow-xl',
          theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white',
        )}
      >
        <h2
          id="edit-modal-title"
          className={clsx('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}
        >
          Edit {section}
        </h2>
        <p className={clsx('mt-2 text-sm', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
          Changes are applied through the AI chat. We&apos;ll pre-fill a message you can send or edit.
        </p>
        <textarea
          defaultValue={suggestion}
          id="edit-prompt-input"
          rows={4}
          className={clsx(
            'mt-4 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-cyan-500',
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800 text-white'
              : 'border-slate-300 bg-white text-slate-900',
          )}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium',
              theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('edit-prompt-input') as HTMLTextAreaElement | null;
              onConfirm(input?.value || suggestion);
              onClose();
            }}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Use in chat
          </button>
        </div>
      </div>
    </div>
  );
}
