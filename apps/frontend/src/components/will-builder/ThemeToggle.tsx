'use client';

import clsx from 'clsx';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        'rounded-full px-3 py-1.5 text-xs font-semibold transition',
        theme === 'dark'
          ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
