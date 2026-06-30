import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Home,
  CalendarCheck,
  DollarSign,
  Pencil,
  Trash2,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

import FadeImage from '../components/ui/FadeImage.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { propertyService, bookingService } from '../api/services.js';
import { formatCurrency, formatDate, pluralize } from '../utils/format.js';
import { STATUS_STYLES } from '../utils/constants.js';

/**
 * Host dashboard: earnings + counts summary, a "Listings" tab (CRUD) and a
 * "Reservations" tab where the host can confirm / complete / decline bookings.
 */
export default function HostDashboard() {
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [l, b] = await Promise.all([propertyService.myListings(), bookingService.hostBookings()]);
      setListings(l.items);
      setBookings(b.items);
      setEarnings(b.earnings);
    } catch (err) {
      toast.error(err.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await propertyService.remove(id);
      toast.success('Listing removed');
      setListings((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.message || 'Could not delete');
    } finally {
      setBusyId(null);
    }
  };

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await bookingService.updateStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not update booking');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = bookings.filter((b) => b.bookingStatus === 'Pending').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Host dashboard</h1>
          <p className="text-ink-500">Manage your listings, reservations and earnings.</p>
        </div>
        <Link to="/host/listings/new" className="btn-primary">
          <Plus size={18} /> Add listing
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={DollarSign} label="Total earnings" value={formatCurrency(earnings)} accent />
        <Stat icon={Home} label="Active listings" value={listings.length} />
        <Stat icon={CalendarCheck} label="Pending requests" value={pendingCount} />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-ink-100 dark:border-ink-700">
        {[
          ['listings', 'My listings'],
          ['reservations', 'Reservations'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === key ? 'border-coral-500 text-coral-600' : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-coral-500">
          <Spinner size={30} />
        </div>
      ) : tab === 'listings' ? (
        <ListingsTab listings={listings} busyId={busyId} onRemove={remove} />
      ) : (
        <ReservationsTab bookings={bookings} busyId={busyId} onSetStatus={setStatus} />
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 shadow-card ${accent ? 'border-coral-200 bg-coral-50 dark:border-ink-700 dark:bg-ink-800' : 'border-ink-100 bg-white dark:border-ink-700 dark:bg-ink-800'}`}>
      <span className={`flex h-12 w-12 items-center justify-center rounded-full ${accent ? 'bg-coral-500 text-white' : 'bg-ink-100 text-ink-600 dark:bg-ink-700'}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="text-sm text-ink-500">{label}</p>
        <p className="text-2xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function ListingsTab({ listings, busyId, onRemove }) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Home}
        title="No listings yet"
        message="Create your first listing to start welcoming guests."
        action={
          <Link to="/host/listings/new" className="btn-primary">
            <Plus size={18} /> Add listing
          </Link>
        }
      />
    );
  }
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((p) => (
        <div key={p._id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card dark:border-ink-700 dark:bg-ink-800">
          <Link to={`/property/${p._id}`}>
            <FadeImage src={p.images?.[0]} alt={p.title} />
          </Link>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 font-bold">{p.title}</h3>
              {p.reviewsCount > 0 && (
                <span className="flex shrink-0 items-center gap-1 text-sm">
                  <Star size={13} className="fill-coral-500 text-coral-500" />
                  {p.rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-sm text-ink-500">
              {formatCurrency(p.pricePerNight)} / night · {pluralize(p.bedrooms, 'bd')}
            </p>
            <div className="mt-3 flex gap-2">
              <Link to={`/host/listings/${p._id}/edit`} className="btn-secondary flex-1 px-3 py-2 text-sm">
                <Pencil size={14} /> Edit
              </Link>
              <button
                onClick={() => onRemove(p._id)}
                disabled={busyId === p._id}
                className="flex items-center justify-center rounded-xl border border-ink-200 px-3 py-2 text-coral-600 transition hover:bg-coral-50 dark:border-ink-700"
              >
                {busyId === p._id ? <Spinner size={15} /> : <Trash2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReservationsTab({ bookings, busyId, onSetStatus }) {
  if (bookings.length === 0) {
    return <EmptyState icon={CalendarCheck} title="No reservations yet" message="Booking requests for your listings will appear here." />;
  }
  return (
    <div className="mt-6 space-y-3">
      {bookings.map((b) => (
        <div
          key={b._id}
          className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-card dark:border-ink-700 dark:bg-ink-800 sm:flex-row sm:items-center"
        >
          <FadeImage src={b.property?.images?.[0]} alt={b.property?.title} ratio="aspect-[4/3]" className="w-full rounded-xl sm:w-32 sm:shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold">{b.property?.title}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.bookingStatus]}`}>
                {b.bookingStatus}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-500">
              <img src={b.guest?.avatar} alt={b.guest?.name} className="h-5 w-5 rounded-full object-cover" />
              {b.guest?.name} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
            </p>
            <p className="mt-0.5 text-sm">
              <span className="font-bold">{formatCurrency(b.totalAmount)}</span>{' '}
              <span className="text-ink-500">· {b.paymentMethod} · {b.paymentStatus}</span>
            </p>
          </div>

          {b.bookingStatus === 'Pending' && (
            <div className="flex gap-2">
              <button onClick={() => onSetStatus(b._id, 'Confirmed')} disabled={busyId === b._id} className="btn-primary px-4 py-2 text-sm">
                {busyId === b._id ? <Spinner size={15} /> : 'Confirm'}
              </button>
              <button onClick={() => onSetStatus(b._id, 'Cancelled')} disabled={busyId === b._id} className="btn-secondary px-4 py-2 text-sm">
                Decline
              </button>
            </div>
          )}
          {b.bookingStatus === 'Confirmed' && (
            <button onClick={() => onSetStatus(b._id, 'Completed')} disabled={busyId === b._id} className="btn-secondary px-4 py-2 text-sm">
              {busyId === b._id ? <Spinner size={15} /> : 'Mark completed'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
