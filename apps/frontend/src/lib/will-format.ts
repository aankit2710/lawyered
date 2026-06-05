export function formatTimestamp(value?: string | Date): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function displayValue(value: unknown, fallback = 'Not provided'): string {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export function statusBadgeClass(
  status: string,
  theme: 'light' | 'dark',
): string {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
  const map: Record<string, string> = {
    COMPLETE: theme === 'dark' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
    INCOMPLETE: theme === 'dark' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700',
    INVALID: theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    VALID_WITH_WARNINGS:
      theme === 'dark' ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-800',
  };
  return `${base} ${map[status] || map.INCOMPLETE}`;
}

export function sectionStatus(
  filled: boolean,
  required: boolean,
): 'complete' | 'missing' | 'optional' {
  if (filled) return 'complete';
  return required ? 'missing' : 'optional';
}
