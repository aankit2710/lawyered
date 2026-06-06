'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
export type PdfFormat = 'standard' | 'detailed' | 'simplified';

export function useDownloadPdf(willId: string | null) {
  return useMutation({
    mutationFn: async (format: PdfFormat = 'standard') => {
      if (!willId) throw new Error('No will selected');

      const response = await api.get(`/wills/${willId}/pdf`, {
        params: { format },
        responseType: 'blob',
      });

      return response.data as Blob;
    },
  });
}

export async function downloadPdfBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
