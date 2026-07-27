import { useEffect, useState } from 'react';
import { Bell, Info } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import useSettingsStore from '../../store/settingsStore.js';
import { requestPermission, currentPermission } from '../../utils/notifications.js';

const HOURS = [6, 7, 8, 9, 12, 15, 17, 18, 19, 20];

function label(h) {
  const suffix = h < 12 ? 'am' : 'pm';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${suffix}`;
}

// Session-reminder preferences: on/off, what time of day, and an honest note
// about what an offline PWA can and cannot deliver in the background.
export default function ReminderSettings({ isOpen, onClose }) {
  const enabled = useSettingsStore((s) => s.reminderEnabled);
  const hour = useSettingsStore((s) => s.reminderHour);
  const setEnabled = useSettingsStore((s) => s.setReminderEnabled);
  const setHour = useSettingsStore((s) => s.setReminderHour);
  const [perm, setPerm] = useState('default');

  useEffect(() => {
    if (isOpen) currentPermission().then(setPerm);
  }, [isOpen]);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    if (next && perm !== 'granted') {
      const result = await requestPermission();
      setPerm(result);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session reminders">
      <button
        onClick={toggle}
        className="mb-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: 'var(--color-ivory)' }}
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--color-chalk)' }}>
          <Bell size={15} style={{ color: enabled ? 'var(--color-gold)' : 'var(--color-ash)' }} />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Remind me about my next session
          </span>
          <span className="block font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Only on days you have a workout planned
          </span>
        </span>
        <span
          className="flex h-6 w-11 flex-shrink-0 items-center rounded-full px-0.5"
          style={{ background: enabled ? 'var(--color-gold)' : 'var(--color-ash)' }}
        >
          <span
            className="h-5 w-5 rounded-full"
            style={{
              background: '#fff',
              transform: enabled ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform var(--dur-standard) var(--ease-out)',
            }}
          />
        </span>
      </button>

      {enabled && (
        <>
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            Remind me at
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {HOURS.map((h) => (
              <button
                key={h}
                onClick={() => setHour(h)}
                className="h-10 min-w-[56px] rounded-xl px-3 font-mono text-sm font-medium"
                style={{
                  background: hour === h ? 'var(--color-gold)' : 'var(--color-ivory)',
                  color: hour === h ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                }}
              >
                {label(h)}
              </button>
            ))}
          </div>

          {perm === 'denied' && (
            <p className="mb-3 rounded-xl px-3 py-2 font-sans text-xs" style={{ background: 'var(--color-ivory)', color: 'var(--color-ember)' }}>
              Notifications are blocked in your browser settings — reminders will still appear inside the app.
            </p>
          )}
        </>
      )}

      <div className="flex gap-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--color-ivory)' }}>
        <Info size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-ash)' }} />
        <p className="font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          LUDI is fully offline with no server, so reminders fire when the app is open or installed on
          your phone. Add LUDI to your home screen for the most reliable nudges.
        </p>
      </div>
    </Modal>
  );
}
