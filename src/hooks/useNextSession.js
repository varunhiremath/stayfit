import { useEffect, useRef } from 'react';
import { useTemplatesWithExercises } from './useTemplates.js';
import { useProfile } from './useProfile.js';
import useSettingsStore from '../store/settingsStore.js';
import { nextSession, reminderText, shouldRemind } from '../utils/nextSession.js';
import { todayKey } from '../utils/dateKey.js';
import { showNotification, getSettings, inQuietHours } from '../utils/notifications.js';

// What's on the plan today / next. Pure decision logic lives in
// utils/nextSession.js; this just feeds it live data.
export function useNextSession() {
  const templates = useTemplatesWithExercises();
  const { profile } = useProfile();
  const today = todayKey();
  const trainedToday = profile?.lastWorkoutDate === today;
  return nextSession({ templates, now: new Date(), trainedToday });
}

// Best-effort local reminder for a scheduled session.
//
// A no-backend PWA cannot push while closed, so this fires when the app is
// opened (or left open) on a training day at/after the user's reminder hour,
// at most once per day. Installed on Android this behaves like a normal
// notification; elsewhere it degrades to an in-app surface.
export function useSessionReminder() {
  const info = useNextSession();
  const enabled = useSettingsStore((s) => s.reminderEnabled);
  const reminderHour = useSettingsStore((s) => s.reminderHour);
  const lastRemindedDate = useSettingsStore((s) => s.lastRemindedDate);
  const markReminded = useSettingsStore((s) => s.markReminded);
  const fired = useRef(false);

  useEffect(() => {
    if (!enabled || fired.current) return;
    const today = todayKey();
    const now = new Date();
    if (!shouldRemind({ info, now, reminderHour, lastRemindedDate, today })) return;
    // Respect the notification quiet-hours window too.
    if (inQuietHours(getSettings(), now)) return;

    const text = reminderText(info);
    if (!text) return;

    fired.current = true;
    markReminded(today);
    showNotification(text.title, { body: text.body }).catch(() => {
      /* permission not granted — the Plan/Home cards still show the session */
    });
  }, [info, enabled, reminderHour, lastRemindedDate, markReminded]);

  return info;
}
