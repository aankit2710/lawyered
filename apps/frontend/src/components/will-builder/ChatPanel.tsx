'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { formatTimestamp } from '@/lib/will-format';
import { useTheme } from '@/providers/ThemeProvider';
import type { ChatEntry, SnapshotState } from '@/types/will';

type Props = {
  willId: string | null;
  entries: ChatEntry[];
  isSending: boolean;
  error?: string;
  pendingClarification?: SnapshotState['pendingClarification'];
  onSend: (message: string) => void;
  onClarify: (message: string) => void;
  draftMessage?: string;
  onDraftChange?: (value: string) => void;
};

export function ChatPanel({
  willId,
  entries,
  isSending,
  error,
  pendingClarification,
  onSend,
  onClarify,
  draftMessage = '',
  onDraftChange,
}: Props) {
  const { theme } = useTheme();
  const [message, setMessage] = useState(draftMessage);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessage(draftMessage);
  }, [draftMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries.length, isSending]);

  const handleChange = (value: string) => {
    setMessage(value);
    onDraftChange?.(value);
  };

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || !willId || isSending) return;

    if (pendingClarification) {
      onClarify(trimmed);
    } else {
      onSend(trimmed);
    }
    setMessage('');
    onDraftChange?.('');
  };

  return (
    <div
      className={clsx(
        'flex h-full min-h-[520px] flex-col rounded-2xl border',
        theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white shadow-sm',
      )}
    >
      <div
        className={clsx(
          'border-b px-4 py-3',
          theme === 'dark' ? 'border-slate-700' : 'border-slate-200',
        )}
      >
        <h2 className={clsx('text-sm font-semibold uppercase tracking-[0.15em]', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
          Interview Chat
        </h2>
        <p className={clsx('mt-1 text-xs', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          Describe your wishes in plain English.
        </p>
      </div>

      {pendingClarification ? (
        <div
          className={clsx(
            'mx-4 mt-4 rounded-xl border px-3 py-2 text-sm',
            theme === 'dark' ? 'border-amber-700/50 bg-amber-950/30 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-900',
          )}
          role="status"
        >
          <p className="font-semibold">Clarification needed</p>
          <p className="mt-1">{pendingClarification.question}</p>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {entries.length === 0 ? (
          <p className={clsx('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
            Try:{' '}
            <span className="font-medium">
              My house in Pune should go equally to Rahul and Rohit. My wife should be the executor.
            </span>
          </p>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.id || `${entry.role}-${index}`}
              className={clsx(
                'max-w-[90%] rounded-2xl px-3 py-2 text-sm',
                entry.role === 'user'
                  ? 'ml-auto bg-cyan-600 text-white'
                  : theme === 'dark'
                    ? 'mr-auto bg-slate-800 text-slate-100'
                    : 'mr-auto bg-slate-100 text-slate-900',
              )}
            >
              <p>{entry.content}</p>
              {entry.timestamp ? (
                <p
                  className={clsx(
                    'mt-1 text-[11px]',
                    entry.role === 'user' ? 'text-cyan-100' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
                  )}
                >
                  {entry.timestamp}
                </p>
              ) : null}
              {entry.extraction?.confidence != null ? (
                <p className={clsx('mt-1 text-[11px] opacity-80', entry.role === 'user' ? 'text-cyan-100' : '')}>
                  Confidence: {(entry.extraction.confidence * 100).toFixed(0)}%
                </p>
              ) : null}
            </div>
          ))
        )}

        {isSending ? (
          <div
            className={clsx(
              'mr-auto flex max-w-[90%] items-center gap-2 rounded-2xl px-3 py-2 text-sm',
              theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700',
            )}
            aria-label="AI is typing"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-500 [animation-delay:150ms]" />
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-500 [animation-delay:300ms]" />
            <span>AI is typing…</span>
          </div>
        ) : null}
      </div>

      <div
        className={clsx(
          'border-t p-4',
          theme === 'dark' ? 'border-slate-700' : 'border-slate-200',
        )}
      >
        <label htmlFor="will-chat-input" className="sr-only">
          Message to AI
        </label>
        <textarea
          id="will-chat-input"
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          rows={3}
          disabled={!willId || isSending}
          placeholder={
            pendingClarification
              ? 'Answer the clarification question...'
              : 'Describe what you want in your will...'
          }
          className={clsx(
            'w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:border-cyan-500',
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500'
              : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
          )}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!willId || isSending || !message.trim()}
            className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? 'Sending…' : pendingClarification ? 'Send clarification' : 'Send'}
          </button>
          <span className={clsx('text-xs', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
            Enter to send · Shift+Enter for new line
          </span>
        </div>
        {error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function mapWillMessagesToEntries(
  messages: Array<{
    id: string;
    role: string;
    content: string;
    metadata?: { extraction?: ChatEntry['extraction'] };
    created_at: string;
  }>,
): ChatEntry[] {
  return messages
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: formatTimestamp(msg.created_at),
      extraction: msg.metadata?.extraction,
    }));
}
