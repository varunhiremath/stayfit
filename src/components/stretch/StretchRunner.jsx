import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, SkipForward, SkipBack, Check, Youtube } from 'lucide-react';
import { buildSequence, stepAt, seekToStep, formatClock, totalDuration } from '../../utils/stretchSession.js';
import { playChime } from '../../utils/sound.js';
import { useHaptics } from '../../hooks/useHaptics.js';
import useSettingsStore from '../../store/settingsStore.js';

const RING = 2 * Math.PI * 54; // r=54 in a 120 viewBox

// Full-screen guided stretch player. Sequencing/clock math is pure
// (utils/stretchSession.js); this owns the ticking and the visuals.
export default function StretchRunner({ routine, phase, workoutId = null, onDone, onClose }) {
  const items = routine?.items ?? [];
  const sequence = useMemo(() => buildSequence(items), [items]);
  const total = useMemo(() => totalDuration(items), [items]);

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const lastStep = useRef(-1);
  const haptic = useHaptics();
  const effects = useSettingsStore((s) => s.effects);

  // Tick. Uses wall-clock deltas so a backgrounded tab doesn't drift.
  useEffect(() => {
    if (!running) return;
    let raf;
    let prev = Date.now();
    const tick = () => {
      const now = Date.now();
      setElapsed((e) => Math.min(total, e + (now - prev) / 1000));
      prev = now;
      raf = setTimeout(tick, 250);
    };
    raf = setTimeout(tick, 250);
    return () => clearTimeout(raf);
  }, [running, total]);

  const state = stepAt(sequence, elapsed);

  // Cue on each new stretch, and once at the end.
  useEffect(() => {
    if (state.done) return;
    if (state.index !== lastStep.current) {
      if (lastStep.current !== -1) { playChime('rest'); haptic('tap'); }
      lastStep.current = state.index;
    }
  }, [state.index, state.done, haptic]);

  useEffect(() => {
    if (state.done && running) {
      setRunning(false);
      playChime('success');
      haptic('success');
    }
  }, [state.done, running, haptic]);

  if (!routine) return null;

  const step = state.step;
  const overallPct = total > 0 ? Math.min(1, elapsed / total) : 0;

  const jump = (dir) => {
    const next = seekToStep(sequence, state.index + dir);
    setElapsed(dir < 0 && state.stepElapsed > 2 ? seekToStep(sequence, state.index) : next);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col" style={{ background: 'var(--color-canvas)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {routine.name}
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {formatClock(elapsed)} / {formatClock(total)}
          </p>
        </div>
        <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
          <X size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>

      {/* Overall progress */}
      <div className="mx-5 mt-4 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--color-ivory)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${overallPct * 100}%`, background: 'var(--color-gold)', transition: 'width 250ms linear' }}
        />
      </div>

      {/* Current stretch */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {state.done ? (
          <div className="text-center">
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full"
              style={{ background: 'var(--color-gold)', animation: effects ? 'scaleIn 500ms var(--ease-out)' : undefined }}
            >
              <Check size={44} strokeWidth={3} style={{ color: 'var(--color-text-inverse)' }} />
            </div>
            <p className="mt-6 font-display text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Nice work
            </p>
            <p className="mt-1 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {formatClock(elapsed)} of {phase === 'post' ? 'cool-down' : 'warm-up'} logged
            </p>
          </div>
        ) : (
          <>
            {/* Countdown ring */}
            <div className="relative" style={{ width: 240, height: 240 }}>
              <svg viewBox="0 0 120 120" width={240} height={240}>
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-ivory)" strokeWidth="7" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="var(--color-gold)" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - state.progress)}
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 250ms linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-5xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatClock(state.remaining)}
                </span>
                <span className="mt-1 font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {state.index + 1} of {sequence.length}
                </span>
              </div>
            </div>

            <h2 className="mt-7 text-center font-display text-3xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {step?.name}
            </h2>
            {step?.description && (
              <p className="mt-2 max-w-sm text-center font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {step.description}
              </p>
            )}
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${step?.name ?? ''} stretch how to`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 font-sans text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Youtube size={14} style={{ color: '#FF4444' }} /> Watch how it's done
            </a>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 pb-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)' }}>
        {state.done ? (
          <button
            onClick={() => onDone?.(elapsed)}
            className="w-full rounded-2xl py-4 font-sans text-base font-semibold"
            style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
          >
            Log {formatClock(elapsed)} &amp; finish
          </button>
        ) : (
          <>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => jump(-1)} aria-label="Previous" className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
                <SkipBack size={20} style={{ color: 'var(--color-text-primary)' }} />
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                aria-label={running ? 'Pause' : 'Resume'}
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: 'var(--color-gold)', boxShadow: '0 6px 16px rgba(16,185,129,0.35)' }}
              >
                {running
                  ? <Pause size={26} strokeWidth={2.5} style={{ color: 'var(--color-text-inverse)' }} />
                  : <Play size={26} strokeWidth={2.5} style={{ color: 'var(--color-text-inverse)' }} />}
              </button>
              <button onClick={() => jump(1)} aria-label="Next" className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
                <SkipForward size={20} style={{ color: 'var(--color-text-primary)' }} />
              </button>
            </div>
            <button
              onClick={() => onDone?.(elapsed)}
              className="mt-5 w-full rounded-xl py-3 font-sans text-sm font-medium"
              style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)' }}
            >
              End &amp; log {formatClock(elapsed)}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
