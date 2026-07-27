import { describe, it, expect } from 'vitest';
import {
  totalDuration,
  buildSequence,
  stepAt,
  seekToStep,
  formatClock,
  buildLog,
} from './stretchSession.js';

const items = [
  { stretchId: 1, durationSec: 30 },
  { stretchId: 2, durationSec: 40 },
  { stretchId: 3, durationSec: 20 },
];

describe('totalDuration', () => {
  it('sums item durations', () => {
    expect(totalDuration(items)).toBe(90);
  });
  it('is 0 for an empty routine', () => {
    expect(totalDuration([])).toBe(0);
    expect(totalDuration()).toBe(0);
  });
});

describe('buildSequence', () => {
  it('assigns cumulative start/end offsets', () => {
    const seq = buildSequence(items);
    expect(seq.map((s) => [s.startAt, s.endAt])).toEqual([[0, 30], [30, 70], [70, 90]]);
    expect(seq.map((s) => s.index)).toEqual([0, 1, 2]);
  });
});

describe('stepAt', () => {
  const seq = buildSequence(items);

  it('finds the first step at t=0', () => {
    const r = stepAt(seq, 0);
    expect(r.index).toBe(0);
    expect(r.remaining).toBe(30);
    expect(r.done).toBe(false);
  });

  it('advances to the next step exactly at the boundary', () => {
    expect(stepAt(seq, 29.9).index).toBe(0);
    expect(stepAt(seq, 30).index).toBe(1);
  });

  it('reports progress within the current step', () => {
    const r = stepAt(seq, 50); // 20s into a 40s step
    expect(r.index).toBe(1);
    expect(r.stepElapsed).toBe(20);
    expect(r.progress).toBeCloseTo(0.5);
  });

  it('is done at and past the total', () => {
    expect(stepAt(seq, 90).done).toBe(true);
    expect(stepAt(seq, 500).done).toBe(true);
    expect(stepAt(seq, 90).index).toBe(2); // keeps the last step for display
  });

  it('handles an empty sequence', () => {
    const r = stepAt([], 5);
    expect(r.done).toBe(true);
    expect(r.step).toBeNull();
  });
});

describe('seekToStep', () => {
  const seq = buildSequence(items);
  it('returns the step start offset', () => {
    expect(seekToStep(seq, 1)).toBe(30);
    expect(seekToStep(seq, 2)).toBe(70);
  });
  it('clamps out-of-range indices', () => {
    expect(seekToStep(seq, -5)).toBe(0);
    expect(seekToStep(seq, 99)).toBe(70);
    expect(seekToStep([], 1)).toBe(0);
  });
});

describe('formatClock', () => {
  it('formats mm:ss', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(9)).toBe('0:09');
    expect(formatClock(75)).toBe('1:15');
    expect(formatClock(600)).toBe('10:00');
  });
  it('never goes negative', () => {
    expect(formatClock(-4)).toBe('0:00');
  });
});

describe('buildLog', () => {
  it('records the time actually performed', () => {
    const log = buildLog({
      routine: { id: 3, name: 'Full-Body Warm-Up', phase: 'pre' },
      elapsed: 42.6,
      date: '2026-07-27',
    });
    expect(log).toMatchObject({
      date: '2026-07-27',
      phase: 'pre',
      routineId: 3,
      routineName: 'Full-Body Warm-Up',
      durationSec: 43,
      workoutId: null,
    });
    expect(log.completedAt).toBeGreaterThan(0);
  });

  it('links to a workout and allows a phase override', () => {
    const log = buildLog({
      routine: { id: 1, name: 'Cool-Down', phase: 'pre' },
      elapsed: 10,
      date: '2026-07-27',
      phase: 'post',
      workoutId: 12,
    });
    expect(log.phase).toBe('post');
    expect(log.workoutId).toBe(12);
  });

  it('survives an ad-hoc session with no routine', () => {
    const log = buildLog({ routine: null, elapsed: 5, date: '2026-07-27' });
    expect(log.routineId).toBeNull();
    expect(log.routineName).toBe('Stretch');
    expect(log.phase).toBe('pre');
  });
});
