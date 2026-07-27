import { useNavigate } from 'react-router-dom';
import { Settings, Dumbbell, Layers, Trophy, Flame, Clock, CalendarDays, ChevronRight, Activity } from 'lucide-react';
import { useProfile } from '../hooks/useProfile.js';
import { useWorkouts } from '../hooks/useWorkout.js';
import { useCurrentBodyweight, useLifetimeStats } from '../hooks/useProgress.js';
import { useStretchStats } from '../hooks/useStretches.js';
import { fmtWeight, fmtVolume } from '../utils/units.js';
import useSettingsStore from '../store/settingsStore.js';
import CountUp from '../components/fx/CountUp.jsx';
import BrandMark from '../components/logo/BrandMark.jsx';

function StatTile({ icon: Icon, label, value }) {
  const effects = useSettingsStore((s) => s.effects);
  return (
    <div className="rounded-2xl px-3.5 py-3" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
      <Icon size={14} style={{ color: 'var(--color-ash)' }} />
      <p className="mt-1 font-mono text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {effects ? <CountUp value={value} /> : Math.round(value)}
      </p>
      <p className="font-sans text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
    </div>
  );
}

function NavRow({ icon: Icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5"
      style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-ivory)' }}>
        <Icon size={15} style={{ color: 'var(--color-gold)' }} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        {sub && <span className="block font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>{sub}</span>}
      </span>
      <ChevronRight size={16} style={{ color: 'var(--color-ash)' }} />
    </button>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, loaded } = useProfile();
  const workouts = useWorkouts();
  const life = useLifetimeStats();
  const stretch = useStretchStats();
  const bodyweight = useCurrentBodyweight();
  const unit = useSettingsStore((s) => s.unit);

  if (!loaded || !profile) return null;

  const age = profile.birthYear ? new Date().getFullYear() - profile.birthYear : null;
  const identity = [
    age ? `${age} yrs` : null,
    profile.sex || null,
    profile.height ? `${profile.height} cm` : null,
    bodyweight != null ? fmtWeight(bodyweight, unit) : null,
  ].filter(Boolean);

  return (
    <div className="anim-fade-slide-up px-5 pb-24 pt-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <BrandMark size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-3xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
            {profile.name || 'Your profile'}
          </h1>
          <p className="truncate font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {identity.length ? identity.join('  ·  ') : `Member since ${profile.joinDate}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--color-ivory)' }}
        >
          <Settings size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
      </div>

      {/* Lifetime stats */}
      <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
        All time
      </h2>
      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <StatTile icon={Dumbbell} label="Workouts" value={life.workouts} />
        <StatTile icon={Layers} label="Sets" value={life.totalSets} />
        <StatTile icon={Trophy} label="PRs" value={life.prCount} />
        <StatTile icon={Flame} label="Day streak" value={profile.streak ?? 0} />
        <StatTile icon={Clock} label="Hours" value={life.hours} />
        <StatTile icon={Activity} label="Stretch min" value={stretch.totalMin} />
      </div>

      {/* Volume + bodyweight */}
      <div className="mb-6 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl px-4 py-3.5" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
          <p className="font-sans text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Total volume</p>
          <p className="mt-1 font-mono text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {fmtVolume(life.totalVolume, unit)}
          </p>
        </div>
        <div className="rounded-2xl px-4 py-3.5" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
          <p className="font-sans text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>Best streak</p>
          <p className="mt-1 font-mono text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {life.bestStreak} day{life.bestStreak === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
        Explore
      </h2>
      <NavRow icon={Trophy} label="Personal records" sub="Your best lifts" onClick={() => navigate('/records')} />
      <NavRow icon={CalendarDays} label="Workout history" sub={`${workouts.length} session${workouts.length === 1 ? '' : 's'} logged`} onClick={() => navigate('/history')} />
      <NavRow icon={Dumbbell} label="Exercise library" sub="Browse and add exercises" onClick={() => navigate('/exercises')} />
      <NavRow icon={Settings} label="Settings" sub="Units, equipment, data" onClick={() => navigate('/settings')} />
    </div>
  );
}
