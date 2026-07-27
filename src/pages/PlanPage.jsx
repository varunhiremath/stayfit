import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, CalendarRange, BookOpen, Bell, BellOff, ChevronRight } from 'lucide-react';
import { useTemplatesWithExercises } from '../hooks/useTemplates.js';
import { useExercises } from '../hooks/useExercises.js';
import { useWorkouts } from '../hooks/useWorkout.js';
import { useNextSession } from '../hooks/useNextSession.js';
import { deleteTemplate, duplicateTemplate, updateTemplate, renameTemplate } from '../utils/templateActions.js';
import { reshuffleRoutine, makeRng } from '../utils/routineGenerator.js';
import { sessionCounts, isStaleRoutine } from '../utils/staleRoutine.js';
import { playChime } from '../utils/sound.js';
import { DAY_SHORT } from '../utils/nextSession.js';
import TemplateCard from '../components/template/TemplateCard.jsx';
import TemplateBuilder from '../components/template/TemplateBuilder.jsx';
import RoutineGeneratorModal from '../components/template/RoutineGeneratorModal.jsx';
import WeekPlannerModal from '../components/template/WeekPlannerModal.jsx';
import WeeklyPlanner from '../components/template/WeeklyPlanner.jsx';
import ProgramsModal from '../components/template/ProgramsModal.jsx';
import ReminderSettings from '../components/plan/ReminderSettings.jsx';
import useSettingsStore from '../store/settingsStore.js';
import useWorkoutStore from '../store/workoutStore.js';
import useUIStore from '../store/uiStore.js';

