import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, CalendarCheck, Bell, Activity, BookOpen, TrendingUp, Palette } from 'lucide-react';
import useSettingsStore from '../../store/settingsStore.js';

const STEPS = [
  { icon: CalendarCheck, title: 'Plan your week', body: 'Start in Plan: choose a split like Push/Pull/Legs, or install a ready-made program. StayFit assigns each routine to a day so you always know what\'s next.' },
  { icon: Bell, title: 'Get reminded', body: 'Turn on session reminders and StayFit nudges you on training days only — never on a planned rest day.' },
  { icon: Dumbbell, title: 'Log your workouts', body: 'Tap the center ➕ to start. Add exercises — reorder them or chain supersets — and log sets with the plate calculator, RPE and rest timer. Get interrupted? Your session is saved.' },
  { icon: Activity, title: 'Warm up and cool down', body: 'The Library has guided pre- and post-workout stretch routines. Follow the timer and your stretch time is logged for you.' },
  { icon: BookOpen, title: 'Look anything up', body: 'The Library holds every exercise and stretch, tagged by muscle, body area and difficulty — tap any one to learn how to do it, with a video. Add your own too.' },
  { icon: TrendingUp, title: 'See your progress', body: 'Chart volume, personal records, estimated 1RM and body metrics — plus steps, water and your training calendar.' },
  { icon: Palette, title: 'Make it yours', body: 'Sound, effects, dark mode and kg/lbs all live in Settings. Open Settings to switch on what you like (you can replay this tour there anytime).' },
];

export default function Tour() {
  const setTourSeen = useSettingsStore((s) => s.setTourSeen);
  const navigate = useNavigate();
  const [i, setI] = useState(0);

  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const Icon = step.icon;

  function finish(goSettings = false) {
    setTourSeen(true);
    if (goSettings) navigate('/settings');
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[75] flex flex-col items-center justify-center px-8"
      style={{ background: 'var(--color-obsidian)' }}
    >
      <button
        onClick={() => finish(false)}
        className="absolute right-5 top-6 font-sans text-sm"
        style={{ color: 'var(--color-ash)' }}
      >
        Skip
      </button>

      <div
        key={i}
        className="anim-fade-slide-up flex flex-col items-center text-center"
        style={{ maxWidth: 320 }}
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: 'var(--color-gold)', animation: 'goldPulse 2.4s var(--ease-out) infinite' }}
        >
          <Icon size={34} style={{ color: 'var(--color-obsidian)' }} />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold" style={{ color: 'var(--color-text-inverse)' }}>
          {step.title}
        </h2>
        <p className="mt-2 font-sans text-sm leading-relaxed" style={{ color: 'var(--color-ash)' }}>
          {step.body}
        </p>
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex gap-2">
        {STEPS.map((_, idx) => (
          <span
            key={idx}
            className="h-2 rounded-full"
            style={{
              width: idx === i ? 20 : 8,
              background: idx === i ? 'var(--color-gold)' : 'var(--color-stone)',
              transition: 'width var(--dur-standard) var(--ease-out)',
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex w-full max-w-xs gap-3">
        {last ? (
          <button
            onClick={() => finish(false)}
            className="flex-1 rounded-xl py-3 font-sans text-sm font-medium"
            style={{ background: 'var(--color-stone)', color: 'var(--color-text-inverse)' }}
          >
            Not now
          </button>
        ) : (
          i > 0 && (
            <button
              onClick={() => setI(i - 1)}
              className="flex-1 rounded-xl py-3 font-sans text-sm font-medium"
              style={{ background: 'var(--color-stone)', color: 'var(--color-text-inverse)' }}
            >
              Back
            </button>
          )
        )}
        <button
          onClick={() => (last ? finish(true) : setI(i + 1))}
          className="flex-1 rounded-xl py-3 font-sans text-sm font-semibold"
          style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
        >
          {last ? 'Open Settings' : 'Next'}
        </button>
      </div>
    </div>,
    document.body
  );
}
