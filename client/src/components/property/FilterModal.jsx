import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { PROPERTY_TYPES, AMENITIES, AMENITY_ICONS } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/format.js';
import { propertyService } from '../../api/services.js';

/**
 * Full search filter modal: price range, property type, amenities, bedrooms,
 * bathrooms and instant book. Emits a flat filter object via onApply.
 *
 * `initial` seeds the controls from the current URL-derived filters so the
 * modal reflects the active query.
 */
const EMPTY = {
  minPrice: '',
  maxPrice: '',
  type: '',
  amenities: [],
  bedrooms: 0,
  bathrooms: 0,
  instantBook: false,
  superhost: false,
};

export default function FilterModal({ open, onClose, initial = {}, onApply }) {
  const [draft, setDraft] = useState(EMPTY);
  const [priceStats, setPriceStats] = useState({ min: 0, max: 1000, buckets: [] });

  // Re-seed whenever the modal opens.
  useEffect(() => {
    if (open) {
      setDraft({
        ...EMPTY,
        ...initial,
        amenities: initial.amenities || [],
        bedrooms: Number(initial.bedrooms) || 0,
        bathrooms: Number(initial.bathrooms) || 0,
        instantBook: initial.instantBook === 'true' || initial.instantBook === true,
        superhost: initial.superhost === 'true' || initial.superhost === true,
      });
    }
  }, [open, initial]);

  // Load the price distribution once when the modal first opens.
  useEffect(() => {
    if (!open) return;
    let active = true;
    propertyService
      .priceStats()
      .then((data) => {
        if (active && data.max > data.min) setPriceStats(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [open]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const toggleAmenity = (a) =>
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(a)
        ? d.amenities.filter((x) => x !== a)
        : [...d.amenities, a],
    }));

  const apply = () => {
    onApply({
      minPrice: draft.minPrice || '',
      maxPrice: draft.maxPrice || '',
      type: draft.type || '',
      amenities: draft.amenities,
      bedrooms: draft.bedrooms || '',
      bathrooms: draft.bathrooms || '',
      instantBook: draft.instantBook ? 'true' : '',
      superhost: draft.superhost ? 'true' : '',
    });
    onClose();
  };

  const Stepper = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-300 text-lg disabled:opacity-40"
          disabled={value === 0}
        >
          −
        </button>
        <span className="w-10 text-center font-semibold">{value === 0 ? 'Any' : value + '+'}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-300 text-lg"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <button onClick={() => setDraft(EMPTY)} className="text-sm font-semibold underline">
            Clear all
          </button>
          <button onClick={apply} className="btn-primary">
            Show results
          </button>
        </div>
      }
    >
      {/* Price range */}
      <section className="border-b border-ink-100 pb-5 dark:border-ink-700">
        <h3 className="mb-1 text-base font-bold">Price range (per night)</h3>
        <p className="mb-3 text-sm text-ink-500">
          {formatCurrency(draft.minPrice || priceStats.min)} –{' '}
          {draft.maxPrice ? formatCurrency(draft.maxPrice) : `${formatCurrency(priceStats.max)}+`}
        </p>

        <PriceHistogram
          stats={priceStats}
          minPrice={draft.minPrice}
          maxPrice={draft.maxPrice}
          onChange={(patch) => set(patch)}
        />

        <div className="mt-5 flex items-center gap-4">
          <label className="flex-1">
            <span className="mb-1 block text-xs text-ink-500">Minimum</span>
            <input
              type="number"
              min={priceStats.min}
              max={priceStats.max}
              value={draft.minPrice}
              onChange={(e) => set({ minPrice: e.target.value })}
              placeholder={String(priceStats.min)}
              className="input"
            />
          </label>
          <span className="mt-5 text-ink-400">—</span>
          <label className="flex-1">
            <span className="mb-1 block text-xs text-ink-500">Maximum</span>
            <input
              type="number"
              min={priceStats.min}
              max={priceStats.max}
              value={draft.maxPrice}
              onChange={(e) => set({ maxPrice: e.target.value })}
              placeholder={`${priceStats.max}+`}
              className="input"
            />
          </label>
        </div>
      </section>

      {/* Property type */}
      <section className="border-b border-ink-100 py-5 dark:border-ink-700">
        <h3 className="mb-3 text-base font-bold">Property type</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => set({ type: '' })}
            className={`chip ${draft.type === '' ? 'chip-active' : ''}`}
          >
            Any
          </button>
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => set({ type: draft.type === t ? '' : t })}
              className={`chip ${draft.type === t ? 'chip-active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Rooms */}
      <section className="border-b border-ink-100 py-3 dark:border-ink-700">
        <h3 className="mb-1 text-base font-bold">Rooms</h3>
        <Stepper label="Bedrooms" value={draft.bedrooms} onChange={(v) => set({ bedrooms: v })} />
        <Stepper label="Bathrooms" value={draft.bathrooms} onChange={(v) => set({ bathrooms: v })} />
      </section>

      {/* Amenities */}
      <section className="border-b border-ink-100 py-5 dark:border-ink-700">
        <h3 className="mb-3 text-base font-bold">Amenities</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES.map((a) => {
            const Icon = AMENITY_ICONS[a];
            const on = draft.amenities.includes(a);
            return (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                  on
                    ? 'border-coral-500 bg-coral-50 text-coral-700 dark:bg-ink-700'
                    : 'border-ink-200 hover:border-ink-400 dark:border-ink-700'
                }`}
              >
                {Icon && <Icon size={16} />} {a}
              </button>
            );
          })}
        </div>
      </section>

      {/* Toggles */}
      <section className="py-5">
        <label className="flex cursor-pointer items-center justify-between py-2">
          <span className="font-medium">Instant book</span>
          <input
            type="checkbox"
            checked={draft.instantBook}
            onChange={(e) => set({ instantBook: e.target.checked })}
            className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-coral-500 relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between py-2">
          <span className="font-medium">Superhost only</span>
          <input
            type="checkbox"
            checked={draft.superhost}
            onChange={(e) => set({ superhost: e.target.checked })}
            className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-ink-200 transition checked:bg-coral-500 relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4"
          />
        </label>
      </section>
    </Modal>
  );
}


