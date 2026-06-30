import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

import SearchBar from '../components/search/SearchBar.jsx';
import CategoryBar from '../components/property/CategoryBar.jsx';
import FilterModal from '../components/property/FilterModal.jsx';
import PropertyCard from '../components/property/PropertyCard.jsx';
import { PropertyGridSkeleton } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { propertyService } from '../api/services.js';
import { SORT_OPTIONS } from '../utils/constants.js';

const LIMIT = 12;

/**
 * Home / Explore page. The URL query string is the single source of truth for
 * all search + filter state, so results are shareable and back/forward works.
 */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, hasMore: false });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Convert the query string into a plain object for the API + filter modal.
  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const activeCategory = params.type || '';

  // Count "extra" filters (beyond category/search) for the filter badge.
  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (params.minPrice) n += 1;
    if (params.maxPrice) n += 1;
    if (params.amenities) n += params.amenities.split(',').filter(Boolean).length;
    if (params.bedrooms) n += 1;
    if (params.bathrooms) n += 1;
    if (params.instantBook) n += 1;
    if (params.superhost) n += 1;
    return n;
  }, [params]);

  const fetchProperties = useCallback(
    async (pageNum, append = false) => {
      append ? setLoadingMore(true) : setLoading(true);
      try {
        const data = await propertyService.list({ ...params, page: pageNum, limit: LIMIT });
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setMeta({ total: data.total, totalPages: data.totalPages, hasMore: data.hasMore });
        setPage(data.page);
      } catch (err) {
        toast.error(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [params]
  );

  // Refetch from page 1 whenever the query string changes.
  useEffect(() => {
    fetchProperties(1, false);
  }, [fetchProperties]);

  /** Merge a partial patch into the query string (dropping empty values). */
  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null || (Array.isArray(value) && !value.length)) {
        next.delete(key);
      } else {
        next.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const onSelectCategory = (type) => updateParams({ type });

  const onApplyFilters = (filters) => {
    updateParams({
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      type: filters.type,
      amenities: filters.amenities,
      bedrooms: filters.bedrooms,
      bathrooms: filters.bathrooms,
      instantBook: filters.instantBook,
      superhost: filters.superhost,
    });
  };

  const hasActiveSearch = params.location || params.checkIn || activeFilterCount > 0;

  const clearAll = () => setSearchParams({}, { replace: true });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-coral-50 to-white dark:from-ink-800 dark:to-ink-900">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl"
          >
            Find your <span className="text-coral-500">haven</span>, anywhere.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-3 max-w-xl text-ink-500 sm:text-lg"
          >
            Book unique homes, cabins, and villas from trusted hosts around the world.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Category + filters */}
      <CategoryBar
        active={activeCategory}
        onSelect={onSelectCategory}
        onOpenFilters={() => setFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Results */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">
              {loading ? 'Searching…' : `${meta.total} ${meta.total === 1 ? 'stay' : 'stays'}`}
              {params.location && !loading && (
                <span className="font-normal text-ink-500"> in “{params.location}”</span>
              )}
            </h2>
            {hasActiveSearch && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-600 transition hover:bg-ink-200 dark:bg-ink-800"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink-500">Sort</span>
            <select
              value={params.sort || ''}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 font-medium outline-none focus:border-coral-400 dark:border-ink-700 dark:bg-ink-800"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <PropertyGridSkeleton count={8} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No properties found"
            message="Try adjusting your filters or searching a different destination."
            action={
              <button onClick={clearAll} className="btn-primary">
                Reset search
              </button>
            }
          />
        ) : (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {items.map((property, i) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.03 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </motion.div>

            {meta.hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => fetchProperties(page + 1, true)}
                  disabled={loadingMore}
                  className="btn-secondary"
                >
                  {loadingMore ? <Spinner size={18} /> : 'Show more stays'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <FilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        initial={params}
        onApply={onApplyFilters}
      />
    </div>
  );
}
