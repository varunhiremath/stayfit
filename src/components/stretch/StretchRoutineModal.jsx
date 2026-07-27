import { Play, Clock } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { formatClock } from '../../utils/stretchSession.js';

// A routine's full move list — read it to learn the sequence, or start the
// guided player and have the time logged for you.
export default function StretchRoutineModal({ routine, isOpen, onClose, onStart }) {
  if (!isOpen || !routine) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={routine.name}>
      <div className="-mt-1 mb-4 flex flex-wrap gap-1.5">
        <span
          className="rounded-full px-2.5 py-1 font-sans text-xs font-semibold"
          style={{
            background: routine.phase === 'pre' ? 'var(--color-gold)' : 'var(--color-ember)',
            color: 'var(--color-text-inverse)',
          }}
        >
          {routine.phase === 'pre' ? 'Warm-up' : 'Cool-down'}
        </span>
        <span className="rounded-full px-2.5 py-1 font-sans text-xs font-medium capitalize" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)' }}>
          {String(routine.bodyArea ?? 'full-body').replace('-', ' ')}
        </span>
        <span className="flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)' }}>
          <Clock size={11} /> {formatClock(routine.totalSec)}
        </span>
      </div>

      <button
        onClick={() => onStart(routine)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-sm font-semibold"
        style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}
      >
        <Play size={16} strokeWidth={2.5} /> Start guided session
      </button>

      <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
        {routine.items.length} moves
      </p>
      {routine.items.map((item, i) => (
        <div key={`${item.stretchId}-${i}`} className="mb-2 rounded-xl px-3.5 py-3" style={{ background: 'var(--color-ivory)' }}>
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold"
              style={{ background: 'var(--color-chalk)', color: 'var(--color-text-secondary)' }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 font-sans text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {item.name}
            </span>
            <span className="flex-shrink-0 font-mono text-xs" style={{ color: 'var(--color-ash)' }}>
              {formatClock(item.durationSec)}
            </span>
          </div>
          {item.description && (
            <p className="mt-1.5 pl-8.5 font-sans text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)', paddingLeft: 34 }}>
              {item.description}
            </p>
          )}
        </div>
      ))}
    </Modal>
  );
}
