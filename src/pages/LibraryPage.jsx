import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Star, Search, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { useExercises } from '../hooks/useExercises.js';
import { useStretches, useStretchRoutines, useStretchLogs, useStretchStats } from '../hooks/useStretches.js';
import { BODY_AREAS } from '../utils/seedStretches.js';
import { formatClock } from '../utils/stretchSession.js';
import { logStretchSession, deleteStretchLog, addCustomStretch } from '../utils/stretchActions.js';
import BodyPicker from '../components/exercise/BodyPicker.jsx';
import ExerciseSearch from '../components/exercise/ExerciseSearch.jsx';
import ExerciseList from '../components/exercise/ExerciseList.jsx';
import ExerciseForm from '../components/exercise/ExerciseForm.jsx';
import Modal from '../components/ui/Modal.jsx';
import StretchRunner from '../components/stretch/StretchRunner.jsx';
import StretchRoutineModal from '../components/stretch/StretchRoutineModal.jsx';
import StretchDetailModal from '../components/stretch/StretchDetailModal.jsx';
import useUIStore from '../store/uiStore.js';

const STRETCH_TYPES = [
  { key: null, label: 'All' },
  { key: 'dynamic', label: 'Dynamic' },
  { key: 'static', label: 'Static' },
  { key: 'mobility', label: 'Mobility' },
];

const PHASES = [
  { key: null, label: 'All routines' },
  { key: 'pre', label: 'Warm-up' },
  { key: 'post', label: 'Cool-down' },
];

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="h-8 flex-shrink-0 rounded-full px-3 font-sans text-xs font-semibold capitalize"
      style={{
        background: active ? 'var(--color-gold)' : 'var(--color-ivory)',
        color: active ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
      }}
    >
      {children}
    </button>
  );
}

function ExercisesTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // While searching, ignore the muscle filter so results span every group.
  const all = useExercises({ muscleGroup: search ? null : muscle, search });
  const exercises = favoritesOnly ? all.filter((e) => e.favorite) : all;

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <ExerciseSearch value={search} onChange={setSearch} />
        </div>
        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: favoritesOnly ? 'var(--color-gold)' : 'var(--color-ivory)' }}
          aria-label="Show favourites only"
        >
          <Star size={18} fill={favoritesOnly ? 'var(--color-text-inverse)' : 'none'} style={{ color: favoritesOnly ? 'var(--color-text-inverse)' : 'var(--color-ash)' }} />
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--color-ivory)' }}
          aria-label="Add custom exercise"
        >
          <Plus size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
      </div>

      {!search && (
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
              Filter by muscle
            </span>
            {muscle && (
              <button onClick={() => setMuscle(null)} className="font-sans text-xs font-medium" style={{ color: 'var(--color-gold)' }}>
                Clear
              </button>
            )}
          </div>
          <div className="mt-2">
            <BodyPicker selected={muscle} onSelect={setMuscle} />
          </div>
        </div>
      )}

      <p className="mb-2 mt-4 font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {exercises.length} exercise{exercises.length === 1 ? '' : 's'}
        {muscle && !search ? ` · ${muscle.replace(/-/g, ' ')}` : ''}
      </p>
      <ExerciseList exercises={exercises} onSelect={(ex) => navigate(`/exercises/${ex.id}`)} showArrow />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New exercise">
        <ExerciseForm onSave={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      </Modal>
    </>
  );
}

