import { create } from 'zustand';

import { applyTheme } from '../utils/theme.js';

const KEY = 'ludi_prefs';
const LEGACY_KEY = 'opus_prefs';
const DEFAULTS = {
  barWeight: 20, unit: 'kg', onboarded: false, effects: true, sound: false, theme: 'system',
  tourSeen: false, restDuration: 90, stepGoal: 8000, waterGoal: 8, recapDismissedWeek: '', coachMarksSeen: {},
  // Session reminders: whether to nudge, the hour of day to do it (0–23), and
  // the last date a nudge fired (so it happens at most once a day).
  reminderEnabled: true, reminderHour: 17, lastRemindedDate: '',
  // Stretching: prompt for a warm-up / cool-down around workouts.
  stretchPrompts: true,
  // Equipment per location. barKg null → use global barWeight; plates null → standard
  // set for the current unit; plates are display-unit numbers stamped with `unit`.
  inventory: {
    active: 'gym',
    gym: { barKg: null, plates: null, unit: null },
    home: { barKg: null, plates: null, unit: null },
  },
};

// Persisted keys — anything not listed here is derived or transient.
const PERSISTED = [
  'barWeight', 'unit', 'onboarded', 'effects', 'sound', 'theme', 'tourSeen',
  'restDuration', 'stepGoal', 'waterGoal', 'recapDismissedWeek', 'coachMarksSeen',
  'inventory', 'reminderEnabled', 'reminderHour', 'lastRemindedDate', 'stretchPrompts',
];

function load() {
  try {
    // Read the LUDI key, falling back to the legacy OPUS prefs once so existing
    // installs keep their units, equipment and onboarding state.
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY) ?? '{}';
    const saved = JSON.parse(raw);
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
  setInventoryBar(loc, barKg) {
    set((s) => ({ inventory: { ...s.inventory, [loc]: { ...s.inventory[loc], barKg } } }));
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
  setRestDuration(restDuration) {
    set({ restDuration });
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
  setBarWeight(barWeight) {
    set({ barWeight });
    get().persist();
  },
  setUnit(unit) {
    set({ unit });
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
