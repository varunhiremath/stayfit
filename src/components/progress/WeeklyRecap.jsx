import { X, Dumbbell, Trophy, Layers } from 'lucide-react';
import { useWeeklyRecap } from '../../hooks/useWeeklyRecap.js';
import useSettingsStore from '../../store/settingsStore.js';
import { toDisplay, unitLabel } from '../../utils/units.js';

// Compact volume for the tight 4-across stat row: abbreviate ≥10k as "11.0k".
function compactVolume(kg, unit) {
  const v = toDisplay(kg, unit);
  const u = unitLabel(unit);
  return v >= 10000 ? `${(v / 1000).toFixed(1)}k ${u}` : `${Math.round(v).toLocaleString()} ${u}`;
}
import CountUp from '../fx/CountUp.jsx';

function Stat({ icon: Icon, value, label, countTo, effects }) {
  return (
    <div className="min-w-0 flex-1">
      <Icon size={14} style={{ color: 'var(--color-gold)' }} />
      <p className="mt-1 truncate font-mono text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {countTo != null && effects ? <CountUp value={countTo} /> : value}
      </p>
      <p className="font-sans text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
    </div>
  );
}

export default function WeeklyRecap({ dismissible = true }) {
  const recap = useWeeklyRecap();
  const unit = useSettingsStore((s) => s.unit);
  const effects = useSettingsStore((s) => s.effects);
  const dismissedWeek = useSettingsStore((s) => s.recapDismissedWeek);
  const setDismissed = useSettingsStore((s) => s.setRecapDismissedWeek);

  if (!recap.hasData) return null;
  if (dismissible && dismissedWeek === recap.weekKey) return null;


  return (
    <div className="mb-6 rounded-2xl p-4" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
          Your week so far
        </p>
        {dismissible && (
          <button onClick={() => setDismissed(recap.weekKey)} aria-label="Dismiss recap">
            <X size={15} style={{ color: 'var(--color-ash)' }} />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Stat icon={Dumbbell} value={recap.sessions} countTo={recap.sessions} effects={effects} label="Sessions" />
        <Stat icon={Layers} value={compactVolume(recap.volumeKg, unit)} label="Volume" />
        <Stat icon={Trophy} value={recap.prCount} countTo={recap.prCount} effects={effects} label="PRs" />
        <Stat icon={Layers} value={recap.sets} countTo={recap.sets} effects={effects} label="Sets" />
      </div>

      {recap.topLift && (
        <p className="mt-3 font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Top lift this week — <span style={{ color: 'var(--color-text-primary)' }}>{recap.topLift}</span>
        </p>
      )}
    </div>
  );
}
