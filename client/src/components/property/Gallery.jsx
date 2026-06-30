import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Grid3x3 } from 'lucide-react';
import FadeImage from '../ui/FadeImage.jsx';

/**
 * Property photo gallery: a responsive mosaic (1 large + 4 small on desktop)
 * with a "Show all photos" button, plus a full-screen lightbox with keyboard
 * and swipe navigation.
 */
export default function Gallery({ images = [], title = '' }) {
  const [lightbox, setLightbox] = useState(false);
  const [index, setIndex] = useState(0);

  const open = (i) => {
    setIndex(i);
    setLightbox(true);
  };

  const go = (dir) => setIndex((p) => (p + dir + images.length) % images.length);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, images.length]);

  const grid = images.slice(0, 5);

  return (
    <>
      {/* Mosaic */}
      <div className="relative grid h-[260px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:h-[420px]">
        <button
          onClick={() => open(0)}
          className="col-span-4 row-span-2 sm:col-span-2"
        >
          <FadeImage src={grid[0]} alt={title} ratio="h-full" className="h-full rounded-none" />
        </button>
        {grid.slice(1, 5).map((src, i) => (
          <button
            key={i}
            onClick={() => open(i + 1)}
            className="hidden sm:block"
          >
            <FadeImage src={src} alt={`${title} ${i + 2}`} ratio="h-full" className="h-full rounded-none" />
          </button>
        ))}

        <button
          onClick={() => open(0)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-ink-800 bg-white px-3.5 py-2 text-sm font-semibold text-ink-900 shadow transition hover:scale-[1.02]"
        >
          <Grid3x3 size={15} /> Show all {images.length} photos
        </button>
      </div>

      {/* Lightbox */}
      {createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div
              className="fixed inset-0 z-[60] flex flex-col bg-black/95"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between p-4 text-white">
                <span className="text-sm">
                  {index + 1} / {images.length}
                </span>
                <button onClick={() => setLightbox(false)} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
                  <X size={24} />
                </button>
              </div>

              <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous"
                  className="absolute left-3 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                >
                  <ChevronLeft size={24} />
                </button>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={index}
                    src={images[index]}
                    alt={`${title} ${index + 1}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="max-h-[80vh] max-w-full rounded-2xl object-contain"
                  />
                </AnimatePresence>
                <button
                  onClick={() => go(1)}
                  aria-label="Next"
                  className="absolute right-3 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
