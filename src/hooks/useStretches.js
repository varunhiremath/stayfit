import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { seedStretchDatabase } from '../utils/stretchActions.js';
import { weekStartMs } from '../utils/week.js';
import { searchExercises } from '../utils/exerciseSearch.js';

// The stretch catalogue, optionally filtered by body area / type / search.
export function useStretches({ bodyArea = null, type = null, search = '' } = {}) {
  useEffect(() => { seedStretchDatabase(); }, []);

  return useLiveQuery(async () => {
    const all = await db.stretches.orderBy('name').toArray();
    const inScope = all.filter((s) =>
      (!bodyArea || s.bodyArea === bodyArea) && (!type || s.type === type)
    );
    // Same forgiving matcher as the exercise library, so a typo or a stray
    // space behaves the same way on both tabs.
    return searchExercises(inScope, search);
  }, [bodyArea, type, search]) ?? [];
}

export function useStretch(id) {
  return useLiveQuery(() => (id ? db.stretches.get(id) : null), [id]);
}

// Routines for a phase ('pre' | 'post'), each with its stretch rows resolved.
export function useStretchRoutines(phase = null) {
  useEffect(() => { seedStretchDatabase(); }, []);

  return useLiveQuery(async () => {
    const rows = await db.stretchRoutines.toArray();
    const list = phase ? rows.filter((r) => r.phase === phase) : rows;
    const out = [];
    for (const r of list) {
      const items = [];
      for (const i of r.items ?? []) {
        const stretch = await db.stretches.get(i.stretchId);
        if (stretch) items.push({ ...i, name: stretch.name, bodyArea: stretch.bodyArea, description: stretch.description, type: stretch.type });
      }
      out.push({ ...r, items, totalSec: items.reduce((a, i) => a + (i.durationSec || 0), 0) });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }, [phase]) ?? [];
}

export function useStretchRoutine(id) {
  return useLiveQuery(async () => {
    if (!id) return null;
    const r = await db.stretchRoutines.get(id);
    if (!r) return null;
    const items = [];
    for (const i of r.items ?? []) {
      const stretch = await db.stretches.get(i.stretchId);
      if (stretch) items.push({ ...i, name: stretch.name, bodyArea: stretch.bodyArea, description: stretch.description, type: stretch.type });
    }
    return { ...r, items, totalSec: items.reduce((a, i) => a + (i.durationSec || 0), 0) };
  }, [id]);
}

// Stretch logs, newest first.
export function useStretchLogs(limit = 30) {
  return useLiveQuery(
    () => db.stretchLogs.orderBy('completedAt').reverse().limit(limit).toArray(),
    [limit]
  ) ?? [];
}

// Headline stretch stats: total minutes, this week's minutes, session count.
export function useStretchStats() {
  return useLiveQuery(async () => {
    const logs = await db.stretchLogs.toArray();
    const startMs = weekStartMs();
    const weekLogs = logs.filter((l) => (l.completedAt ?? 0) >= startMs);
    const mins = (rows) => Math.round(rows.reduce((a, l) => a + (l.durationSec || 0), 0) / 60);
    return {
      sessions: logs.length,
      totalMin: mins(logs),
      weekMin: mins(weekLogs),
      weekSessions: weekLogs.length,
    };
  }, []) ?? { sessions: 0, totalMin: 0, weekMin: 0, weekSessions: 0 };
}
