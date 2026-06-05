'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ChatResponse } from '@/types/will';

export function useSendChat(willId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post<ChatResponse>(`/wills/${willId}/chat`, { message });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['snapshot', willId] });
      void queryClient.invalidateQueries({ queryKey: ['validation', willId] });
      void queryClient.invalidateQueries({ queryKey: ['will', willId] });
      void queryClient.invalidateQueries({ queryKey: ['wills'] });
      void queryClient.invalidateQueries({ queryKey: ['snapshot-history', willId] });
    },
  });
}

export function useClarify(willId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clarification: string) => {
      const { data } = await api.post<ChatResponse>(`/wills/${willId}/clarify`, {
        clarification,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['snapshot', willId] });
      void queryClient.invalidateQueries({ queryKey: ['validation', willId] });
      void queryClient.invalidateQueries({ queryKey: ['will', willId] });
      void queryClient.invalidateQueries({ queryKey: ['wills'] });
      void queryClient.invalidateQueries({ queryKey: ['snapshot-history', willId] });
    },
  });
}
