import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewService } from '../../api/services.js';
import { formatDate } from '../../utils/format.js';
import Rating from '../ui/Rating.jsx';
import ReviewForm from './ReviewForm.jsx';

/**
 * Reviews section: average + 1–5 star distribution breakdown, the list of
 * reviews, and (when allowed) an inline form for the guest to add one.
 *
 * @param {boolean} canReview  guest has a completed, unreviewed stay here
 */
export default function Reviews({ propertyId, canReview = false }) {
  const [data, setData] = useState({ reviews: [], count: 0, average: 0, breakdown: {} });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await reviewService.forProperty(propertyId);
      setData(res);
    } catch {
      // Non-critical; leave the empty state.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const onSubmitted = (review) => {
    toast.success('Thanks for your review!');
    setData((d) => ({
      ...d,
      reviews: [review, ...d.reviews],
      count: d.count + 1,
    }));
  };

  const maxCount = Math.max(1, ...Object.values(data.breakdown || {}));

  if (loading) return <div className="h-32 skeleton rounded-2xl" />;

  return (
    <section className="border-t border-ink-100 py-8 dark:border-ink-700">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Star size={20} className="fill-coral-500 text-coral-500" />
        {data.count > 0 ? `${data.average.toFixed(1)} · ${data.count} reviews` : 'No reviews yet'}
      </h2>

      {data.count > 0 && (
        <div className="mt-5 grid max-w-md grid-cols-1 gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-3 text-ink-500">{star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
                <div
                  className="h-full rounded-full bg-coral-500 transition-all"
                  style={{ width: `${((data.breakdown[star] || 0) / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-ink-500">{data.breakdown[star] || 0}</span>
            </div>
          ))}
        </div>
      )}

      {canReview && (
        <div className="mt-6">
          <ReviewForm propertyId={propertyId} onSubmitted={onSubmitted} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        {data.reviews.map((r) => (
          <article key={r._id}>
            <div className="flex items-center gap-3">
              <img src={r.author?.avatar} alt={r.author?.name} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold">{r.author?.name}</p>
                <p className="text-xs text-ink-400">{formatDate(r.createdAt)}</p>
              </div>
            </div>
            <Rating value={r.rating} showCount={false} className="mt-2 text-sm" />
            <p className="mt-1.5 text-ink-600 dark:text-ink-300">{r.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
