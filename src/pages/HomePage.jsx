import { useNavigate } from 'react-router-dom';
import { Flame, ChevronRight, Play, Moon, CalendarCheck, Activity, Dumbbell, Timer } from 'lucide-react';
import { useProfile } from '../hooks/useProfile.js';
import { useWorkouts } from '../hooks/useWorkout.js';
import { useSessionReminder } from '../hooks/useNextSession.js';
import { useLifetimeStats } from '../hooks/useProgress.js';
import { useStretchStats } from '../hooks/useStretches.js';
import { playChime } from '../utils/sound.js';
import WorkoutCard from '../components/workout/WorkoutCard.jsx';
import WeeklyRecap from '../components/progress/WeeklyRecap.jsx';
import ActivityRings from '../components/progress/ActivityRings.jsx';
import WeightCard from '../components/health/WeightCard.jsx';
import CountUp from '../components/fx/CountUp.jsx';
import BrandMark from '../components/logo/BrandMark.jsx';
import DailyBriefing from '../components/home/DailyBriefing.jsx';
import useWorkoutStore from '../store/workoutStore.js';

function TodayCard({ icon: Icon = Play, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl px-5 py-4"
      style={{ background: 'var(--color-gold)' }}
    >
      <div className="min-w-0 text-left">
        <p className="truncate font-sans text-base font-semibold" style={{ color: 'var(--color-text-inverse)' }}>
          {title}
        </p>
        <p className="truncate font-sans text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {subtitle}
        </p>
      </div>
      <div
        className="ml-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,0.22)' }}
      >
        <Icon size={16} strokeWidth={2.4} style={{ color: 'var(--color-text-inverse)' }} />
      </div>
    </button>
  );
}

function QuickAction({ icon: Icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-start gap-1.5 rounded-2xl px-3.5 py-3"
      style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
        <Icon size={15} style={{ color: 'var(--color-gold)' }} />
      </span>
      <span className="font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
      <span className="font-sans text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{sub}</span>
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const workouts = useWorkouts();
  // Also fires the best-effort local reminder for a scheduled session.
  const plan = useSessionReminder();
  const life = useLifetimeStats();
  const stretch = useStretchStats();
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const startFromTemplate = useWorkoutStore((s) => s.startFromTemplate);
  const recent = workouts.slice(0, 2);

  function startTemplate() {
    playChime('start');
    startFromTemplate(plan.today.routine);
    navigate('/workout');
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="anim-fade-slide-up px-5 pb-24 pt-6">
      {/* Once-a-day catch-up: where you left off, what's on today, and swaps. */}
      <DailyBriefing />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {greeting}{profile?.name ? `, ${profile.name}` : ''}
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
            StayFit
          </h1>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {profile?.streak > 0 && (
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-1 font-sans text-xs font-semibold"
              style={{ background: 'var(--color-ivory)', color: 'var(--color-ember)' }}
            >
              <Flame size={12} />{profile.streak}
            </span>
          )}
          <button onClick={() => navigate('/profile')} aria-label="Profile">
            <BrandMark size={36} />
          </button>
        </div>
      </div>

      {/* Today's session — the primary action */}
      <div className="mb-4">
        {activeWorkout ? (
          <TodayCard
            title="Continue workout"
            subtitle={`${activeWorkout.name} in progress`}
            onClick={() => navigate('/workout')}
          />
        ) : plan.today && !plan.today.done ? (
          <TodayCard
            icon={CalendarCheck}
            title={plan.today.routine.name}
            subtitle={`On today's plan · ${plan.today.routine.exercises?.length ?? 0} exercises`}
            onClick={startTemplate}
          />
        ) : plan.restDay ? (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
              <Moon size={16} style={{ color: 'var(--color-sage)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Rest day</p>
              <p className="truncate font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {plan.next ? `Next: ${plan.next.routine.name} ${plan.next.label}` : 'Nothing scheduled'}
              </p>
            </div>
            <button onClick={() => navigate('/workout')} className="flex-shrink-0 font-sans text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
              Train anyway
            </button>
          </div>
        ) : plan.today?.done ? (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4"
            style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
              <Flame size={16} style={{ color: 'var(--color-ember)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Session done</p>
              <p className="truncate font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {plan.next ? `Next: ${plan.next.routine.name} ${plan.next.label}` : 'Great work today'}
              </p>
            </div>
          </div>
        ) : (
          <TodayCard
            title={plan.hasSchedule ? 'Start a workout' : 'Set up your week'}
            subtitle={plan.hasSchedule ? 'Jump into a session' : 'Pick a split and get reminders'}
            onClick={() => navigate(plan.hasSchedule ? '/workout' : '/plan')}
          />
        )}
      </div>

      {/* Quick actions — warm up / cool down */}
      <div className="mb-5 flex gap-3">
        <QuickAction
          icon={Activity}
          label="Warm up"
          sub="Before you lift"
          onClick={() => navigate('/library?tab=stretches&phase=pre')}
        />
        <QuickAction
          icon={Timer}
          label="Cool down"
          sub="After training"
          onClick={() => navigate('/library?tab=stretches&phase=post')}
        />
      </div>

      {/* At-a-glance numbers */}
      <div className="mb-5 grid grid-cols-3 gap-2.5">
        {[
          { label: 'Workouts', value: life.workouts ?? 0, icon: Dumbbell },
          { label: 'Day streak', value: profile?.streak ?? 0, icon: Flame },
          { label: 'Stretch min', value: stretch.totalMin, icon: Activity },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl px-3 py-3" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
            <s.icon size={13} style={{ color: 'var(--color-ash)' }} />
            <CountUp value={s.value} format={(n) => `${Math.round(n)}`} className="mt-1 block font-mono text-xl font-bold" style={{ color: 'var(--color-text-primary)' }} />
            <p className="font-sans text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly recap — auto-hides when no data / dismissed */}
      <WeeklyRecap />

      {/* Daily activity */}
      <div className="mb-6">
        <ActivityRings />
      </div>

      {/* Bodyweight — last reading, trend, and one tap to log a new one */}
      <WeightCard />

      {/* Recent workouts */}
      {recent.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
              Recent
            </h2>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-1 font-sans text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              See all <ChevronRight size={12} />
            </button>
          </div>
          {recent.map((w) => <WorkoutCard key={w.id} workout={w} />)}
        </div>
      ) : (
        <div className="mt-10 text-center">
          <p className="font-display text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Your first session awaits
          </p>
          <p className="mt-2 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Set up your week, then log your first workout.
          </p>
        </div>
      )}
    </div>
  );
}
