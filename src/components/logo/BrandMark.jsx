// StayFit brand mark — a rounded emerald badge with a bold checkmark (the
// "let's do it → done" motif). Self-contained SVG, theme-agnostic, no image
// asset. Replaces the old level-evolving OpusMark. `animate` draws the check in.
export default function BrandMark({ size = 96, animate = false, rounded = 0.28 }) {
  const r = 100 * rounded;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="StayFit">
      <defs>
        <linearGradient id="stayfitGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="var(--color-gold)" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx={r} ry={r} fill="url(#stayfitGrad)" />
      <path
        d="M28 52 L44 68 L74 34"
        fill="none"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animate
            ? {
                strokeDasharray: 90,
                strokeDashoffset: 90,
                animation: 'ringDraw 700ms var(--ease-out) 300ms forwards',
              }
            : undefined
        }
      />
    </svg>
  );
}
