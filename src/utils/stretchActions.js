// DB layer for stretching: idempotent seeding, CRUD for custom stretches and
// routines, and stretch-time logging. Pure sequencing logic lives in
// utils/stretchSession.js; catalogue data in utils/seedStretches.js.

import { db } from '../db/db.js';
import { stretchSeed, STRETCH_ROUTINES, resolveRoutine } from './seedStretches.js';
import { todayKey } from './dateKey.js';
import { buildLog } from './stretchSession.js';

let seeding = null;

// Seeds the catalogue + bundled routines once. Safe to call on every mount and
// on existing databases: it only adds what is missing, and concurrent callers
// share the same in-flight promise.
export function seedStretchDatabase() {
  if (seeding) return seeding;
  seeding = (async () => {
    try {
      const existing = await db.stretches.toArray();
      const byName = Object.fromEntries(existing.map((s) => [s.name, s]));
      const missing = stretchSeed().filter((s) => !byName[s.name]);
      if (missing.length) await db.stretches.bulkAdd(missing);

      const all = await db.stretches.toArray();
      const nameToId = Object.fromEntries(all.map((s) => [s.name, s.id]));
      const catalogue = Object.fromEntries(all.map((s) => [s.name, s]));

      const routines = await db.stretchRoutines.toArray();
      const haveRoutine = new Set(routines.map((r) => r.name));
      for (const r of STRETCH_ROUTINES) {
        if (haveRoutine.has(r.name)) continue;
        const row = resolveRoutine(r, nameToId, catalogue);
        if (row.items.length) await db.stretchRoutines.add({ ...row, createdAt: Date.now() });
      }
    } catch (e) {
      // A duplicate-key race between concurrent mounts is harmless.
      console.warn('Stretch seed skipped:', e);
    }
  })();
  return seeding;
}

// ── Custom stretches ───────────────────────────────────────────────────────
export async function addCustomStretch({ name, type, bodyArea, durationSec, description = '', difficulty = 'beginner' }) {
  if (!name?.trim()) return null;
  return db.stretches.add({
    name: name.trim(),
    type: type || 'static',
    bodyArea: bodyArea || 'full-body',
    durationSec: Number(durationSec) || 30,
    description,
    difficulty,
    isCustom: true,
  });
}

export async function updateStretch(id, updates) {
  await db.stretches.update(id, updates);
}

// Deleting a stretch also removes it from every routine that used it, so no
// routine is left pointing at a missing move.
export async function deleteStretch(id) {
  const routines = await db.stretchRoutines.toArray();
  for (const r of routines) {
    const items = (r.items ?? []).filter((i) => i.stretchId !== id);
    if (items.length !== (r.items ?? []).length) {
      await db.stretchRoutines.update(r.id, { items });
    }
  }
  await db.stretches.delete(id);
}

// ── Routines ───────────────────────────────────────────────────────────────
export async function createStretchRoutine({ name, phase = 'pre', bodyArea = 'full-body', items = [] }) {
  if (!name?.trim()) return null;
  return db.stretchRoutines.add({
    name: name.trim(),
    phase,
    bodyArea,
    items,
    isCustom: true,
    createdAt: Date.now(),
  });
}

export async function updateStretchRoutine(id, updates) {
  await db.stretchRoutines.update(id, updates);
}

// Deleting a routine unlinks its logs rather than deleting them — the time you
// actually spent stretching stays in your history.
export async function deleteStretchRoutine(id) {
  const logs = await db.stretchLogs.where('routineId').equals(id).toArray();
  for (const l of logs) await db.stretchLogs.update(l.id, { routineId: null });
  await db.stretchRoutines.delete(id);
}

// ── Logging ────────────────────────────────────────────────────────────────
export async function logStretchSession({ routine, elapsed, phase, workoutId = null }) {
  if (!elapsed || elapsed < 1) return null;
  const row = buildLog({ routine, elapsed, date: todayKey(), phase, workoutId });
  return db.stretchLogs.add(row);
}

export async function deleteStretchLog(id) {
  await db.stretchLogs.delete(id);
}
