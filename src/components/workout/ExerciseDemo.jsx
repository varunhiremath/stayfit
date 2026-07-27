import { useState } from 'react';
import { ChevronDown, Youtube, PlayCircle } from 'lucide-react';
import { useExerciseDemo, howToVideoUrl } from '../../hooks/useExerciseDemo.js';

// "How to do it", inline in the workout log. Collapsed it is one thin row with
// a thumbnail, so a six-exercise session stays scannable; expanded it shows the
// full demonstration picture and a link to a video.
export default function ExerciseDemo({ name }) {
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  const demo = useExerciseDemo(name);
  const hasImage = !!demo && !broken;

  return (
    <div className="mt-2 overflow-hidden rounded-xl" style={{ background: 'var(--color-ivory)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-2.5 py-2"
        aria-expanded={open}
      >
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg"
          style={{ background: 'var(--color-chalk)' }}
        >
          {hasImage ? (
            <img
              src={demo}
              alt=""
              className="h-full w-full object-contain"
              onError={() => setBroken(true)}
            />
          ) : (
            <PlayCircle size={15} style={{ color: 'var(--color-ash)' }} />
          )}
        </span>
        <span className="min-w-0 flex-1 text-left font-sans text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          How to do it
        </span>
        <ChevronDown
          size={15}
          style={{
            color: 'var(--color-ash)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--dur-standard) var(--ease-out)',
          }}
        />
      </button>

      {open && (
        <div className="anim-fade-in px-2.5 pb-2.5">
          {hasImage ? (
            <img
              src={demo}
              alt={`${name} demonstration`}
              onError={() => setBroken(true)}
              className="w-full rounded-lg object-contain"
              style={{ maxHeight: 190, background: 'var(--color-chalk)' }}
            />
          ) : (
            <p className="rounded-lg px-3 py-2.5 font-sans text-xs" style={{ background: 'var(--color-chalk)', color: 'var(--color-text-secondary)' }}>
              No picture for this one — the video below shows the movement.
            </p>
          )}
          <a
            href={howToVideoUrl(name)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 font-sans text-xs font-semibold"
            style={{ background: 'var(--color-obsidian)', color: 'var(--color-text-inverse)' }}
          >
            <Youtube size={14} style={{ color: '#FF4444' }} /> Watch how-to video
          </a>
        </div>
      )}
    </div>
  );
}
