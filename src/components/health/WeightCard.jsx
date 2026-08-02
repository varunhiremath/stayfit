import { useState } from 'react';
import { Scale, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import WeightLogModal from './WeightLogModal.jsx';
import { useBodyStats } from '../../hooks/useProgress.js';
import useSettingsStore from '../../store/settingsStore.js';
import { toDisplay, unitLabel } from '../../utils/units.js';
import { todayKey } from '../../utils/dateKey.js';
import { weightSummary, deltaOver, formatDelta, freshnessLabel } from '../../utils/weightLog.js';

// Home-screen weight tile: what you last weighed, which way it's moving, and a
// one-tap way to record today's reading.
export default function WeightCard() {
  const [open, setOpen] = useState(false);
  const stats = useBodyStats();
  const unit = useSettingsStore((s) => s.unit);
  const today = todayKey();

  const summary = weightSummary(stats);
  const month = deltaOver(stats, 30, summary?.date);
  const trendKg = month?.deltaKg ?? summary?.deltaKg ?? null;
  const Trend = trendKg == null || Math.round(trendKg * 10) === 0 ? null : trendKg < 0 ? TrendingDown : TrendingUp;

  return (
    <>
      <div className="mb-6 rounded-2xl p-4" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
        <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
          Weight
        </p>

        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: 'var(--color-ivory)' }}
          >
            <Scale size={19} style={{ color: 'var(--color-gold)' }} />
          </span>

          <div className="min-w-0 flex-1">
            {summary ? (
              <>
                <p className="font-mono text-2xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
                  {toDisplay(summary.currentKg, unit)}
                  <span className="ml-1 font-sans text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {unitLabel(unit)}
                  </span>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 font-sans text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="whitespace-nowrap">{freshnessLabel(summary.date, today) ?? summary.date}</span>
                  {Trend && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <span aria-hidden>·</span>
                      <Trend size={12} style={{ color: 'var(--color-gold)' }} />
                      <span className="font-mono" style={{ color: 'var(--color-gold)' }}>
                        {formatDelta(trendKg, unit)}
                      </span>
                      <span>{month ? 'in 30d' : 'vs last'}</span>
                    </span>
                  )}
                </p>
              </>
            ) : (
              <p className="font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Nothing logged yet — record what the scale says.
              </p>
            )}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-xl px-3.5 font-sans text-sm font-semibold"
            style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
          >
            <Plus size={15} /> Log
          </button>
        </div>
      </div>

      <WeightLogModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
