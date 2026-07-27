// A lifter pressing a barbell overhead. Drawn in the same stroke style as the
// lucide icons used elsewhere in the nav, so it sits consistently beside them.
export default function LifterIcon({ size = 24, strokeWidth = 2, ...props }) {
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
      {/* barbell: bar + a plate at each end */}
      <line x1="3" y1="4" x2="21" y2="4" />
      <line x1="6.5" y1="1.8" x2="6.5" y2="6.2" />
      <line x1="17.5" y1="1.8" x2="17.5" y2="6.2" />
      {/* arms driving up into the bar */}
      <path d="M9 10.6 L8 4.4" />
      <path d="M15 10.6 L16 4.4" />
      {/* head, shoulders, torso */}
      <circle cx="12" cy="7.6" r="1.9" />
      <line x1="9" y1="10.6" x2="15" y2="10.6" />
      <line x1="12" y1="10.6" x2="12" y2="15.4" />
      {/* legs */}
      <path d="M12 15.4 L9.2 21.2" />
      <path d="M12 15.4 L14.8 21.2" />
    </svg>
  );
}
