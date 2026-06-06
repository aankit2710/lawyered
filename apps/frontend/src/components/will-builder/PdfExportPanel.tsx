'use client';

import clsx from 'clsx';
import { useState } from 'react';
import { downloadPdfBlob, type PdfFormat, useDownloadPdf } from '@/hooks/usePdf';
import { api } from '@/lib/api';
import { useTheme } from '@/providers/ThemeProvider';

type Props = {
  willId: string | null;
  willTitle?: string;
  canProceed?: boolean;
};

export function PdfExportPanel({ willId, willTitle, canProceed }: Props) {
  const { theme } = useTheme();
  const [format, setFormat] = useState<PdfFormat>('standard');
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const downloadPdf = useDownloadPdf(willId);

  const handleDownload = async () => {
    if (!willId) return;
    setError('');
    try {
      const blob = await downloadPdf.mutateAsync(format);
      const slug = (willTitle || 'will').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await downloadPdfBlob(blob, `${slug || 'will'}.pdf`);
    } catch {
      setError('Unable to generate PDF. Ensure the will has enough data and try again.');
    }
  };

  const handlePreview = async () => {
    if (!willId) return;
    setError('');
    try {
      const { data } = await api.get<string>(`/wills/${willId}/pdf/preview`, {
        params: { format },
        responseType: 'text',
      });
      setPreviewHtml(data);
      setPreviewOpen(true);
    } catch {
      setError('Unable to load PDF preview.');
    }
  };

  return (
    <div
      className={clsx(
        'rounded-2xl border p-4',
        theme === 'dark' ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-white',
      )}
    >
      <h3 className={clsx('text-sm font-semibold uppercase tracking-[0.15em]', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
        Export PDF
      </h3>
      <p className={clsx('mt-2 text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
        Generate a printable will document with signature sections.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label htmlFor="pdf-format" className="sr-only">
          PDF format
        </label>
        <select
          id="pdf-format"
          value={format}
          onChange={(e) => setFormat(e.target.value as PdfFormat)}
          className={clsx(
            'rounded-xl border px-3 py-2 text-sm',
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800 text-white'
              : 'border-slate-300 bg-white text-slate-900',
          )}
        >
          <option value="standard">Standard</option>
          <option value="detailed">Detailed</option>
          <option value="simplified">Simplified</option>
        </select>

        <button
          type="button"
          onClick={handlePreview}
          disabled={!willId || downloadPdf.isPending}
          className={clsx(
            'rounded-full px-4 py-2 text-sm font-semibold transition',
            theme === 'dark'
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200',
          )}
        >
          Preview
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!willId || downloadPdf.isPending}
          className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          {downloadPdf.isPending ? 'Generating…' : 'Download PDF'}
        </button>
      </div>

      {!canProceed ? (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          Tip: Complete critical fields for a stronger final document. PDF export is still available.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b px-4 py-3 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-white">PDF Preview</h4>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <iframe
              title="Will PDF preview"
              srcDoc={previewHtml}
              className="h-full w-full flex-1 bg-white"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
