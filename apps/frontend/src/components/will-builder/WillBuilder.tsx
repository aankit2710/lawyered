'use client';

import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useClarify, useSendChat } from '@/hooks/useChat';
import { useValidation } from '@/hooks/useValidation';
import {
  useCreateWill,
  useSnapshot,
  useSnapshotHistory,
  useWillDetail,
  useWills,
} from '@/hooks/useWill';
import { useTheme } from '@/providers/ThemeProvider';
import type { ChatEntry, SnapshotState } from '@/types/will';
import { ChatPanel, mapWillMessagesToEntries } from './ChatPanel';
import { EditPromptModal } from './EditPromptModal';
import { ProgressTracker } from './ProgressTracker';
import { ThemeToggle } from './ThemeToggle';
import { ValidationPanel } from './ValidationPanel';
import { PdfExportPanel } from './PdfExportPanel';
import { WillPreview } from './WillPreview';
import { formatApiError } from '@/lib/errors';

export function WillBuilder() {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [activeWillId, setActiveWillId] = useState<string | null>(null);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [error, setError] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [editModal, setEditModal] = useState<{ section: string; suggestion: string } | null>(null);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [previewSnapshot, setPreviewSnapshot] = useState<SnapshotState | null>(null);

  const {
    data: wills = [],
    isLoading: isLoadingWills,
    isError: willsLoadFailed,
    error: willsLoadError,
  } = useWills();
  const { data: willDetail } = useWillDetail(activeWillId);
  const { data: snapshot } = useSnapshot(activeWillId);
  const { data: validation, isLoading: isLoadingValidation } = useValidation(activeWillId);
  const { data: snapshotHistory = [] } = useSnapshotHistory(activeWillId);

  const createWill = useCreateWill();
  const sendChat = useSendChat(activeWillId);
  const clarify = useClarify(activeWillId);

  const draftStorageKey = activeWillId ? `will-draft-${activeWillId}` : null;

  useEffect(() => {
    if (wills.length > 0 && !activeWillId) {
      setActiveWillId(wills[0].id);
    }
  }, [wills, activeWillId]);

  useEffect(() => {
    if (!willDetail?.chat_messages) {
      setEntries([]);
      return;
    }
    setEntries(mapWillMessagesToEntries(willDetail.chat_messages));
  }, [willDetail?.chat_messages]);

  useEffect(() => {
    if (!draftStorageKey) return;
    const stored = window.localStorage.getItem(draftStorageKey);
    if (stored) setDraftMessage(stored);
  }, [draftStorageKey]);

  useEffect(() => {
    if (!draftStorageKey) return;
    if (draftMessage) {
      window.localStorage.setItem(draftStorageKey, draftMessage);
    } else {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [draftMessage, draftStorageKey]);

  useEffect(() => {
    if (historyIndex === null) {
      setPreviewSnapshot(snapshot ?? null);
    }
  }, [snapshot, historyIndex]);

  const activeWill = useMemo(
    () => wills.find((will) => will.id === activeWillId) || null,
    [wills, activeWillId],
  );

  const handleCreateWill = async () => {
    setError('');
    try {
      const created = await createWill.mutateAsync(`${user?.firstName || 'My'} Will`);
      setActiveWillId(created.id);
      setEntries([]);
      setHistoryIndex(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to create will';
      setError(message);
    }
  };

  const appendEntry = useCallback((entry: ChatEntry) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setEntries((current) => [...current, { ...entry, timestamp: entry.timestamp || timestamp }]);
  }, []);

  const applyServerSnapshot = useCallback(
    (willId: string, nextSnapshot: SnapshotState) => {
      setPreviewSnapshot(nextSnapshot);
      setHistoryIndex(null);
      queryClient.setQueryData(['snapshot', willId], nextSnapshot);
    },
    [queryClient],
  );

  const handleSend = async (message: string) => {
    if (!activeWillId) return;
    setError('');
    appendEntry({ role: 'user', content: message });
    try {
      const response = await sendChat.mutateAsync(message);
      applyServerSnapshot(activeWillId, response.snapshot);
      appendEntry({
        role: 'assistant',
        content: response.message,
        extraction: response.extraction,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Unable to send message');
    }
  };

  const handleClarify = async (message: string) => {
    if (!activeWillId) return;
    setError('');
    appendEntry({ role: 'user', content: message });
    try {
      const response = await clarify.mutateAsync(message);
      applyServerSnapshot(activeWillId, response.snapshot);
      appendEntry({
        role: 'assistant',
        content: response.message,
        extraction: response.extraction,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Unable to send clarification');
    }
  };

  const handleUndo = () => {
    if (snapshotHistory.length < 2) return;
    const currentIndex =
      historyIndex ?? snapshotHistory.length - 1;
    const previousIndex = Math.max(0, currentIndex - 1);
    setHistoryIndex(previousIndex);
    setPreviewSnapshot(snapshotHistory[previousIndex].snapshot);
  };

  const handleRedo = () => {
    if (historyIndex === null || historyIndex >= snapshotHistory.length - 1) {
      setHistoryIndex(null);
      setPreviewSnapshot(snapshot ?? null);
      return;
    }
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setPreviewSnapshot(snapshotHistory[nextIndex].snapshot);
  };

  const isSending = sendChat.isPending || clarify.isPending;

  return (
    <section
      className={clsx(
        'overflow-hidden rounded-3xl border shadow-lg',
        theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white',
      )}
    >
      <div
        className={clsx(
          'border-b px-6 py-5',
          theme === 'dark'
            ? 'border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900'
            : 'border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Will Builder</p>
            <h2 className="mt-1 text-2xl font-semibold">Live Will Builder</h2>
            <p className="mt-1 text-sm text-slate-300">
              Chat on the left, live will preview on the right.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleUndo}
              disabled={snapshotHistory.length < 2}
              className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
            >
              Preview undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex === null}
              title="Preview-only — does not revert server state"
              className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
            >
              Preview redo
            </button>
            <button
              type="button"
              onClick={handleCreateWill}
              disabled={createWill.isPending || isLoadingWills}
              className="rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
            >
              {activeWill ? 'New Will' : 'Start Will'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 lg:p-6">
        {willsLoadFailed ? (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            Failed to load wills: {formatApiError(willsLoadError, 'Unknown error')}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="will-select" className={clsx('text-sm font-medium', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
            Active will:
          </label>
          <select
            id="will-select"
            value={activeWillId || ''}
            onChange={(e) => {
              setActiveWillId(e.target.value || null);
              setHistoryIndex(null);
              setDraftMessage('');
            }}
            className={clsx(
              'rounded-xl border px-3 py-2 text-sm',
              theme === 'dark'
                ? 'border-slate-700 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-900',
            )}
          >
            <option value="">Select a will</option>
            {wills.map((will) => (
              <option key={will.id} value={will.id}>
                {will.title} ({will.completion_percentage}%)
              </option>
            ))}
          </select>
          {activeWill ? (
            <span className={clsx('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
              {activeWill.title}
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ChatPanel
            willId={activeWillId}
            entries={entries}
            isSending={isSending}
            error={error}
            pendingClarification={previewSnapshot?.pendingClarification ?? snapshot?.pendingClarification}
            onSend={handleSend}
            onClarify={handleClarify}
            draftMessage={draftMessage}
            onDraftChange={setDraftMessage}
          />
          <WillPreview
            snapshot={previewSnapshot ?? snapshot ?? null}
            title={activeWill?.title}
            onEditSection={(section, suggestion) => setEditModal({ section, suggestion })}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ProgressTracker
            validation={validation}
            snapshot={previewSnapshot ?? snapshot ?? null}
            isLoading={isLoadingValidation}
          />
          <ValidationPanel validation={validation} isLoading={isLoadingValidation} />
        </div>

        <PdfExportPanel
          willId={activeWillId}
          willTitle={activeWill?.title}
          canProceed={validation?.canProceed}
        />
      </div>

      <EditPromptModal
        section={editModal?.section || ''}
        suggestion={editModal?.suggestion || ''}
        open={Boolean(editModal)}
        onClose={() => setEditModal(null)}
        onConfirm={(prompt) => setDraftMessage(prompt)}
      />
    </section>
  );
}
