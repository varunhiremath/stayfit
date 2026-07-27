import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import useSettingsStore from '../../store/settingsStore.js';

// First-use tip per tab. Shows once per route (localStorage seen-state) after
// onboarding + the tour, above the bottom nav. Dismissed with "Got it".
const TIPS = {
  '/home': "Home base — today's session, warm-up and cool-down shortcuts, and your week at a glance.",
  '/plan': 'Pick a split like Push/Pull/Legs, set which day each routine falls on, and turn on reminders.',
  '/workout': 'Start or continue a session here — tap an exercise to open it, log your sets, and rest between.',
  '/library': 'Every exercise and stretch, tagged by category. Tap any one to learn how to do it — or run a guided warm-up.',
  '/progress': 'All your charts: volume, PRs, estimated 1RM, body metrics, and your steps & water log.',
  '/profile': 'Your training summary — lifetime stats, personal records, history and settings.',
};

export default function CoachMark() {
  const { pathname } = useLocation();
  const seen = useSettingsStore((s) => s.coachMarksSeen);
  const markSeen = useSettingsStore((s) => s.markCoachSeen);

  const tip = TIPS[pathname];
  if (!tip || seen?.[pathname]) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-5"
      style={{ bottom: 'calc(96px + env(safe-area-inset-bottom))' }}
    >
      <div
        className="anim-fade-slide-up pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: 'var(--color-obsidian)', border: '1px solid var(--color-stone)' }}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-gold)' }}>
          <Lightbulb size={16} style={{ color: 'var(--color-text-inverse)' }} />
        </div>
        <p className="flex-1 font-sans text-xs leading-relaxed" style={{ color: 'var(--color-text-inverse)' }}>{tip}</p>
        <button
          onClick={() => markSeen(pathname)}
          className="flex-shrink-0 rounded-lg px-3 py-1.5 font-sans text-[11px] font-semibold"
          style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
        >
          Got it
        </button>
      </div>
    </div>,
    document.body
  );
}
