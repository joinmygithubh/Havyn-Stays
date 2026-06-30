import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

import FadeImage from '../components/ui/FadeImage.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { bookingService } from '../api/services.js';
import { formatCurrency, formatDate, pluralize } from '../utils/format.js';
import { STATUS_STYLES } from '../utils/constants.js';

/** Guest trips page split into Upcoming and Past tabs, with cancel + pay actions. */
export default function Trips() {
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async (status) => {
    setLoading(true);
    try {
      const { items } = await bookingService.myBookings(status);
      setBookings(items);
    } catch (err) {
      toast.error(err.message || 'Could not load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const cancel = async (id) => {
    setBusyId(id);
    try {
      await bookingService.cancel(id);
      toast.success('Booking cancelled');
      load(tab);
    } catch (err) {
      toast.error(err.message || 'Could not cancel');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">My trips</h1>

      {/* Tabs */}
      <div className="mt-5 flex gap-2 border-b border-ink-100 dark:border-ink-700">
        {['upcoming', 'past'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition ${
              tab === t
                ? 'border-coral-500 text-coral-600'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            {t} trips
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16 text-coral-500">
            <Spinner size={30} />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={`No ${tab} trips`}
            message={tab === 'upcoming' ? 'Time to plan your next getaway!' : 'Your completed trips will appear here.'}
            action={
              <Link to="/" className="btn-primary">
                Find a stay
              </Link>
            }
          />
        ) : (
          bookings.map((b) => (
            <div
              key={b._id}
              className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-card dark:border-ink-700 dark:bg-ink-800 sm:flex-row"
            >
              <Link to={`/property/${b.property?._id}`} className="sm:w-56 sm:shrink-0">
                <FadeImage src={b.property?.images?.[0]} alt={b.property?.title} ratio="aspect-[4/3]" />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/property/${b.property?._id}`} className="font-bold hover:underline">
                      {b.property?.title}
                    </Link>
                    <p className="flex items-center gap-1 text-sm text-ink-500">
                      <MapPin size={13} />
                      {[b.property?.location?.city, b.property?.location?.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[b.bookingStatus]}`}>
                    {b.bookingStatus}
                  </span>
                </div>

                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {pluralize(b.nights, 'night')} ·{' '}
                  {pluralize(b.guests, 'guest')}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-bold">{formatCurrency(b.totalAmount)}</span>{' '}
                  <span className="text-ink-500">· {b.paymentMethod} · {b.paymentStatus}</span>
                </p>

                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  {b.paymentStatus === 'Pending' && b.bookingStatus !== 'Cancelled' && b.paymentMethod === 'Online' && (
                    <Link to={`/checkout/${b._id}`} className="btn-primary px-4 py-2 text-sm">
                      <CreditCard size={15} /> Pay now
                    </Link>
                  )}
                  {['Pending', 'Confirmed'].includes(b.bookingStatus) && (
                    <button
                      onClick={() => cancel(b._id)}
                      disabled={busyId === b._id}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      {busyId === b._id ? <Spinner size={15} /> : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
