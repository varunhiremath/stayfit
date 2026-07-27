import { Youtube, Clock, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { formatClock } from '../../utils/stretchSession.js';
import { deleteStretch } from '../../utils/stretchActions.js';
import useUIStore from '../../store/uiStore.js';

const TYPE_LABEL = {
  dynamic: 'Dynamic — move through the range',
  static: 'Static — hold and breathe',
  mobility: 'Mobility — control the joint',
};

// "How do I do this?" for a single stretch: what it targets, how long to hold,
// the coaching cue, and a video to watch.
export default function StretchDetailModal({ stretch, isOpen, onClose }) {
  if (!isOpen || !stretch) return null;

  async function handleDelete() {
    const ok = await useUIStore.getState().confirm({
      title: 'Delete stretch?',
      message: `"${stretch.name}" will be removed from your library and from any routine that uses it.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) { await deleteStretch(stretch.id); onClose(); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={stretch.name}>
      {/* Category tags */}
      <div className="-mt-1 mb-4 flex flex-wrap gap-1.5">
        <span className="rounded-full px-2.5 py-1 font-sans text-xs font-semibold capitalize" style={{ background: 'var(--color-gold)', color: 'var(--color-text-inverse)' }}>
          {stretch.type}
        </span>
        <span className="rounded-full px-2.5 py-1 font-sans text-xs font-medium capitalize" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)' }}>
          {String(stretch.bodyArea).replace('-', ' ')}
        </span>
        <span className="rounded-full px-2.5 py-1 font-sans text-xs font-medium capitalize" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)' }}>
          {stretch.difficulty}
        </span>
        <span className="flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-secondary)' }}>
          <Clock size={11} /> {formatClock(stretch.durationSec)}
        </span>
      </div>

      <p className="mb-4 font-sans text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {TYPE_LABEL[stretch.type] ?? ''}
      </p>

      {/* How to do it */}
      {stretch.description && (
        <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--color-ivory)' }}>
          <p className="mb-1.5 font-sans text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
            How to do it
          </p>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            {stretch.description}
          </p>
        </div>
      )}

      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${stretch.name} stretch how to`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl py-3 font-sans text-sm font-semibold"
        style={{ background: 'var(--color-obsidian)', color: 'var(--color-text-inverse)' }}
      >
        <Youtube size={16} style={{ color: '#FF4444' }} /> Watch a demonstration
      </a>

      {stretch.isCustom && (
        <button
          onClick={handleDelete}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-sans text-xs font-medium"
          style={{ background: 'var(--color-ivory)', color: 'var(--color-ember)' }}
        >
          <Trash2 size={14} /> Delete this stretch
        </button>
      )}
    </Modal>
  );
}