/**
 * Price distribution histogram with an overlaid dual-range slider.
 * Bars within the selected [min, max] range are highlighted; dragging either
 * handle (or editing the number inputs) updates the draft filter.
 */
function PriceHistogram({ stats, minPrice, maxPrice, onChange }) {
  const lo = stats.min;
  const hi = stats.max;
  const span = Math.max(1, hi - lo);

  // Current selected bounds, clamped to the available range.
  const curMin = Math.max(lo, Math.min(minPrice === '' ? lo : Number(minPrice), hi));
  const curMax = Math.min(hi, Math.max(maxPrice === '' ? hi : Number(maxPrice), lo));

  const maxCount = Math.max(1, ...stats.buckets.map((b) => b.count));
  const pct = (v) => ((v - lo) / span) * 100;

  if (!stats.buckets.length) {
    return <div className="h-20 skeleton rounded-xl" />;
  }

  return (
    <div>
      {/* Histogram bars */}
      <div className="flex h-20 items-end gap-[3px]" aria-hidden="true">
        {stats.buckets.map((b, i) => {
          const inRange = b.to >= curMin && b.from <= curMax;
          return (
            <div
              key={i}
              title={`${formatCurrency(b.from)}–${formatCurrency(b.to)}: ${b.count}`}
              style={{ height: `${Math.max(6, (b.count / maxCount) * 100)}%` }}
              className={`flex-1 rounded-t transition-colors ${
                inRange ? 'bg-coral-400' : 'bg-ink-200 dark:bg-ink-700'
              }`}
            />
          );
        })}
      </div>

      {/* Dual-range slider over a shared track */}
      <div className="range-slider mt-1">
        {/* Base track */}
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-ink-200 dark:bg-ink-700" />
        {/* Selected segment */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-coral-500"
          style={{ left: `${pct(curMin)}%`, right: `${100 - pct(curMax)}%` }}
        />
        <input
          type="range"
          min={lo}
          max={hi}
          value={curMin}
          aria-label="Minimum price"
          onChange={(e) => onChange({ minPrice: String(Math.min(Number(e.target.value), curMax - 1)) })}
        />
        <input
          type="range"
          min={lo}
          max={hi}
          value={curMax}
          aria-label="Maximum price"
          onChange={(e) => onChange({ maxPrice: String(Math.max(Number(e.target.value), curMin + 1)) })}
        />
      </div>
    </div>
  );
}
