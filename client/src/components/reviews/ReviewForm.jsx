import { useState } from 'react';
import toast from 'react-hot-toast';
import { reviewService } from '../../api/services.js';
import Rating from '../ui/Rating.jsx';
import Spinner from '../ui/Spinner.jsx';

/** Inline form for leaving a star rating + written review on a completed stay. */
export default function ReviewForm({ propertyId, bookingId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      toast.error('Please write at least a few words');
      return;
    }
    setSubmitting(true);
    try {
      const { review } = await reviewService.create({ propertyId, bookingId, rating, comment: comment.trim() });
      setComment('');
      onSubmitted?.(review);
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-ink-100 bg-ink-50/60 p-5 dark:border-ink-700 dark:bg-ink-900">
      <h3 className="font-bold">Share your experience</h3>
      <div className="mt-3">
        <Rating value={rating} interactive onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Tell other travelers what made this stay special…"
        className="input mt-3 resize-none"
      />
      <button type="submit" disabled={submitting} className="btn-primary mt-3">
        {submitting ? <Spinner size={18} /> : 'Submit review'}
      </button>
    </form>
  );
}
