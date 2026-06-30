import { SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants.js';

/**
 * Horizontally scrollable row of category chips (House, Cabin, Beachfront…)
 * plus a "Filters" button that opens the full filter modal.
 */
export default function CategoryBar({ active = '', onSelect, onOpenFilters, activeFilterCount = 0 }) {
  return (
    <div className="sticky top-16 z-30 border-b border-ink-100 bg-white/95 backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/95">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="no-scrollbar flex flex-1 items-center gap-6 overflow-x-auto">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key || 'all'}
                onClick={() => onSelect(key)}
                className={`flex min-w-fit flex-col items-center gap-1.5 border-b-2 pb-2 pt-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-ink-900 text-ink-900 dark:border-white dark:text-white'
                    : 'border-transparent text-ink-400 hover:border-ink-200 hover:text-ink-700'
                }`}
              >
                <Icon size={22} strokeWidth={1.8} />
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenFilters}
          className="relative flex shrink-0 items-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold transition hover:border-ink-800 dark:border-ink-700"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
