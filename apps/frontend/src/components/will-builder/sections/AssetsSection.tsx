'use client';

import clsx from 'clsx';
import { displayValue, sectionStatus } from '@/lib/will-format';
import { useTheme } from '@/providers/ThemeProvider';
import type { SnapshotState } from '@/types/will';
import { SectionCard } from './SectionCard';

type Props = {
  snapshot: SnapshotState | null;
  onEdit?: () => void;
};

export function AssetsSection({ snapshot, onEdit }: Props) {
  const { theme } = useTheme();
  const assets = snapshot?.assets ?? [];
  const filled = assets.length > 0;

  return (
    <SectionCard title="Assets" status={sectionStatus(filled, true)} onEdit={onEdit}>
      {assets.length === 0 ? (
        <p className={clsx('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          No assets recorded yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {assets.map((asset, index) => (
            <li
              key={`asset-${index}`}
              className={clsx(
                'rounded-xl p-3 text-sm',
                theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-50',
              )}
            >
              <p className={clsx('font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                {displayValue(asset.name || asset.kind || asset.type, `Asset ${index + 1}`)}
              </p>
              {asset.description ? (
                <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                  {String(asset.description)}
                </p>
              ) : null}
              <div className={clsx('mt-1 flex flex-wrap gap-3 text-xs', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                {asset.location ? <span>Location: {String(asset.location)}</span> : null}
                {asset.value ? <span>Value: {String(asset.value)}</span> : null}
                {asset.type ? <span>Type: {String(asset.type)}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
