'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SnapshotHistoryItem, SnapshotState, WillDetail, WillSummary } from '@/types/will';

export function useWills() {
  return useQuery({
    queryKey: ['wills'],
    queryFn: async () => {
      const { data } = await api.get<{ wills: WillSummary[] }>('/wills');
      return data.wills;
    },
  });
}

export function useWillDetail(willId: string | null) {
  return useQuery({
    queryKey: ['will', willId],
    enabled: Boolean(willId),
    queryFn: async () => {
      const { data } = await api.get<WillDetail>(`/wills/${willId}`);
      return data;
    },
  });
}

export function useSnapshot(willId: string | null) {
  return useQuery({
    queryKey: ['snapshot', willId],
    enabled: Boolean(willId),
    queryFn: async () => {
      const { data } = await api.get<SnapshotState>(`/wills/${willId}/snapshot`);
      return data;
    },
  });
}

export function useSnapshotHistory(willId: string | null) {
  return useQuery({
    queryKey: ['snapshot-history', willId],
    enabled: Boolean(willId),
    queryFn: async () => {
      const { data } = await api.get<SnapshotHistoryItem[]>(`/wills/${willId}/snapshots`);
      return data;
    },
  });
}

export function useCreateWill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      const { data } = await api.post<{ will: WillSummary }>('/wills', {
        title: title || 'My Will',
      });
      return data.will;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wills'] });
    },
  });
}
