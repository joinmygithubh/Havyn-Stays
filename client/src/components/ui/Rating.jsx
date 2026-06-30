import { Star } from 'lucide-react';

/**
 * Compact rating display: a filled star + numeric average and optional count.
 * Set `interactive` + `onChange` to use it as a star input.
 */
export default function Rating({
  value = 0,
  count,
  size = 16,
  showCount = true,
  interactive = false,
  onChange,
  className = '',
}) {
  if (interactive) {
    return (
      <div className={`flex items-center gap-1 ${className}`} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="transition hover:scale-110"
          >
            <Star
              size={size + 8}
              className={n <= value ? 'fill-coral-500 text-coral-500' : 'text-ink-300'}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${className}`}>
      <Star size={size} className="fill-coral-500 text-coral-500" />
      <span>{Number(value).toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="text-ink-400">({count})</span>
      )}
    </span>
  );
}
