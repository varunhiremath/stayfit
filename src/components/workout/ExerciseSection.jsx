import { useState } from 'react';
import { X, StickyNote, Check, ChevronDown, Info, Clock } from 'lucide-react';
import SetLogger from './SetLogger.jsx';
import CardioLogger from './CardioLogger.jsx';
import OverloadNudge from './OverloadNudge.jsx';
import ExerciseInfoModal from './ExerciseInfoModal.jsx';
import ExerciseDemo from './ExerciseDemo.jsx';
import SwapSuggestions from './SwapSuggestions.jsx';
import useSettingsStore from '../../store/settingsStore.js';
import { useExerciseNote } from '../../hooks/useExercises.js';
import { fmtVolume } from '../../utils/units.js';
import { summarise, formatElapsed } from '../../utils/sessionFlow.js';

const MUSCLE_HUE = {
  chest: '#EA580C', triceps: '#EA580C', 'front-deltoids': '#EA580C',
  biceps: '#CA8A04', forearm: '#CA8A04',
  'upper-back': '#0D9488', 'lower-back': '#0D9488', trapezius: '#0D9488', 'back-deltoids': '#0D9488',
  quadriceps: '#64748B', hamstring: '#64748B', gluteal: '#64748B', calves: '#64748B',
  abs: '#CA8A04', obliques: '#CA8A04',
};

export default function ExerciseSection({
  exercise, muscleGroup, isBodyweight, isCardio, onSetLogged, onRemove, onSwap,
  expanded = true, onToggleExpand, isDone = false, sessionIds = [], liveSecs = 0,
}) {
  const hue = MUSCLE_HUE[muscleGroup] ?? '#64748B';
  const unit = useSettingsStore((s) => s.unit);
  const note = useExerciseNote(exercise.exerciseId);
  const [infoOpen, setInfoOpen] = useState(false);

  const { sets: setCount, reps: totalReps, volumeKg: volKg } = summarise(exercise);

  const cardioKcal = exercise.sets.reduce((a, s) => a + (s.calories || 0), 0);
  const cardioMin = Math.round(exercise.sets.reduce((a, s) => a + (s.durationSec || 0), 0) / 60);

  const tally = isCardio
    ? (cardioKcal > 0 ? `${cardioMin} min · ${cardioKcal} kcal` : null)
    : setCount > 0
      ? `${setCount} set${setCount === 1 ? '' : 's'}${totalReps ? ` · ${totalReps} reps` : ''}${volKg ? ` · ${fmtVolume(volKg, unit)}` : ''}`
      : null;

  // Time focused on this exercise: banked seconds plus whatever the open card
  // has accrued since it was opened.
  const secs = (exercise.activeSecs ?? 0) + (expanded ? liveSecs : 0);

  // ── Collapsed: one tappable row. Done rows are quieter still. ──────────────
  if (!expanded) {
    return (
      <div
        className="mb-2 rounded-2xl"
        style={{
          background: isDone ? 'transparent' : 'var(--color-chalk)',
          border: `1px solid ${isDone ? 'var(--color-ivory)' : 'var(--color-ivory)'}`,
          opacity: isDone ? 0.85 : 1,
        }}
      >
        <button onClick={onToggleExpand} className="flex w-full items-center gap-3 px-4 py-3 text-left">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: isDone ? 'var(--color-gold)' : hue + '1F' }}
          >
            {isDone
              ? <Check size={15} strokeWidth={3} style={{ color: 'var(--color-text-inverse)' }} />
              : <span className="h-2 w-2 rounded-full" style={{ background: hue }} />}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block truncate font-sans text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)', textDecoration: isDone ? 'none' : 'none' }}
            >
              {exercise.name}
            </span>
            <span className="block truncate font-sans text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>
              {tally ?? (muscleGroup ?? '').replace(/-/g, ' ')}
            </span>
          </span>
          {isDone && secs > 0 && (
            <span className="flex flex-shrink-0 items-center gap-1 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <Clock size={11} /> {formatElapsed(secs)}
            </span>
          )}
          <ChevronDown size={16} style={{ color: 'var(--color-ash)' }} />
        </button>

        {/* Alternatives are only worth offering for something you haven't started. */}
        {!isDone && setCount === 0 && onSwap && (
          <div className="px-4 pb-3">
            <SwapSuggestions muscleGroup={muscleGroup} sessionIds={sessionIds} onSwap={onSwap} />
          </div>
        )}
      </div>
    );
  }

  // ── Expanded: the full logging card ───────────────────────────────────────
  return (
    <div
      className="anim-fade-in mb-3 rounded-2xl px-4 pb-4 pt-3"
      style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-gold)' }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setInfoOpen(true)}
              className="min-w-0 text-left font-sans text-base font-semibold"
              style={{
                color: 'var(--color-gold)',
                textDecoration: 'underline',
                textDecorationColor: 'color-mix(in srgb, var(--color-gold) 40%, transparent)',
                textUnderlineOffset: 3,
              }}
              title={`About ${exercise.name}`}
            >
              {exercise.name}
            </button>
            <Info size={12} style={{ color: 'var(--color-ash)', flexShrink: 0 }} />
          </div>
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 font-sans text-xs capitalize"
            style={{ background: hue + '1F', color: hue }}
          >
            {(muscleGroup ?? '').replace(/-/g, ' ')}
          </span>
        </div>
        <div className="ml-2 flex flex-shrink-0 items-center gap-2">
          <button
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: 'var(--color-ivory)' }}
            aria-label="Remove exercise"
          >
            <X size={13} style={{ color: 'var(--color-ash)' }} />
          </button>
          <button
            onClick={onToggleExpand}
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: 'var(--color-ivory)' }}
            aria-label="Collapse exercise"
          >
            <ChevronDown size={14} style={{ color: 'var(--color-ash)', transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>

      <ExerciseDemo name={exercise.name} />

      {note && (
        <div className="mt-3 flex items-start gap-2 rounded-xl px-3 py-2" style={{ background: 'var(--color-ivory)' }}>
          <StickyNote size={13} style={{ color: 'var(--color-ash)', marginTop: 1, flexShrink: 0 }} />
          <p className="font-sans text-xs italic" style={{ color: 'var(--color-text-secondary)' }}>{note}</p>
        </div>
      )}

      {isCardio ? (
        <>
          {cardioKcal > 0 && (
            <p className="mt-3 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {cardioMin} min · <span style={{ color: 'var(--color-gold)' }}>{cardioKcal} kcal</span>
            </p>
          )}
          <CardioLogger exerciseId={exercise.exerciseId} onLogged={() => onSetLogged?.(exercise.exerciseId)} />
        </>
      ) : (
        <>
          {setCount > 0 && (
            <p className="mt-3 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {setCount} set{setCount === 1 ? '' : 's'}
              {totalReps > 0 ? ` · ${totalReps} reps` : ''}
              {volKg > 0 ? ` · ${fmtVolume(volKg, unit)}` : ''}
            </p>
          )}

          <div className="mt-3">
            <OverloadNudge exerciseId={exercise.exerciseId} />
          </div>

          <SetLogger exerciseId={exercise.exerciseId} onSetLogged={() => onSetLogged?.(exercise.exerciseId)} isBodyweight={isBodyweight} />

          {setCount === 0 && onSwap && (
            <SwapSuggestions muscleGroup={muscleGroup} sessionIds={sessionIds} onSwap={onSwap} />
          )}
        </>
      )}

      <ExerciseInfoModal exerciseId={exercise.exerciseId} isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
