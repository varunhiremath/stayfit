import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, RotateCcw, Activity } from 'lucide-react';
import useWorkoutStore from '../store/workoutStore.js';
import ExerciseSection from '../components/workout/ExerciseSection.jsx';
import ExercisePicker from '../components/workout/ExercisePicker.jsx';
import SessionTimer from '../components/workout/SessionTimer.jsx';
import EndWorkoutModal from '../components/workout/EndWorkoutModal.jsx';
import TemplateCard from '../components/template/TemplateCard.jsx';
import Particles from '../components/fx/Particles.jsx';
import { useExercise } from '../hooks/useExercises.js';
import { useTemplatesWithExercises } from '../hooks/useTemplates.js';
import { useHaptics } from '../hooks/useHaptics.js';
import { maybePromptPermission, notifyPR } from '../utils/notifications.js';
import { saveWorkoutAsRoutine, advanceProgression } from '../utils/templateActions.js';
import { playChime } from '../utils/sound.js';
import { partitionSession, summarise } from '../utils/sessionFlow.js';
import useUIStore from '../store/uiStore.js';

function ExerciseSectionWrapper({ ex, onRemove, onSwap, expanded, onToggleExpand, isDone, sessionIds, liveSecs }) {
  const exerciseData = useExercise(ex.exerciseId);
  const muscleGroup = exerciseData?.muscleGroup ?? null;
  return (
    <ExerciseSection
      exercise={ex}
      muscleGroup={muscleGroup}
      isBodyweight={exerciseData?.equipment === 'bodyweight'}
      isCardio={exerciseData?.equipment === 'cardio'}
      onRemove={onRemove}
      onSwap={onSwap}
      expanded={expanded}
      onToggleExpand={onToggleExpand}
      isDone={isDone}
      sessionIds={sessionIds}
      liveSecs={liveSecs}
    />
  );
}

