// StayFit brand mark — "Pulse": a weight plate with movement running through
// it. The ring is the load, the wave is the range of motion. Self-contained
// SVG, no image asset, and it matches the installed app icon exactly.
//
// The tile is white, so on a white card the mark reads as just the ring and
// wave; on the app canvas it lifts slightly. `animate` draws the wave in.
export default function BrandMark({ size = 96, animate = false, rounded = 0.225 }) {
  const r = 100 * rounded;
  const uid = `bm${size}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="StayFit">
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx={r} ry={r} fill="#ffffff" />
      <circle cx="50" cy="50" r="27.3" fill="none" stroke={`url(#${uid})`} strokeWidth="6.6" />
      <path
        d="M29.3 50 H38.7 L43.8 39 L51.2 61.7 L56.2 50 H70.7"
        fill="none"
        stroke="#0F172A"
        strokeWidth="5.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animate
            ? {
                strokeDasharray: 76,
                strokeDashoffset: 76,
                animation: 'ringDraw 700ms var(--ease-out) 250ms forwards',
              }
            : undefined
        }
      />
    </svg>
  );
}
