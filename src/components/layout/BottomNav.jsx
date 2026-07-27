import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, BookOpen, BarChart3 } from 'lucide-react';
import PulseIcon from '../icons/PulseIcon.jsx';

// StayFit's five pillars: today, your plan, train, learn, review.
// Every tab uses the same 36px icon slot so the icons and the labels below them
// share one baseline — Workout is emphasised with a filled circle rather than by
// being lifted out of the row.
const tabs = [
  { to: '/home', label: 'Home', Icon: Home },
  { to: '/plan', label: 'Plan', Icon: CalendarDays },
  { to: '/workout', label: 'Workout', Icon: PulseIcon, primary: true },
  { to: '/library', label: 'Library', Icon: BookOpen },
  { to: '/progress', label: 'Progress', Icon: BarChart3 },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 items-start justify-around"
      style={{
        background: 'var(--color-chalk)',
        borderTop: '1px solid var(--color-ivory)',
        paddingTop: 'var(--space-2)',
        paddingBottom: 'calc(var(--space-3) + env(safe-area-inset-bottom))',
        borderTopLeftRadius: 'var(--radius-xl)',
        borderTopRightRadius: 'var(--radius-xl)',
      }}
    >
      {tabs.map(({ to, label, Icon, primary }) => (
        <NavLink key={to} to={to} aria-label={label} className="flex flex-col items-center gap-1">
          {({ isActive }) => (
            <>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: primary ? 'var(--color-gold)' : 'transparent',
                  boxShadow: primary ? '0 4px 12px rgba(16,185,129,0.32)' : 'none',
                  color: primary
                    ? 'var(--color-text-inverse)'
                    : isActive
                      ? 'var(--color-gold)'
                      : 'var(--color-ash)',
                  transform: !primary && isActive ? 'translateY(-1px) scale(1.1)' : 'none',
                  transition: 'transform var(--dur-standard) var(--ease-out), color var(--dur-standard)',
                }}
              >
                <Icon size={primary ? 21 : 22} strokeWidth={primary ? 2.3 : 2} />
              </span>
              <span
                className="font-sans text-[10px]"
                style={{
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-ash)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
