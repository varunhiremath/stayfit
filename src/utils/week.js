// Monday-aligned week helpers. Pure + framework-agnostic. Used for the weekly
// recap and any week-scoped rollups. (Ported out of the old quests module so
// week math survives the removal of the game layer.)

const WEEK_MS = 7 * 86400000;

function mondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return d;
}

// Stable per-week key (the Monday's local date, YYYY-MM-DD).
export function weekKeyOf(date = new Date()) {
  const m = mondayOf(date);
  const y = m.getFullYear();
  const mo = String(m.getMonth() + 1).padStart(2, '0');
  const da = String(m.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

// Epoch-ms of this week's Monday (for filtering timestamped records like PRs).
export function weekStartMs(date = new Date()) {
  return mondayOf(date).getTime();
}

// Epoch-ms of the Monday named by a stored weekKey ('YYYY-MM-DD'), parsed as
// local midnight so it matches weekStartMs.
export function weekStartMsFromKey(weekKey) {
  const [y, m, d] = weekKey.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

// Monotonic integer week counter.
export function weekIndex(date = new Date()) {
  return Math.floor(mondayOf(date).getTime() / WEEK_MS);
}
