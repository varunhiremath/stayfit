import { useEffect, useState } from 'react';
import { Timer, Layers, Dumbbell } from 'lucide-react';
import { formatElapsed } from '../../utils/sessionFlow.js';
import { fmtVolume } from '../../utils/units.js';
import useSettingsStore from '../../store/settingsStore.js';

// The session clock — the one number you glance at between sets, so it gets a
// dark card of its own with the running time set large and monospaced.
export default function SessionTimer({ startedAt, sets, volumeKg, done, total }) {
  const [secs, setSecs] = useState(() => Math.round((Date.now() - startedAt) / 1000));
  const unit = useSettingsStore((s) => s.unit);
  const effects = useSettingsStore((s) => s.effects);

  useEffect(() => {
    const id = setInterval(() => setSecs(Math.round((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const pct = total ? Math.min(done / total, 1) : 0;

  return (
    <div className="mb-4 overflow-hidden rounded-2xl" style={{ background: 'var(--color-obsidian)' }}>
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <span
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.35)' }}
        >
          <Timer size={22} style={{ color: 'var(--color-gold)' }} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-3xl font-bold leading-none"
              style={{ color: 'var(--color-text-inverse)', fontVariantNumeric: 'tabular-nums' }}
            >
              {formatElapsed(secs)}
            </span>
            <span
              aria-hidden
              className={effects ? 'anim-breathe' : undefined}
              style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-gold)' }}
            />
          </div>
          <p className="mt-1 font-sans text-[11px] uppercase tracking-widest" style={{ color: 'var(--color-ash)' }}>
            Elapsed
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--color-text-inverse)' }}>
            <Layers size={12} style={{ color: 'var(--color-ash)' }} /> {sets} set{sets === 1 ? '' : 's'}
          </span>
          {volumeKg > 0 && (
            <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--color-ash)' }}>
              <Dumbbell size={12} /> {fmtVolume(volumeKg, unit)}
            </span>
          )}
        </div>
      </div>

      {total > 0 && (
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full"
            style={{ width: `${pct * 100}%`, background: 'var(--color-gold)', transition: 'width .4s var(--ease-out)' }}
          />
        </div>
      )}
    </div>
  );
}
