import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Moon, Play, Shuffle, Activity, Check, ChevronLeft } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { useDailyBriefing } from '../../hooks/useDailyBriefing.js';
import { useExercises } from '../../hooks/useExercises.js';
import { rankSwaps } from '../../utils/dailyBriefing.js';
import { generateRoutine, makeRng } from '../../utils/routineGenerator.js';
import { playChime } from '../../utils/sound.js';
import useWorkoutStore from '../../store/workoutStore.js';
import useUIStore from '../../store/uiStore.js';

function Option({ icon: Icon, title, subtitle, onClick, primary = false }) {
  return (
    <button
      onClick={onClick}
      className="mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
      style={
        primary
          ? { background: 'var(--color-gold)' }
          : { background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }
      }
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: primary ? 'rgba(255,255,255,0.22)' : 'var(--color-ivory)' }}
      >
        <Icon size={16} style={{ color: primary ? 'var(--color-text-inverse)' : 'var(--color-gold)' }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-sans text-sm font-semibold" style={{ color: primary ? 'var(--color-text-inverse)' : 'var(--color-text-primary)' }}>
          {title}
        </span>
        {subtitle && (
          <span className="block truncate font-sans text-xs" style={{ color: primary ? 'rgba(255,255,255,0.85)' : 'var(--color-text-secondary)' }}>
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

// Shown once a day when the app opens: where you left off, what's planned for
// today, and a way to swap that plan for something else.
export default function DailyBriefing() {
  const { due, briefing, plan, dismiss } = useDailyBriefing();
  const [swapping, setSwapping] = useState(false);
  const navigate = useNavigate();
  const exercises = useExercises();
  const startFromTemplate = useWorkoutStore((s) => s.startFromTemplate);

  if (!due) return null;

  const close = () => { setSwapping(false); dismiss(); };

  function startPlanned() {
    playChime('start');
    startFromTemplate(plan.today.routine);
    dismiss();
    navigate('/workout');
  }

  // Build an ad-hoc session for the chosen focus and drop straight into it.
  // Fed through startFromTemplate as a synthetic routine so the generated
  // sets/reps targets survive; templateId stays null, so it behaves like any
  // other ad-hoc session (offered as "save as routine" at the end).
  function startSwap(target) {
    const picks = generateRoutine({
      exercises,
      groups: target.groups,
      level: 'intermediate',
      rng: makeRng(Date.now()),
    });
    const chosen = picks
      .map((p) => {
        const ex = exercises.find((e) => e.id === p.exerciseId);
        return ex ? { id: ex.id, name: ex.name, targetSets: p.targetSets, targetReps: p.targetReps, targetWeight: null } : null;
      })
      .filter(Boolean);

    if (!chosen.length) {
      useUIStore.getState().showToast('No exercises found for that focus yet.', { type: 'info' });
      return;
    }
    playChime('start');
    startFromTemplate({ id: null, name: `${target.label} session`, exercises: chosen });
    dismiss();
    navigate('/workout');
  }

  function justStretch() {
    dismiss();
    navigate('/library?tab=stretches&phase=pre');
  }

  const t = briefing.today;
  const icon = t.kind === 'rest' ? Moon : t.kind === 'done' ? Check : CalendarCheck;

  return (
    <Modal isOpen onClose={close} title={swapping ? 'Train something else' : 'Welcome back'}>
      {swapping ? (
        <>
          <button
            onClick={() => setSwapping(false)}
            className="mb-3 flex items-center gap-1.5 font-sans text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <p className="mb-3 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Pick a focus and we'll put a session together for you.
            {briefing.recentFocus.length > 0 && ` You last trained ${briefing.recentFocus.join(', ')}.`}
          </p>
          {rankSwaps(briefing.recentFocus).map((target) => (
            <Option
              key={target.key}
              icon={Shuffle}
              title={target.label}
              subtitle={target.groups.map((g) => g.replace(/-/g, ' ')).slice(0, 3).join(' · ')}
              onClick={() => startSwap(target)}
            />
          ))}
        </>
      ) : (
        <>
          {/* Where you left off */}
          {briefing.lastLine ? (
            <div className="mb-4 rounded-2xl px-4 py-3" style={{ background: 'var(--color-ivory)' }}>
              <p className="font-sans text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {briefing.lastLine.text}
              </p>
            </div>
          ) : (
            <div className="mb-4 rounded-2xl px-4 py-3" style={{ background: 'var(--color-ivory)' }}>
              <p className="font-sans text-sm" style={{ color: 'var(--color-text-primary)' }}>
                No sessions logged yet — today's a good day to start.
              </p>
            </div>
          )}

          {/* Today */}
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Today
          </p>
          <div className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
              {(() => { const I = icon; return <I size={17} style={{ color: t.kind === 'rest' ? 'var(--color-sage)' : 'var(--color-gold)' }} />; })()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-sans text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t.title}
              </span>
              <span className="block truncate font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t.subtitle}
              </span>
            </span>
          </div>

          {/* What do you want to do? */}
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            {t.kind === 'planned' ? 'Start, or change it' : 'What would you like to do?'}
          </p>

          {t.kind === 'planned' && (
            <Option primary icon={Play} title={`Start ${t.title}`} subtitle="Stick to the plan" onClick={startPlanned} />
          )}
          <Option
            icon={Shuffle}
            title={t.kind === 'planned' ? 'Train something else' : 'Build me a session'}
            subtitle="Pick a different muscle group"
            onClick={() => setSwapping(true)}
          />
          <Option icon={Activity} title="Just stretch today" subtitle="Warm-up and mobility routines" onClick={justStretch} />

          <button
            onClick={close}
            className="mt-2 w-full rounded-xl py-3 font-sans text-sm font-medium"
            style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)' }}
          >
            {t.kind === 'rest' ? 'Rest today' : 'Not now'}
          </button>
        </>
      )}
    </Modal>
  );
}
