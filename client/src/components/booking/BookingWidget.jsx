import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

import { bookingService } from '../../api/services.js';
import { useAuthStore } from '../../store/authStore.js';
import { calcPricing, formatCurrency, toDateInput, pluralize } from '../../utils/format.js';
import Spinner from '../ui/Spinner.jsx';

/**
 * Sticky reservation widget on the property detail page.
 * - Date + guest selection with live, server-mirrored price breakdown.
 * - Validates against booked ranges client-side, then relies on the server's
 *   authoritative double-booking check on submit.
 * - Creates the booking, then routes to /checkout to choose a payment method.
 */
export default function BookingWidget({ property, bookedRanges = [] }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const today = toDateInput(new Date());
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const pricing = useMemo(
    () => calcPricing(property, checkIn, checkOut),
    [property, checkIn, checkOut]
  );

  /** Returns true if the chosen range overlaps any existing booking. */
  const overlapsBooked = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    return bookedRanges.some((r) => {
      const rs = new Date(r.checkIn);
      const re = new Date(r.checkOut);
      return a < re && b > rs; // standard overlap test
    });
  }, [checkIn, checkOut, bookedRanges]);

  const valid = checkIn && checkOut && pricing.nights > 0 && !overlapsBooked && guests <= property.maxGuests;

  const reserve = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/property/${property._id}` } });
      return;
    }
    if (!valid) {
      toast.error(overlapsBooked ? 'Those dates are already booked' : 'Please choose valid dates');
      return;
    }
    setSubmitting(true);
    try {
      const { booking } = await bookingService.create({
        propertyId: property._id,
        checkIn,
        checkOut,
        guests,
        paymentMethod: 'Pay at Property', // confirmed/changed on the checkout page
      });
      toast.success('Reservation started');
      navigate(`/checkout/${booking._id}`);
    } catch (err) {
      toast.error(err.message || 'Could not create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-card dark:border-ink-700 dark:bg-ink-800">
      <div className="flex items-baseline justify-between">
        <p>
          <span className="text-2xl font-extrabold">{formatCurrency(property.pricePerNight)}</span>
          <span className="text-ink-500"> / night</span>
        </p>
        {property.reviewsCount > 0 && (
          <span className="flex items-center gap-1 text-sm font-medium">
            <Star size={14} className="fill-coral-500 text-coral-500" />
            {property.rating.toFixed(1)} · {pluralize(property.reviewsCount, 'review')}
          </span>
        )}
      </div>

      {/* Date + guest controls */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-700">
        <div className="grid grid-cols-2 divide-x divide-ink-200 dark:divide-ink-700">
          <label className="p-3">
            <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-500">Check-in</span>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && e.target.value >= checkOut) setCheckOut('');
              }}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="p-3">
            <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-500">Check-out</span>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>
        <label className="block border-t border-ink-200 p-3 dark:border-ink-700">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-500">Guests</span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full bg-transparent text-sm outline-none"
          >
            {Array.from({ length: property.maxGuests }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {pluralize(i + 1, 'guest')}
              </option>
            ))}
          </select>
        </label>
      </div>

      {overlapsBooked && (
        <p className="mt-2 text-sm font-medium text-coral-600">Those dates are not available.</p>
      )}

      <button onClick={reserve} disabled={submitting} className="btn-primary mt-4 w-full">
        {submitting ? (
          <Spinner size={18} />
        ) : property.instantBook ? (
          <>
            <Zap size={16} /> Instant book
          </>
        ) : (
          'Reserve'
        )}
      </button>

      <p className="mt-2 text-center text-xs text-ink-400">You won’t be charged yet</p>

      {/* Live price breakdown */}
      <AnimatePresence>
        {pricing.nights > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 space-y-2.5 text-sm"
          >
            <Row
              label={`${formatCurrency(property.pricePerNight)} × ${pluralize(pricing.nights, 'night')}`}
              value={formatCurrency(pricing.subtotal)}
            />
            <Row label="Cleaning fee" value={formatCurrency(pricing.cleaningFee)} />
            <Row label="Service fee" value={formatCurrency(pricing.serviceFee)} />
            <Row label="Taxes" value={formatCurrency(pricing.taxes)} />
            <div className="border-t border-ink-100 pt-3 dark:border-ink-700">
              <Row label={<span className="font-bold">Total</span>} value={<span className="font-bold">{formatCurrency(pricing.total)}</span>} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-ink-600 dark:text-ink-300">
      <span className="underline-offset-2">{label}</span>
      <span>{value}</span>
    </div>
  );
}
