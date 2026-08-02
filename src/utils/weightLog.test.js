import { describe, it, expect } from 'vitest';
import { weightEntries, latestWeight, weightSummary, deltaOver, formatDelta, freshnessLabel } from './weightLog.js';

const e = (date, weight) => ({ date, weight });

const STATS = [
  e('2026-08-01', 79.6),
  e('2026-07-29', 80.0),
  e('2026-07-01', 82.0),
  { date: '2026-07-15', waist: 84 }, // no weight on this one
];

describe('weightEntries', () => {
  it('keeps only weight-bearing rows, newest first', () => {
    expect(weightEntries(STATS).map((s) => s.date)).toEqual(['2026-08-01', '2026-07-29', '2026-07-01']);
  });

  it('survives junk input', () => {
    expect(weightEntries()).toEqual([]);
    expect(weightEntries([null, undefined, {}])).toEqual([]);
    expect(weightEntries([{ date: '2026-01-01', weight: 'heavy' }])).toEqual([]);
  });
});

describe('latestWeight', () => {
  it('returns the newest entry', () => {
    expect(latestWeight(STATS).weight).toBe(79.6);
  });

  it('is null when nothing is logged', () => {
    expect(latestWeight([])).toBeNull();
  });
});

describe('weightSummary', () => {
  it('compares the newest entry with the one before it', () => {
    const s = weightSummary(STATS);
    expect(s.currentKg).toBe(79.6);
    expect(s.previousKg).toBe(80);
    expect(s.deltaKg).toBeCloseTo(-0.4, 5);
    expect(s.sinceDate).toBe('2026-07-29');
    expect(s.days).toBe(3);
  });

  it('handles a single entry', () => {
    const s = weightSummary([e('2026-08-01', 79.6)]);
    expect(s.currentKg).toBe(79.6);
    expect(s.deltaKg).toBeNull();
    expect(s.days).toBeNull();
  });

  it('is null with no weights at all', () => {
    expect(weightSummary([])).toBeNull();
    expect(weightSummary([{ date: '2026-01-01', waist: 80 }])).toBeNull();
  });
});

describe('deltaOver', () => {
  it('measures across the window', () => {
    const d = deltaOver(STATS, 30, '2026-08-01');
    expect(d.deltaKg).toBeCloseTo(-0.4, 5); // only Aug 1 and Jul 29 are within 30 days
    expect(d.fromDate).toBe('2026-07-29');
  });

  it('widens with the window', () => {
    const d = deltaOver(STATS, 90, '2026-08-01');
    expect(d.deltaKg).toBeCloseTo(-2.4, 5); // back to Jul 1
    expect(d.fromDate).toBe('2026-07-01');
  });

  it('is null without two points in range', () => {
    expect(deltaOver([e('2026-08-01', 80)], 30)).toBeNull();
    expect(deltaOver(STATS, 1, '2026-08-01')).toBeNull();
  });
});

describe('formatDelta', () => {
  it('signs the change and uses a real minus', () => {
    expect(formatDelta(0.4, 'kg')).toBe('+0.4 kg');
    expect(formatDelta(-0.4, 'kg')).toBe('−0.4 kg');
  });

  it('converts to lbs', () => {
    expect(formatDelta(1, 'lbs')).toBe('+2.2 lbs');
  });

  it('calls a zero change what it is', () => {
    expect(formatDelta(0, 'kg')).toBe('No change');
    expect(formatDelta(0.02, 'kg')).toBe('No change'); // rounds away
  });

  it('is null without a number', () => {
    expect(formatDelta(null)).toBeNull();
    expect(formatDelta(undefined)).toBeNull();
  });
});

describe('freshnessLabel', () => {
  it('names recent days', () => {
    expect(freshnessLabel('2026-08-01', '2026-08-01')).toBe('today');
    expect(freshnessLabel('2026-07-31', '2026-08-01')).toBe('yesterday');
    expect(freshnessLabel('2026-07-29', '2026-08-01')).toBe('3 days ago');
  });

  it('coarsens as it gets older', () => {
    expect(freshnessLabel('2026-07-25', '2026-08-01')).toBe('last week');
    expect(freshnessLabel('2026-07-04', '2026-08-01')).toBe('4 weeks ago');
    expect(freshnessLabel('2026-05-01', '2026-08-01')).toBe('3 months ago');
  });

  it('is null for an unparseable date', () => {
    expect(freshnessLabel('not-a-date', '2026-08-01')).toBeNull();
  });
});
