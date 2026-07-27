import BrandMark from './BrandMark.jsx';

// Short, light splash for LUDI. Snappy — no cinematic RPG intro.
export default function LoadingScreen({ fadingOut = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'var(--color-canvas)',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 400ms var(--ease-out)',
      }}
    >
      <div style={{ animation: 'scaleIn 500ms var(--ease-out) 100ms both' }}>
        <BrandMark size={104} animate />
      </div>

      <h1
        className="font-display"
        style={{
          marginTop: 'var(--space-6)',
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: 6,
          textIndent: 6,
          color: 'var(--color-text-primary)',
          animation: 'fadeSlideUp 600ms var(--ease-out) 500ms both',
        }}
      >
        LUDI
      </h1>

      <p
        className="font-sans"
        style={{
          marginTop: 'var(--space-2)',
          fontSize: 12,
          letterSpacing: 3,
          textIndent: 3,
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
          animation: 'fadeIn 500ms var(--ease-out) 800ms both',
        }}
      >
        Let's do it
      </p>
    </div>
  );
}