function StretchesTab({ initialPhase }) {
  const [phase, setPhase] = useState(initialPhase ?? null);
  const [type, setType] = useState(null);
  const [area, setArea] = useState(null);
  const [search, setSearch] = useState('');
  const [openRoutine, setOpenRoutine] = useState(null);
  const [openStretch, setOpenStretch] = useState(null);
  const [running, setRunning] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'static', bodyArea: 'full-body', durationSec: 30, description: '' });

  const routines = useStretchRoutines(phase);
  const stretches = useStretches({ type, bodyArea: area, search });
  const logs = useStretchLogs(5);
  const stats = useStretchStats();

  async function handleDone(elapsed) {
    const routine = running;
    setRunning(null);
    const saved = await logStretchSession({ routine, elapsed, phase: routine?.phase });
    if (saved) useUIStore.getState().showToast(`Logged ${formatClock(elapsed)} of stretching`, { type: 'success' });
  }

  async function handleAdd() {
    if (!form.name.trim()) return;
    await addCustomStretch(form);
    setForm({ name: '', type: 'static', bodyArea: 'full-body', durationSec: 30, description: '' });
    setAdding(false);
    useUIStore.getState().showToast('Stretch added', { type: 'success' });
  }

  async function handleDeleteLog(l) {
    const ok = await useUIStore.getState().confirm({
      title: 'Delete this entry?',
      message: `${l.routineName} · ${formatClock(l.durationSec)}`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) await deleteStretchLog(l.id);
  }

  return (
    <>
      {/* Routines — the guided sequences */}
      <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {PHASES.map((p) => (
          <Chip key={p.label} active={phase === p.key} onClick={() => setPhase(p.key)}>{p.label}</Chip>
        ))}
      </div>

      {routines.map((r) => (
        <button
          key={r.id}
          onClick={() => setOpenRoutine(r)}
          className="mb-2.5 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
          style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
        >
          <span
            className="h-9 w-1.5 flex-shrink-0 rounded-full"
            style={{ background: r.phase === 'pre' ? 'var(--color-gold)' : 'var(--color-ember)' }}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {r.name}
            </span>
            <span className="block font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {r.phase === 'pre' ? 'Warm-up' : 'Cool-down'} · {r.items.length} moves
            </span>
          </span>
          <span className="flex flex-shrink-0 items-center gap-1 font-mono text-xs" style={{ color: 'var(--color-ash)' }}>
            <Clock size={12} /> {formatClock(r.totalSec)}
          </span>
          <ChevronRight size={15} style={{ color: 'var(--color-ash)' }} />
        </button>
      ))}

      {/* Individual stretches */}
      <h2 className="mb-2 mt-6 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
        All stretches
      </h2>

      <div className="mb-2.5 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--color-ivory)' }}>
        <Search size={15} style={{ color: 'var(--color-ash)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stretches"
          className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
      </div>

      <div className="no-scrollbar -mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {STRETCH_TYPES.map((t) => (
          <Chip key={t.label} active={type === t.key} onClick={() => setType(t.key)}>{t.label}</Chip>
        ))}
      </div>
      <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <Chip active={area === null} onClick={() => setArea(null)}>All areas</Chip>
        {BODY_AREAS.map((a) => (
          <Chip key={a} active={area === a} onClick={() => setArea(area === a ? null : a)}>{a.replace('-', ' ')}</Chip>
        ))}
      </div>

      {stretches.length === 0 ? (
        <p className="py-6 text-center font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No stretches match those filters.
        </p>
      ) : (
        stretches.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpenStretch(s)}
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left"
            style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {s.name}
              </span>
              <span className="block font-sans text-[11px] capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                {s.type} · {String(s.bodyArea).replace('-', ' ')} · {s.difficulty}
              </span>
            </span>
            <span className="flex-shrink-0 font-mono text-xs" style={{ color: 'var(--color-ash)' }}>
              {formatClock(s.durationSec)}
            </span>
            <ChevronRight size={15} style={{ color: 'var(--color-ash)' }} />
          </button>
        ))
      )}

      {/* Add your own */}
      {adding ? (
        <div className="mt-3 rounded-2xl p-3" style={{ background: 'var(--color-ivory)' }}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Stretch name"
            className="mb-2 w-full rounded-xl px-3 py-2 font-sans text-sm outline-none"
            style={{ background: 'var(--color-chalk)', color: 'var(--color-text-primary)' }}
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="How to do it — the cue you want to remember"
            rows={2}
            className="mb-2 w-full resize-none rounded-xl px-3 py-2 font-sans text-sm outline-none"
            style={{ background: 'var(--color-chalk)', color: 'var(--color-text-primary)' }}
          />
          <div className="mb-2 flex gap-2">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="flex-1 rounded-xl px-2 py-2 font-sans text-xs outline-none"
              style={{ background: 'var(--color-chalk)', color: 'var(--color-text-primary)' }}
            >
              <option value="dynamic">Dynamic</option>
              <option value="static">Static</option>
              <option value="mobility">Mobility</option>
            </select>
            <select
              value={form.bodyArea}
              onChange={(e) => setForm({ ...form, bodyArea: e.target.value })}
              className="flex-1 rounded-xl px-2 py-2 font-sans text-xs capitalize outline-none"
              style={{ background: 'var(--color-chalk)', color: 'var(--color-text-primary)' }}
            >
              {BODY_AREAS.map((a) => <option key={a} value={a}>{a.replace('-', ' ')}</option>)}
            </select>
            <input
              type="number"
              value={form.durationSec}
              onChange={(e) => setForm({ ...form, durationSec: e.target.value })}
              className="w-16 rounded-xl px-2 py-2 text-center font-mono text-xs outline-none"
              style={{ background: 'var(--color-chalk)', color: 'var(--color-text-primary)' }}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 rounded-xl py-2 font-sans text-xs font-medium" style={{ background: 'var(--color-chalk)', color: 'var(--color-text-secondary)' }}>
              Cancel
            </button>
            <button onClick={handleAdd} className="flex-1 rounded-xl py-2 font-sans text-xs font-semibold" style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}>
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 font-sans text-xs font-medium"
          style={{ border: '1px dashed var(--color-ash)', color: 'var(--color-text-secondary)' }}
        >
          <Plus size={14} /> Add your own stretch
        </button>
      )}

      {/* Your stretch history */}
      {logs.length > 0 && (
        <>
          <div className="mb-2 mt-7 flex items-baseline justify-between">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
              Recent sessions
            </h2>
            <span className="font-mono text-xs" style={{ color: 'var(--color-ash)' }}>
              {stats.weekMin} min this week
            </span>
          </div>
          {logs.map((l) => (
            <div key={l.id} className="mb-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5" style={{ background: 'var(--color-chalk)', border: '1px solid var(--color-ivory)' }}>
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: l.phase === 'pre' ? 'var(--color-gold)' : 'var(--color-ember)' }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-sans text-sm" style={{ color: 'var(--color-text-primary)' }}>{l.routineName}</span>
                <span className="block font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>{l.date}</span>
              </span>
              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatClock(l.durationSec)}</span>
              <button onClick={() => handleDeleteLog(l)} aria-label="Delete entry">
                <Trash2 size={14} style={{ color: 'var(--color-ash)' }} />
              </button>
            </div>
          ))}
        </>
      )}

      <StretchRoutineModal
        routine={openRoutine}
        isOpen={!!openRoutine}
        onClose={() => setOpenRoutine(null)}
        onStart={(r) => { setOpenRoutine(null); setRunning(r); }}
      />
      <StretchDetailModal stretch={openStretch} isOpen={!!openStretch} onClose={() => setOpenStretch(null)} />
      {running && (
        <StretchRunner
          routine={running}
          phase={running.phase}
          onDone={handleDone}
          onClose={() => setRunning(null)}
        />
      )}
    </>
  );
}

export default function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'stretches' ? 'stretches' : 'exercises';
  const phaseParam = params.get('phase') === 'post' ? 'post' : params.get('phase') === 'pre' ? 'pre' : null;

  function setTab(next) {
    const p = new URLSearchParams(params);
    p.set('tab', next);
    if (next !== 'stretches') p.delete('phase');
    setParams(p, { replace: true });
  }

  return (
    <div className="anim-fade-slide-up px-5 pb-24 pt-8">
      <h1 className="font-display text-4xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
        Library
      </h1>
      <p className="mt-1 font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Browse exercises and stretches, and learn how to do them
      </p>

      <div className="my-4 flex gap-1.5 overflow-hidden rounded-xl p-1" style={{ background: 'var(--color-ivory)' }}>
        {[
          { key: 'exercises', label: 'Exercises' },
          { key: 'stretches', label: 'Stretches' },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 rounded-lg py-2 font-sans text-xs font-semibold transition-colors"
              style={{
                background: active ? 'var(--color-chalk)' : 'transparent',
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: active ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'exercises' ? <ExercisesTab /> : <StretchesTab initialPhase={phaseParam} />}
    </div>
  );
}