export default function WorkoutPage() {
  const { activeWorkout, resumed, dismissResumed, startWorkout, startFromTemplate, addExercise, removeExercise, swapExercise, discardWorkout, completeWorkout, setWorkoutName, setWorkoutNotes, accrueExerciseTime } = useWorkoutStore();
  const navigate = useNavigate();
  const templates = useTemplatesWithExercises();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  // Which card is open — nothing until you tap an exercise.
  const [openId, setOpenId] = useState(null);
  const [liveSecs, setLiveSecs] = useState(0);
  const openedAt = useRef(Date.now());
  const nameRef = useRef();
  const haptic = useHaptics();

  // Gentle cue when a session was restored from a lock/reload.
  useEffect(() => {
    if (resumed && activeWorkout) {
      haptic('success');
      playChime('success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumed]);

  const alreadyAdded = activeWorkout?.exercises.map((e) => e.exerciseId) ?? [];

  const exercises = activeWorkout?.exercises ?? [];

  // If the open exercise disappears (removed or swapped out), close rather than
  // jumping somewhere the user didn't choose.
  useEffect(() => {
    if (openId != null && !exercises.some((e) => e.exerciseId === openId)) closeOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises.length]);

  // Ticks once a second so the open card's time reads live.
  useEffect(() => {
    if (openId == null) { setLiveSecs(0); return undefined; }
    setLiveSecs(0);
    const id = setInterval(() => setLiveSecs(Math.round((Date.now() - openedAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [openId]);

  const { todo, done } = partitionSession(exercises, openId);
  const sessionIds = exercises.map((e) => e.exerciseId);
  const sessionTotals = exercises.reduce(
    (acc, e) => { const t = summarise(e); acc.sets += t.sets; acc.volumeKg += t.volumeKg; return acc; },
    { sets: 0, volumeKg: 0 }
  );
  const completedCount = exercises.filter((e) => (e.sets?.length ?? 0) > 0).length;

  // Bank the time spent on whichever card was open.
  function bankTime() {
    if (openId == null) return;
    accrueExerciseTime(openId, (Date.now() - openedAt.current) / 1000);
  }

  function closeOpen() {
    bankTime();
    setOpenId(null);
    setLiveSecs(0);
  }

  // Nothing opens by itself — a card opens only when you tap it, and opening
  // one closes (and times) whatever was open before.
  function toggleOpen(id) {
    if (openId === id) { closeOpen(); return; }
    bankTime();
    openedAt.current = Date.now();
    setLiveSecs(0);
    setOpenId(id);
  }

  async function handleSave(routine) {
    bankTime();
    const snapshot = activeWorkout; // completeWorkout clears the store — capture first
    let result;
    try {
      result = await completeWorkout();
    } catch (e) {
      // Never fail silently: the session is preserved (completeWorkout only
      // clears the store on success), so surface the error and let the user
      // retry instead of the button appearing to do nothing.
      console.error('Finish workout failed:', e);
      useUIStore.getState().showToast("Couldn't save the workout — your session is safe. Try again.", { type: 'error' });
      return;
    }
    setEndOpen(false);
    if (result?.discarded) return; // empty session — nothing saved

    // Advance the routine's targets by its progression scheme (if any).
    if (snapshot?.templateId) {
      try {
        const prog = await advanceProgression(snapshot.templateId, snapshot.exercises);
        if (prog?.count) {
          const verb = prog.mode === 'linear' ? 'progressed' : 'updated';
          useUIStore.getState().showToast(`Routine ${verb}: next targets set for ${prog.count} lift${prog.count > 1 ? 's' : ''}`, { type: 'success' });
        }
      } catch (e) {
        console.error('Progression advance failed (workout still saved):', e);
      }
    }

    // Keep an ad-hoc session as a routine if the user opted in.
    if (routine?.saveRoutine) {
      try {
        const savedName = await saveWorkoutAsRoutine({ ...routine, name: routine.routineName, workout: snapshot });
        if (savedName) useUIStore.getState().showToast(`Saved as "${savedName}"`, { type: 'success' });
      } catch (e) {
        console.error('Save-as-routine failed (workout still saved):', e);
      }
    }

    await maybePromptPermission();
    if (result?.prCount > 0) {
      notifyPR(`You set ${result.prCount} new record${result.prCount === 1 ? '' : 's'} this session.`);
      haptic('pr');
      playChime('pr');
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1300);
    } else {
      haptic('success');
      playChime('success');
    }
  }

  if (!activeWorkout) {
    return (
      <>
        {celebrate && <Particles />}
        <div className="anim-fade-slide-up px-5 pb-24 pt-8">
        <h1 className="font-display text-5xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
          Ready?
        </h1>
        <p className="mt-1 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Start fresh or pick a routine
        </p>

        {/* Warm up first — a pre-workout stretch before you lift. */}
        <button
          onClick={() => navigate('/library?tab=stretches&phase=pre')}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
            <Activity size={15} style={{ color: 'var(--color-ember)' }} />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Warm up first</span>
            <span className="block font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>A few minutes of dynamic stretching</span>
          </span>
          <ChevronRight size={15} style={{ color: 'var(--color-ash)' }} />
        </button>

        <button
          onClick={() => { playChime('start'); startWorkout(); }}
          className="mt-3 w-full rounded-2xl py-4 font-sans text-base font-semibold"
          style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
        >
          Quick start (empty)
        </button>

        <div className="mt-8 mb-3 flex items-center justify-between">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Your routines
          </h2>
          <button
            onClick={() => navigate('/templates')}
            className="flex items-center gap-1 font-sans text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Manage <ChevronRight size={12} />
          </button>
        </div>

        {templates.length === 0 ? (
          <button
            onClick={() => navigate('/templates')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-5 font-sans text-sm font-medium"
            style={{ border: '1px dashed var(--color-ash)', color: 'var(--color-text-secondary)' }}
          >
            <Plus size={15} /> Create a routine
          </button>
        ) : (
          templates.map((t) => (
            <TemplateCard key={t.id} template={t} onStart={(tpl) => { playChime('start'); startFromTemplate(tpl); }} />
          ))
        )}
        </div>
      </>
    );
  }

  return (
    <div className="px-5 pb-40 pt-8">
      {resumed && (
        <div
          className="anim-fade-slide-up mb-4 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-gold)' }}
        >
          <RotateCcw size={14} style={{ color: 'var(--color-gold)' }} />
          <span className="flex-1 font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Picked up your in-progress workout.
          </span>
          <button onClick={dismissResumed} className="font-sans text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
            Got it
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex-1">
          {editingName ? (
            <input
              ref={nameRef}
              autoFocus
              value={activeWorkout.name}
              onChange={(e) => setWorkoutName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="w-full bg-transparent font-display text-3xl font-bold leading-none outline-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="text-left">
              <h1 className="font-display text-3xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
                {activeWorkout.name}
              </h1>
            </button>
          )}
        </div>
        <div className="ml-4 flex gap-2">
          <button
            onClick={discardWorkout}
            className="rounded-xl px-3 py-2 font-sans text-xs font-medium"
            style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)' }}
          >
            Discard
          </button>
          <button
            onClick={() => setEndOpen(true)}
            className="rounded-xl px-3 py-2 font-sans text-xs font-semibold"
            style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
          >
            Finish
          </button>
        </div>
      </div>

      {/* Session clock */}
      <SessionTimer
        startedAt={activeWorkout.startedAt}
        volumeKg={sessionTotals.volumeKg}
        done={completedCount}
        total={exercises.length}
      />

      {/* Up next — one card open at a time, the rest collapsed to a row */}
      {todo.length > 0 && (
        <p className="mb-2 mt-1 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
          {done.length > 0 ? 'Up next' : 'Your exercises'}
        </p>
      )}
      {todo.map((ex) => (
        <ExerciseSectionWrapper
          key={ex.exerciseId}
          ex={ex}
          expanded={openId === ex.exerciseId}
          onToggleExpand={() => toggleOpen(ex.exerciseId)}
          liveSecs={liveSecs}
          sessionIds={sessionIds}
          onRemove={() => removeExercise(ex.exerciseId)}
          onSwap={(pick) => swapExercise(ex.exerciseId, pick)}
        />
      ))}

      {/* Done — finished work, folded away */}
      {done.length > 0 && (
        <>
          <p className="mb-2 mt-5 flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Done · {done.length}
          </p>
          {done.map((ex) => (
            <ExerciseSectionWrapper
              key={ex.exerciseId}
              ex={ex}
              expanded={false}
              isDone
              onToggleExpand={() => toggleOpen(ex.exerciseId)}
              sessionIds={sessionIds}
                  onRemove={() => removeExercise(ex.exerciseId)}
            />
          ))}
        </>
      )}

      {/* Add exercise */}
      <button
        onClick={() => setPickerOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-sans text-sm font-medium"
        style={{ background: 'var(--color-chalk)', border: '1px dashed var(--color-ivory)', color: 'var(--color-text-secondary)' }}
      >
        <Plus size={16} /> Add exercise
      </button>

      {/* Session note */}
      <textarea
        value={activeWorkout.notes ?? ''}
        onChange={(e) => setWorkoutNotes(e.target.value)}
        placeholder="Session notes — how it felt, what to change next time…"
        rows={2}
        className="mt-4 w-full resize-none rounded-2xl px-4 py-3 font-sans text-sm outline-none"
        style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)', color: 'var(--color-text-primary)' }}
      />

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(ex) => { playChime('tap'); addExercise(ex); }}
        alreadyAdded={alreadyAdded}
      />

      <EndWorkoutModal
        isOpen={endOpen}
        activeWorkout={activeWorkout}
        elapsedSecs={Math.round((Date.now() - activeWorkout.startedAt) / 1000)}
        onSave={handleSave}
        onClose={() => setEndOpen(false)}
        onCooldown={() => { setEndOpen(false); navigate('/library?tab=stretches&phase=post'); }}
      />
    </div>
  );
}
