import { useState } from 'react';
import { FALLBACK_IMAGE } from '../../utils/constants.js';

/**
 * Image wrapper that lazy-loads, fades in on load, maintains a consistent
 * aspect ratio, and swaps to a fallback image if the source breaks.
 *
 * @param {string} ratio  Tailwind aspect class, e.g. 'aspect-[4/3]'.
 */
export default function FadeImage({
  src,
  alt = '',
  ratio = 'aspect-[4/3]',
  className = '',
  imgClassName = '',
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-ink-100 dark:bg-ink-700 ${ratio} ${className}`}>
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
      <img
        src={errored ? FALLBACK_IMAGE : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
        className={`h-full w-full object-cover transition-all duration-700 ease-out ${
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm'
        } ${imgClassName}`}
      />
    </div>
  );
}
