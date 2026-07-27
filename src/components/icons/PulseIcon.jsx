// The app icon's "Pulse" mark, reduced for nav use: a weight-plate ring with a
// movement wave through it. Only two shapes, so it stays crisp at 22px where a
// detailed figure turns to mush.
export default function PulseIcon({ size = 24, strokeWidth = 2.1, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="8.7" />
      <path d="M6.9 12 H9.3 L10.9 8.6 L13.1 15.4 L14.7 12 H17.1" strokeWidth={strokeWidth * 1.15} />
    </svg>
  );
}
