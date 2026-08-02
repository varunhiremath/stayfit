// Bodyweight history: what you weigh now, and which way it's going.
//
// Entries are `bodyStats` rows — many carry no weight (a waist-only entry, say),
// so everything here filters first. Weights are kg, like everywhere else.

// Weight-bearing entries, newest first.
export function weightEntries(stats = []) {
  return (stats ?? [])
    .filter((s) => s && s.weight != null && Number.isFinite(Number(s.weight)))
    .slice()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function latestWeight(stats = []) {
  return weightEntries(stats)[0] ?? null;
}

// Whole days between two YYYY-MM-DD keys. Parsed as UTC noon so daylight saving
// can't shave a day off the count.
function daysApart(a, b) {
  const at = Date.parse(`${a}T12:00:00Z`);
  const bt = Date.parse(`${b}T12:00:00Z`);
  if (Number.isNaN(at) || Number.isNaN(bt)) return null;
  return Math.round(Math.abs(at - bt) / 86400000);
}

// Current weight and how it compares with the entry before it.
export function weightSummary(stats = []) {
  const entries = weightEntries(stats);
  if (!entries.length) return null;
  const [current, previous] = entries;
  if (!previous) {
    return { currentKg: Number(current.weight), date: current.date, previousKg: null, deltaKg: null, sinceDate: null, days: null };
  }
  return {
    currentKg: Number(current.weight),
    date: current.date,
    previousKg: Number(previous.weight),
    deltaKg: Number(current.weight) - Number(previous.weight),
    sinceDate: previous.date,
    days: daysApart(current.date, previous.date),
  };
}

// Change across the last `days` days: the newest entry versus the oldest one
// still inside the window. Null when there's nothing to compare.
export function deltaOver(stats = [], days = 30, today = null) {
  const entries = weightEntries(stats);
  if (entries.length < 2) return null;
  const from = today ?? entries[0].date;
  const inWindow = entries.filter((e) => {
    const d = daysApart(from, e.date);
    return d != null && d <= days;
  });
  if (inWindow.length < 2) return null;
  const newest = inWindow[0];
  const oldest = inWindow[inWindow.length - 1];
  return {
    deltaKg: Number(newest.weight) - Number(oldest.weight),
    fromDate: oldest.date,
    toDate: newest.date,
  };
}

// Signed, unit-aware label for a change. Uses a real minus sign, not a hyphen.
export function formatDelta(kg, unit = 'kg', { lbPerKg = 2.20462262 } = {}) {
  if (kg == null || !Number.isFinite(Number(kg))) return null;
  const v = unit === 'lbs' ? Number(kg) * lbPerKg : Number(kg);
  const rounded = Math.round(v * 10) / 10;
  if (rounded === 0) return `No change`;
  const sign = rounded > 0 ? '+' : '−';
  return `${sign}${Math.abs(rounded)} ${unit === 'lbs' ? 'lbs' : 'kg'}`;
}

// "today" / "yesterday" / "3 days ago" — how stale the reading is.
export function freshnessLabel(date, today) {
  const d = daysApart(today, date);
  if (d == null) return null;
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d} days ago`;
  if (d < 14) return 'last week';
  if (d < 60) return `${Math.round(d / 7)} weeks ago`;
  return `${Math.round(d / 30)} months ago`;
}
