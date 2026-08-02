import { useState, useEffect } from 'react';
import { Scale, CalendarDays } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { logBodyStat } from '../../utils/healthActions.js';
import { useBodyStats } from '../../hooks/useProgress.js';
import useSettingsStore from '../../store/settingsStore.js';
import { useHaptics } from '../../hooks/useHaptics.js';
import { playChime } from '../../utils/sound.js';
import { toKg, toDisplay, unitLabel } from '../../utils/units.js';
import { todayKey } from '../../utils/dateKey.js';
import { weightSummary, formatDelta, freshnessLabel } from '../../utils/weightLog.js';

// Log what the scale said. Deliberately one number and a date — the full
// tape-measure form still lives on Progress → Body for the rest.
export default function WeightLogModal({ isOpen, onClose }) {
  const unit = useSettingsStore((s) => s.unit);
  const stats = useBodyStats();
  const haptic = useHaptics();
  const today = todayKey();

  const [value, setValue] = useState('');
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);

  // Fresh fields each time it opens, defaulting to today.
  useEffect(() => {
    if (isOpen) { setValue(''); setDate(todayKey()); }
  }, [isOpen]);

  const summary = weightSummary(stats);
  const entered = parseFloat(value);
  const validEntry = Number.isFinite(entered) && entered > 0;

  // Live comparison against the most recent reading as you type.
  const liveDelta = validEntry && summary
    ? formatDelta(toKg(entered, unit) - summary.currentKg, unit)
    : null;

  async function save() {
    if (!validEntry || saving) return;
    setSaving(true);
    try {
      await logBodyStat({ date, weight: toKg(entered, unit) });
      haptic('success');
      playChime('success');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log your weight">
      {summary && (
        <p className="mb-3 font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Last reading{' '}
          <span className="font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {toDisplay(summary.currentKg, unit)} {unitLabel(unit)}
          </span>
          {freshnessLabel(summary.date, today) ? ` · ${freshnessLabel(summary.date, today)}` : ''}
        </p>
      )}

      {/* The number */}
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'var(--color-ivory)' }}>
        <Scale size={18} style={{ color: 'var(--color-ash)', flexShrink: 0 }} />
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="0.0"
          className="min-w-0 flex-1 bg-transparent font-mono text-3xl font-bold outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
        <span className="flex-shrink-0 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {unitLabel(unit)}
        </span>
      </div>

      {liveDelta && (
        <p
          className="anim-fade-in mt-2 text-center font-mono text-sm font-semibold"
          style={{ color: liveDelta === 'No change' ? 'var(--color-text-secondary)' : 'var(--color-gold)' }}
        >
          {liveDelta} since last time
        </p>
      )}

      {/* When you measured it — so a morning reading logged at night lands on
          the right day, and you can backfill one you forgot. */}
      <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: 'var(--color-ivory)' }}>
        <span className="flex items-center gap-2 font-sans text-sm" style={{ color: 'var(--color-text-primary)' }}>
          <CalendarDays size={15} style={{ color: 'var(--color-ash)' }} /> Measured
        </span>
        <input
          value={date}
          onChange={(e) => setDate(e.target.value || today)}
          type="date"
          max={today}
          className="rounded-lg px-2 py-1 font-mono text-sm outline-none"
          style={{ background: 'var(--color-chalk)', color: 'var(--color-text-primary)' }}
        />
      </div>
      {date !== today && (
        <p className="mt-1.5 text-center font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Replaces any weight already logged for that day.
        </p>
      )}

      <button
        onClick={save}
        disabled={!validEntry || saving}
        className="mt-4 w-full rounded-xl py-3.5 font-sans text-sm font-semibold"
        style={{
          background: 'var(--color-gold)',
          color: 'var(--color-text-inverse)',
          opacity: validEntry && !saving ? 1 : 0.35,
        }}
      >
        Save
      </button>
    </Modal>
  );
}
