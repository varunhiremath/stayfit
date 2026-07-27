import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Clock, Timer, Trash2, BookOpen } from 'lucide-react';
import { useStretchRoutines, useStretchLogs, useStretchStats } from '../hooks/useStretches.js';
import { logStretchSession, deleteStretchLog } from '../utils/stretchActions.js';
import { formatClock } from '../utils/stretchSession.js';
import StretchRunner from '../components/stretch/StretchRunner.jsx';
import StretchLibraryModal from '../components/stretch/StretchLibraryModal.jsx';
import CountUp from '../components/fx/CountUp.jsx';
import useUIStore from '../store/uiStore.js';

function RoutineCard({ routine, onStart }) {
  return (
    <button
      onClick={() => onStart(routine)}
      className="mb-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
      style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
    >
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
        <Play size={16} strokeWidth={2.5} style={{ color: 'var(--color-gold)' }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {routine.name}
        </span>
        <span className="block font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {routine.items.length} moves · {Math.round(routine.totalSec / 60)} min
        </span>
      </span>
      <span className="flex flex-shrink-0 items-center gap-1 font-mono text-xs" style={{ color: 'var(--color-ash)' }}>
        <Clock size={12} /> {formatClock(routine.totalSec)}
      </span>
    </button>
  );
}

export default function StretchPage() {
  const [params, setParams] = useSearchParams();
  const phase = params.get('phase') === 'post' ? 'post' : 'pre';
  const workoutId = params.get('workoutId') ? Number(params.get('workoutId')) : null;

  const routines = useStretchRoutines(phase);
  const logs = useStretchLogs(8);
  const stats = useStretchStats();
  const [running, setRunning] = useState(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  function setPhase(next) {
    const p = new URLSearchParams(params);
    p.set('phase', next);
    setParams(p, { replace: true });
  }

  async function handleDone(elapsed) {
    const routine = running;
    setRunning(null);
    const saved = await logStretchSession({ routine, elapsed, phase, workoutId });
    if (saved) {
      useUIStore.getState().showToast(`Logged ${formatClock(elapsed)} of stretching`, { type: 'success' });
    }
  }

  async function handleDeleteLog(log) {
    const ok = await useUIStore.getState().confirm({
      title: 'Delete this entry?',
      message: `${log.routineName} · ${formatClock(log.durationSec)}`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) await deleteStretchLog(log.id);
  }

  return (
    <div className="anim-fade-slide-up px-5 pb-24 pt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
            Stretch
          </h1>
          <p className="mt-1 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Warm up well, recover better
          </p>
        </div>
        <button
          onClick={() => setLibraryOpen(true)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--color-ivory)' }}
          aria-label="Stretch library"
        >
          <BookOpen size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
      </div>

      {/* Time stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-3.5" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
          <Timer size={14} style={{ color: 'var(--color-gold)' }} />
          <CountUp value={stats.weekMin} format={(n) => `${Math.round(n)}`} className="mt-1 block font-mono text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }} />
          <p className="font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>min this week</p>
        </div>
        <div className="rounded-2xl p-3.5" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
          <Clock size={14} style={{ color: 'var(--color-ash)' }} />
          <CountUp value={stats.totalMin} format={(n) => `${Math.round(n)}`} className="mt-1 block font-mono text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }} />
          <p className="font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>min all time</p>
        </div>
      </div>

      {/* Phase toggle */}
      <div className="mb-4 flex gap-1.5 overflow-hidden rounded-xl p-1" style={{ background: 'var(--color-ivory)' }}>
        {[
          { key: 'pre', label: 'Pre-workout' },
          { key: 'post', label: 'Post-workout' },
        ].map((t) => {
          const active = phase === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setPhase(t.key)}
              className="flex-1 rounded-lg py-2 font-sans text-xs font-semibold transition-colors"
              style={{
                background: active ? 'var(--color-chalk)' : 'transparent',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: active ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="mb-3 font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {phase === 'pre'
          ? 'Dynamic moves to raise your temperature and open the joints you’re about to load.'
          : 'Longer holds to bring the heart rate down and restore range after training.'}
      </p>

      {routines.length === 0 ? (
        <p className="mt-8 text-center font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading routines…
        </p>
      ) : (
        routines.map((r) => <RoutineCard key={r.id} routine={r} onStart={setRunning} />)
      )}

      {/* Recent stretch log */}
      {logs.length > 0 && (
        <>
          <h2 className="mb-3 mt-7 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Recent sessions
          </h2>
          {logs.map((l) => (
            <div
              key={l.id}
              className="mb-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5"
              style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: l.phase === 'pre' ? 'var(--color-gold)' : 'var(--color-ember)' }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-sans text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {l.routineName}
                </span>
                <span className="block font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {l.date} · {l.phase === 'pre' ? 'warm-up' : 'cool-down'}
                </span>
              </span>
              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {formatClock(l.durationSec)}
              </span>
              <button onClick={() => handleDeleteLog(l)} aria-label="Delete entry">
                <Trash2 size={14} style={{ color: 'var(--color-ash)' }} />
              </button>
            </div>
          ))}
        </>
      )}

      {running && (
        <StretchRunner
          routine={running}
          phase={phase}
          workoutId={workoutId}
          onDone={handleDone}
          onClose={() => setRunning(null)}
        />
      )}
      <StretchLibraryModal isOpen={libraryOpen} onClose={() => setLibraryOpen(false)} />
    </div>
  );
}