// Compact week strip showing which days have a session planned.
function WeekStrip({ templates, todayDow }) {
  const byDay = {};
  for (const t of templates) if (t.dayOfWeek != null) (byDay[t.dayOfWeek] ??= []).push(t);
  return (
    <div className="mb-5 flex gap-1.5">
      {DAY_SHORT.map((label, dow) => {
        const has = !!byDay[dow]?.length;
        const isToday = dow === todayDow;
        return (
          <div
            key={dow}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2"
            style={{
              background: has ? 'var(--color-gold)' : 'var(--color-chalk)',
              border: isToday ? '2px solid var(--color-text-primary)' : '1px solid var(--color-ivory)',
            }}
          >
            <span
              className="font-sans text-[10px] font-semibold uppercase"
              style={{ color: has ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)' }}
            >
              {label}
            </span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: has ? 'var(--color-text-inverse)' : 'var(--color-ivory)' }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function PlanPage() {
  const navigate = useNavigate();
  const templates = useTemplatesWithExercises();
  const allExercises = useExercises();
  const workouts = useWorkouts();
  const counts = sessionCounts(workouts);
  const info = useNextSession();
  const startFromTemplate = useWorkoutStore((s) => s.startFromTemplate);
  const reminderEnabled = useSettingsStore((s) => s.reminderEnabled);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  function openNew() {
    setEditing(null);
    setBuilderOpen(true);
  }

  function openEdit(template) {
    setEditing(template);
    setBuilderOpen(true);
  }

  async function handleDelete(template) {
    const ok = await useUIStore.getState().confirm({
      title: 'Delete routine?',
      message: `"${template.name}" will be removed.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) await deleteTemplate(template.id);
  }

  async function handleRename(template) {
    const name = await useUIStore.getState().prompt({
      title: 'Rename routine',
      placeholder: 'Routine name',
      defaultValue: template.name,
    });
    if (name != null && name.trim() && name.trim() !== template.name) {
      await renameTemplate(template.id, name);
    }
  }

  // One-tap "medium" re-roll from the card: keep the routine's shape, swap ~half.
  async function handleShuffle(template) {
    const slots = template.exercises.map((e) => ({
      exerciseId: e.id,
      muscleGroup: e.muscleGroup,
      difficulty: e.difficulty,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      targetWeight: e.targetWeight,
    }));
    const next = reshuffleRoutine({ slots, intensity: 'medium', pool: allExercises, rng: makeRng(Date.now()) });
    playChime('start');
    await updateTemplate(template.id, {
      name: template.name,
      dayOfWeek: template.dayOfWeek,
      color: template.color,
      exercises: next.map((s) => ({ exerciseId: s.exerciseId, targetSets: s.targetSets, targetReps: s.targetReps, targetWeight: s.targetWeight })),
    });
  }

  function startToday() {
    const t = info.today?.routine;
    if (!t) return;
    playChime('start');
    startFromTemplate(t);
    navigate('/workout');
  }

  return (
    <div className="anim-fade-slide-up px-5 pb-24 pt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
            Your plan
          </h1>
          <p className="mt-1 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Pick a split, set your week
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--color-gold)' }}
          aria-label="New routine"
        >
          <Plus size={20} style={{ color: 'var(--color-text-inverse)' }} strokeWidth={2.5} />
        </button>
      </div>

      {templates.length > 0 && <WeekStrip templates={templates} todayDow={new Date().getDay()} />}

      {/* Next up — the schedule answer, front and centre */}
      {info.hasSchedule && (
        <div
          className="mb-4 rounded-2xl px-4 py-4"
          style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            {info.today && !info.today.done ? 'Today' : info.restDay ? 'Rest day' : 'Next up'}
          </p>
          <p className="mt-1 font-sans text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {info.today && !info.today.done
              ? info.today.routine.name
              : info.next
                ? `${info.next.routine.name} · ${info.next.label}`
                : 'Nothing scheduled'}
          </p>
          {info.today && !info.today.done ? (
            <button
              onClick={startToday}
              className="mt-3 w-full rounded-xl py-3 font-sans text-sm font-semibold"
              style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
            >
              Start this session
            </button>
          ) : (
            <p className="mt-1 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {info.message}
            </p>
          )}
        </div>
      )}

      {/* Reminder toggle entry */}
      <button
        onClick={() => setRemindersOpen(true)}
        className="mb-6 flex w-full items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
          {reminderEnabled
            ? <Bell size={15} style={{ color: 'var(--color-gold)' }} />
            : <BellOff size={15} style={{ color: 'var(--color-ash)' }} />}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Session reminders
          </span>
          <span className="block font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {reminderEnabled ? 'On — nudges you on training days' : 'Off'}
          </span>
        </span>
        <ChevronRight size={16} style={{ color: 'var(--color-ash)' }} />
      </button>

      {/* Action pills */}
      <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1">
        <button
          onClick={() => setProgramsOpen(true)}
          className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 font-sans text-xs font-semibold"
          style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)' }}
        >
          <BookOpen size={15} style={{ color: 'var(--color-gold)' }} /> Programs
        </button>
        <button
          onClick={() => setPlanOpen(true)}
          className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 font-sans text-xs font-semibold"
          style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)' }}
        >
          <CalendarRange size={15} style={{ color: 'var(--color-gold)' }} /> Plan week
        </button>
        <button
          onClick={() => setGenOpen(true)}
          className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 font-sans text-xs font-semibold"
          style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)' }}
        >
          <Sparkles size={15} style={{ color: 'var(--color-gold)' }} /> Auto
        </button>
      </div>

      {templates.length > 0 && <WeeklyPlanner templates={templates} />}

      {templates.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="font-display text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            No plan yet
          </p>
          <p className="mt-2 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Choose a split like Push/Pull/Legs and we'll set up your week.
          </p>
          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              onClick={() => setPlanOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-sans text-sm font-semibold"
              style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
            >
              <CalendarRange size={16} /> Plan my week
            </button>
            <button
              onClick={() => setProgramsOpen(true)}
              className="font-sans text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              or pick a ready-made program
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="mb-3 mt-2 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Your routines
          </h2>
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={openEdit}
              onRename={handleRename}
              onDelete={handleDelete}
              onDuplicate={(x) => duplicateTemplate(x.id)}
              onShuffle={handleShuffle}
              stale={isStaleRoutine(t, counts[t.id] ?? 0)}
            />
          ))}
        </>
      )}

      <TemplateBuilder isOpen={builderOpen} onClose={() => setBuilderOpen(false)} editing={editing} />
      <RoutineGeneratorModal isOpen={genOpen} onClose={() => setGenOpen(false)} />
      <ProgramsModal isOpen={programsOpen} onClose={() => setProgramsOpen(false)} />
      <WeekPlannerModal isOpen={planOpen} onClose={() => setPlanOpen(false)} />
      <ReminderSettings isOpen={remindersOpen} onClose={() => setRemindersOpen(false)} />
    </div>
  );
}
