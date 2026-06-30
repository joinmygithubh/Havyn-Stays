import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import FadeImage from './FadeImage.jsx';

/**
 * Swipeable image carousel for listing cards. Shows prev/next arrows on hover
 * and dot indicators. Supports drag-to-swipe on touch devices via Framer Motion.
 */
export default function ImageCarousel({ images = [], alt = '', ratio = 'aspect-[4/3]', rounded = 'rounded-2xl' }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const count = images.length;

  const go = (dir, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDirection(dir);
    setIndex((prev) => (prev + dir + count) % count);
  };

  if (count === 0) return <FadeImage src="" alt={alt} ratio={ratio} className={rounded} />;

  return (
    <div className={`group/carousel relative overflow-hidden ${ratio} ${rounded}`}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          drag={count > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
          className="absolute inset-0"
        >
          <FadeImage src={images[index]} alt={`${alt} ${index + 1}`} ratio={ratio} className="h-full" />
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(-1, e)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-ink-800 opacity-0 shadow transition group-hover/carousel:opacity-100 hover:scale-105"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => go(1, e)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-ink-800 opacity-0 shadow transition group-hover/carousel:opacity-100 hover:scale-105"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full bg-white transition-all ${
                  i === index ? 'w-4 opacity-100' : 'w-1.5 opacity-60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
