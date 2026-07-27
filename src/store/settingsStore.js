import { create } from 'zustand';

import { applyTheme } from '../utils/theme.js';

const KEY = 'stayfit_prefs';
// Earlier names for the same prefs blob, newest first. Read once on load so an
// install that predates a rename keeps its units, equipment and onboarding.
const LEGACY_KEYS = ['ludi_prefs', 'opus_prefs'];
const DEFAULTS = {
  unit: 'kg', heightUnit: 'cm', onboarded: false, effects: true, sound: false, theme: 'system',
  tourSeen: false, stepGoal: 8000, waterGoal: 8, recapDismissedWeek: '', coachMarksSeen: {},
  // Session reminders: whether to nudge, the hour of day to do it (0–23), and
  // the last date a nudge fired (so it happens at most once a day).
  reminderEnabled: true, reminderHour: 17, lastRemindedDate: '',
  // Daily briefing: the last date the once-a-day open summary was shown.
  lastBriefedDate: '',
  // Stretching: prompt for a warm-up / cool-down around workouts.
  stretchPrompts: true,
  // Plate inventory per location. plates null → the standard set for the
  // current unit; plates are display-unit numbers stamped with `unit`.
  // The bar itself is not configurable (see utils/barbell.js).
  inventory: {
    active: 'gym',
    gym: { plates: null, unit: null },
    home: { plates: null, unit: null },
  },
};

// Persisted keys — anything not listed here is derived or transient.
const PERSISTED = [
  'unit', 'heightUnit', 'onboarded', 'effects', 'sound', 'theme', 'tourSeen',
  'stepGoal', 'waterGoal', 'recapDismissedWeek', 'coachMarksSeen',
  'inventory', 'reminderEnabled', 'reminderHour', 'lastRemindedDate', 'stretchPrompts',
  'lastBriefedDate',
];

function load() {
  try {
    let raw = localStorage.getItem(KEY);
    for (const k of LEGACY_KEYS) {
      if (raw != null) break;
      raw = localStorage.getItem(k);
    }
    const saved = JSON.parse(raw ?? '{}');
    const merged = { ...DEFAULTS };
    for (const k of PERSISTED) if (k in saved) merged[k] = saved[k];
    return merged;
  } catch {
    return { ...DEFAULTS };
  }
}

const useSettingsStore = create((set, get) => ({
  ...load(),
  persist() {
    const state = get();
    const out = {};
    for (const k of PERSISTED) out[k] = state[k];
    localStorage.setItem(KEY, JSON.stringify(out));
  },
  setInventoryActive(active) {
    set((s) => ({ inventory: { ...s.inventory, active } }));
    get().persist();
  },
  setInventoryPlates(loc, plates, unit) {
    set((s) => ({ inventory: { ...s.inventory, [loc]: { ...s.inventory[loc], plates, unit } } }));
    get().persist();
  },
  setRecapDismissedWeek(recapDismissedWeek) {
    set({ recapDismissedWeek });
    get().persist();
  },
  markCoachSeen(route) {
    set((s) => ({ coachMarksSeen: { ...s.coachMarksSeen, [route]: true } }));
    get().persist();
  },
  resetCoachMarks() {
    set({ coachMarksSeen: {} });
    get().persist();
  },
  setTourSeen(tourSeen) {
    set({ tourSeen });
    get().persist();
  },
  setStepGoal(stepGoal) {
    set({ stepGoal });
    get().persist();
  },
  setWaterGoal(waterGoal) {
    set({ waterGoal });
    get().persist();
  },
  setTheme(theme) {
    set({ theme });
    get().persist();
    applyTheme(theme);
  },
  setUnit(unit) {
    set({ unit });
    get().persist();
  },
  // How height reads back to you — 'cm' or 'ftin'. Height itself is always
  // stored in cm; this only picks the display.
  setHeightUnit(heightUnit) {
    set({ heightUnit });
    get().persist();
  },
  setEffects(effects) {
    set({ effects });
    get().persist();
  },
  setSound(sound) {
    set({ sound });
    get().persist();
  },
  setReminderEnabled(reminderEnabled) {
    set({ reminderEnabled });
    get().persist();
  },
  setReminderHour(reminderHour) {
    set({ reminderHour });
    get().persist();
  },
  markReminded(dateKey) {
    set({ lastRemindedDate: dateKey });
    get().persist();
  },
  markBriefed(dateKey) {
    set({ lastBriefedDate: dateKey });
    get().persist();
  },
  setStretchPrompts(stretchPrompts) {
    set({ stretchPrompts });
    get().persist();
  },
  completeOnboarding() {
    set({ onboarded: true });
    get().persist();
  },
}));

export default useSettingsStore;
