import { useState } from 'react';
import { Search, Youtube, Trash2, Plus } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { useStretches } from '../../hooks/useStretches.js';
import { BODY_AREAS } from '../../utils/seedStretches.js';
import { addCustomStretch, deleteStretch } from '../../utils/stretchActions.js';
import { formatClock } from '../../utils/stretchSession.js';
import useUIStore from '../../store/uiStore.js';

const TYPES = [
  { key: null, label: 'All' },
  { key: 'dynamic', label: 'Dynamic' },
  { key: 'static', label: 'Static' },
  { key: 'mobility', label: 'Mobility' },
];

// Browse the stretch database: search, filter by type and body area, see how
// each one is done, and add or remove your own.
export default function StretchLibraryModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState(null);
  const [area, setArea] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'static', bodyArea: 'full-body', durationSec: 30, description: '' });

  const stretches = useStretches({ search, type, bodyArea: area });

  async function handleAdd() {
    if (!form.name.trim()) return;
    await addCustomStretch(form);
    setForm({ name: '', type: 'static', bodyArea: 'full-body', durationSec: 30, description: '' });
    setAdding(false);
    useUIStore.getState().showToast('Stretch added', { type: 'success' });
  }

  async function handleDelete(s) {
    const ok = await useUIStore.getState().confirm({
      title: 'Delete stretch?',
      message: `"${s.name}" will be removed from your library and any routines that use it.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) await deleteStretch(s.id);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Stretch library">
      {/* Search */}
      <div className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--color-ivory)' }}>
        <Search size={15} style={{ color: 'var(--color-ash)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stretches"
          className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Type chips */}
      <div className="no-scrollbar -mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {TYPES.map((t) => {
          const active = type === t.key;
          return (
            <button
              key={t.label}
              onClick={() => setType(t.key)}
              className="h-8 flex-shrink-0 rounded-full px-3 font-sans text-xs font-semibold"
              style={{
                background: active ? 'var(--color-gold)' : 'var(--color-ivory)',
                color: active ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Body-area chips */}
      <div className="no-scrollbar -mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <button
          onClick={() => setArea(null)}
          className="h-8 flex-shrink-0 rounded-full px-3 font-sans text-xs font-medium capitalize"
          style={{
            background: area === null ? 'var(--color-text-primary)' : 'var(--color-ivory)',
            color: area === null ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
          }}
        >
          All areas
        </button>
        {BODY_AREAS.map((a) => (
          <button
            key={a}
            onClick={() => setArea(area === a ? null : a)}
            className="h-8 flex-shrink-0 rounded-full px-3 font-sans text-xs font-medium capitalize"
            style={{
              background: area === a ? 'var(--color-text-primary)' : 'var(--color-ivory)',
              color: area === a ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
            }}
          >
            {a.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Add custom */}
      {adding ? (
        <div className="mb-3 rounded-2xl p-3" style={{ background: 'var(--color-ivory)' }}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Stretch name"
            className="mb-2 w-full rounded-xl px-3 py-2 font-sans text-sm outline-none"
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
          className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 font-sans text-xs font-medium"
          style={{ border: '1px dashed var(--color-ash)', color: 'var(--color-text-secondary)' }}
        >
          <Plus size={14} /> Add your own stretch
        </button>
      )}

      {/* List */}
      {stretches.length === 0 ? (
        <p className="py-6 text-center font-sans text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No stretches match those filters.
        </p>
      ) : (
        stretches.map((s) => (
          <div key={s.id} className="mb-2 rounded-xl px-3.5 py-3" style={{ background: 'var(--color-ivory)' }}>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {s.name}
              </span>
              <span className="flex-shrink-0 font-mono text-xs" style={{ color: 'var(--color-ash)' }}>
                {formatClock(s.durationSec)}
              </span>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${s.name} stretch how to`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`How to do ${s.name}`}
              >
                <Youtube size={15} style={{ color: '#FF4444' }} />
              </a>
              {s.isCustom && (
                <button onClick={() => handleDelete(s)} aria-label={`Delete ${s.name}`}>
                  <Trash2 size={14} style={{ color: 'var(--color-ash)' }} />
                </button>
              )}
            </div>
            <p className="mt-0.5 font-sans text-[11px] capitalize" style={{ color: 'var(--color-text-secondary)' }}>
              {s.type} · {String(s.bodyArea).replace('-', ' ')}
            </p>
            {s.description && (
              <p className="mt-1 font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {s.description}
              </p>
            )}
          </div>
        ))
      )}
    </Modal>
  );
}
