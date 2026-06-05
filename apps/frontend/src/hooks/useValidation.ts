'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ValidationResult } from '@/types/will';

export function useValidation(willId: string | null) {
  return useQuery({
    queryKey: ['validation', willId],
    enabled: Boolean(willId),
    queryFn: async () => {
      const { data } = await api.get<ValidationResult>(`/wills/${willId}/validation`);
      return data;
    },
  });
}
