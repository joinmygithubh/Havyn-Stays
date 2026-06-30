/**
 * Havyn brand mark: a minimal SVG "haven" roof + pin, paired with the wordmark.
 * `compact` renders just the icon (used in the mobile navbar).
 */
export default function Logo({ compact = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="havyn-logo-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF8DA1" />
            <stop offset="1" stopColor="#F43F6B" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#havyn-logo-g)" />
        <path
          d="M32 14L48 28v20a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V28L32 14Z"
          fill="white"
          fillOpacity="0.95"
        />
        <circle cx="32" cy="33" r="6" fill="#F43F6B" />
      </svg>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-coral-600 dark:text-coral-400">
          havyn
        </span>
      )}
    </span>
  );
}
