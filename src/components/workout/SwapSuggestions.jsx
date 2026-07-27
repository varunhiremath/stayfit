import { Repeat } from 'lucide-react';
import { swapCandidates } from '../../utils/sessionFlow.js';
import { useExercises } from '../../hooks/useExercises.js';

// Other moves that hit the same muscle, offered right where you'd decide to
// change your mind — the machine is taken, or your shoulder isn't having it.
export default function SwapSuggestions({ muscleGroup, sessionIds, onSwap }) {
  const catalog = useExercises();
  const options = swapCandidates({ muscleGroup, catalog, sessionIds, limit: 4 });
  if (!options.length) return null;

  return (
    <div className="mt-2">
      <p className="mb-1.5 flex items-center gap-1.5 font-sans text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        <Repeat size={11} /> Swap for
      </p>
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={(e) => { e.stopPropagation(); onSwap(o); }}
            className="h-8 flex-shrink-0 rounded-full px-3 font-sans text-xs font-medium"
            style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)' }}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}
