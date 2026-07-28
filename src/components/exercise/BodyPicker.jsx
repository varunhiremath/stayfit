import { useState } from 'react';
import Model from 'react-body-highlighter';
import { Eye } from 'lucide-react';

const ANTERIOR = [
  'chest', 'abs', 'obliques', 'biceps', 'forearm',
  'quadriceps', 'calves', 'front-deltoids', 'triceps', 'abductors',
];
const POSTERIOR = [
  'upper-back', 'lower-back', 'trapezius', 'hamstring',
  'gluteal', 'back-deltoids', 'calves', 'triceps', 'adductor',
];
// Insertion order is the order of the filter pills, so it runs top-to-bottom
// through the body: push, pull, arms, core, legs. Keeping the leg muscles
// adjacent matters — Adductors used to trail off the end of a scrolling row
// where nobody found it.
const LABEL = {
  chest: 'Chest', 'front-deltoids': 'Front Delts', triceps: 'Triceps',
  'upper-back': 'Upper Back', 'lower-back': 'Lower Back', trapezius: 'Traps',
  'back-deltoids': 'Rear Delts', biceps: 'Biceps', forearm: 'Forearms',
  abs: 'Abs', obliques: 'Obliques',
  quadriceps: 'Quads', hamstring: 'Hamstrings', gluteal: 'Glutes',
  adductor: 'Adductors', abductors: 'Abductors', calves: 'Calves',
};

export default function BodyPicker({ selected, onSelect }) {
  const [showModel, setShowModel] = useState(false);
  const [view, setView] = useState('anterior');

  const muscles = view === 'anterior' ? ANTERIOR : POSTERIOR;
  const modelData = selected
    ? [{ name: selected, muscles: [selected], frequency: 3 }]
    : [];

  function handleModelClick({ muscle }) {
    onSelect(selected === muscle ? null : muscle);
  }

  return (
    <div>
      {/* Muscle pills */}
      <div className="flex items-start gap-2">
        {/* Wrapped, not a scrolling strip: with 17 groups a single row hid all
            but the first five, so most of the filter was invisible. */}
        <div className="flex flex-1 flex-wrap gap-2">
          {Object.entries(LABEL).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onSelect(selected === key ? null : key)}
              className="flex-shrink-0 rounded-full px-3 py-1.5 font-sans text-xs font-medium"
              style={{
                background: selected === key ? 'var(--color-gold)' : 'var(--color-ivory)',
                color: selected === key ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                border: selected === key ? 'none' : '1px solid transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Toggle body model */}
        <button
          onClick={() => setShowModel((v) => !v)}
          className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: showModel ? 'var(--color-obsidian)' : 'var(--color-ivory)' }}
          aria-label="Toggle body map"
        >
          <Eye size={14} style={{ color: showModel ? 'var(--color-text-inverse)' : 'var(--color-ash)' }} />
        </button>
      </div>

      {/* Expandable anatomy model */}
      {showModel && (
        <div className="mt-4">
          {/* Front / Back toggle */}
          <div
            className="mb-3 flex overflow-hidden rounded-xl"
            style={{ background: 'var(--color-chalk)' }}
          >
            {['anterior', 'posterior'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex-1 py-2 font-sans text-xs font-medium"
                style={{
                  background: view === v ? 'var(--color-obsidian)' : 'transparent',
                  color: view === v ? 'var(--color-text-inverse)' : 'var(--color-ash)',
                }}
              >
                {v === 'anterior' ? 'Front' : 'Back'}
              </button>
            ))}
          </div>

          {/* Model SVG */}
          <div className="flex justify-center" style={{ maxHeight: 220, overflow: 'hidden' }}>
            <Model
              data={modelData}
              highlightedColors={['#C9A84C']}
              onClick={handleModelClick}
              type={view}
            />
          </div>

          {/* Contextual muscle buttons for current view */}
          <div className="mt-3 flex flex-wrap gap-2">
            {muscles.map((m) => (
              <button
                key={m}
                onClick={() => onSelect(selected === m ? null : m)}
                className="rounded-full px-3 py-1 font-sans text-xs font-medium"
                style={{
                  background: selected === m ? 'var(--color-gold)' : 'var(--color-chalk)',
                  color: selected === m ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                }}
              >
                {LABEL[m]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
