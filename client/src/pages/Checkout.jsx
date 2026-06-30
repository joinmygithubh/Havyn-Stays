import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Home, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

import FadeImage from '../components/ui/FadeImage.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { bookingService, paymentService } from '../api/services.js';
import { formatCurrency, formatDate, pluralize } from '../utils/format.js';

/**
 * Checkout / payment page. Shows the booking summary + price breakdown and lets
 * the guest choose "Pay online" (mock/Stripe test) or "Pay at property".
 * On success it confirms the booking and shows a confirmation state.
 */
export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('Online');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { booking: b } = await bookingService.get(bookingId);
        setBooking(b);
        setMethod(b.paymentMethod === 'Online' ? 'Online' : 'Online');
        if (b.paymentStatus === 'Paid') setDone(true);
      } catch (err) {
        toast.error(err.message || 'Booking not found');
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId, navigate]);

  const pay = async () => {
    setProcessing(true);
    try {
      if (method === 'Online') {
        // 1) Create a (mock or Stripe) payment intent for the booking.
        const { paymentIntentId } = await paymentService.create(bookingId);
        // 2) In mock mode we immediately verify with the same secret. With a
        //    real Stripe integration, card details would be collected here via
        //    Stripe Elements before calling verify.
        const { booking: updated } = await paymentService.verify(bookingId, paymentIntentId);
        setBooking(updated);
        toast.success('Payment successful!');
      } else {
        // Pay at property: confirm the reservation without charging now.
        const { booking: updated } = await bookingService.get(bookingId);
        setBooking(updated);
        toast.success('Reservation confirmed — pay at the property');
      }
      setDone(true);
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-coral-500">
        <Spinner size={36} />
      </div>
    );
  }
  if (!booking) return null;

  const p = booking.property;

  // ── Confirmation state ──
  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 size={72} className="mx-auto text-emerald-500" />
        </motion.div>
        <h1 className="mt-5 text-3xl font-extrabold">You’re all set!</h1>
        <p className="mt-2 text-ink-500">
          Your stay at <span className="font-semibold text-ink-800 dark:text-ink-100">{p?.title}</span> is{' '}
          {booking.bookingStatus.toLowerCase()}.
        </p>
        <div className="card mt-6 p-6 text-left">
          <Summary booking={booking} />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/trips" className="btn-primary">View my trips</Link>
          <Link to="/" className="btn-secondary">Keep exploring</Link>
        </div>
      </div>
    );
  }

  // ── Payment selection state ──
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Confirm and pay</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Payment options */}
        <div>
          <h2 className="text-lg font-bold">Choose how to pay</h2>
          <div className="mt-4 space-y-3">
            <PayOption
              active={method === 'Online'}
              onClick={() => setMethod('Online')}
              icon={CreditCard}
              title="Pay online now"
              subtitle="Secure card payment (test mode)"
            />
            <PayOption
              active={method === 'Pay at Property'}
              onClick={() => setMethod('Pay at Property')}
              icon={Home}
              title="Pay at the property"
              subtitle="Reserve now, pay on arrival"
            />
          </div>

          {method === 'Online' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 dark:border-ink-700 dark:bg-ink-900"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-ink-600 dark:text-ink-300">
                <ShieldCheck size={16} className="text-emerald-500" />
                This demo uses a test payment gateway — no real card is charged.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input className="input col-span-2" placeholder="Card number (4242 4242 4242 4242)" defaultValue="4242 4242 4242 4242" />
                <input className="input" placeholder="MM / YY" defaultValue="12 / 34" />
                <input className="input" placeholder="CVC" defaultValue="123" />
              </div>
            </motion.div>
          )}

          <button onClick={pay} disabled={processing} className="btn-primary mt-6 w-full">
            {processing ? (
              <Spinner size={18} />
            ) : (
              <>
                <Lock size={16} />
                {method === 'Online' ? `Pay ${formatCurrency(booking.totalAmount)}` : 'Confirm reservation'}
              </>
            )}
          </button>
        </div>

        {/* Summary */}
        <div className="lg:order-last">
          <div className="card overflow-hidden p-5">
            <div className="flex gap-4">
              <FadeImage src={p?.images?.[0]} alt={p?.title} ratio="aspect-square" className="w-24 shrink-0 rounded-xl" />
              <div>
                <p className="font-bold">{p?.title}</p>
                <p className="text-sm text-ink-500">
                  {[p?.location?.city, p?.location?.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-ink-100 pt-4 dark:border-ink-700">
              <Summary booking={booking} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayOption({ active, onClick, icon: Icon, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        active ? 'border-coral-500 bg-coral-50 dark:bg-ink-800' : 'border-ink-200 hover:border-ink-400 dark:border-ink-700'
      }`}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${active ? 'bg-coral-500 text-white' : 'bg-ink-100 text-ink-600 dark:bg-ink-700'}`}>
        <Icon size={20} />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-ink-500">{subtitle}</span>
      </span>
    </button>
  );
}

function Summary({ booking }) {
  const Row = ({ label, value, bold }) => (
    <div className={`flex items-center justify-between py-1 ${bold ? 'font-bold' : 'text-ink-600 dark:text-ink-300'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
  return (
    <div className="text-sm">
      <p className="mb-3 text-ink-600 dark:text-ink-300">
        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {pluralize(booking.nights, 'night')} ·{' '}
        {pluralize(booking.guests, 'guest')}
      </p>
      <Row label={`${formatCurrency(booking.nightlyRate)} × ${pluralize(booking.nights, 'night')}`} value={formatCurrency(booking.nightlyRate * booking.nights)} />
      <Row label="Cleaning fee" value={formatCurrency(booking.cleaningFee)} />
      <Row label="Service fee" value={formatCurrency(booking.serviceFee)} />
      <Row label="Taxes" value={formatCurrency(booking.taxes)} />
      <div className="mt-2 border-t border-ink-100 pt-2 dark:border-ink-700">
        <Row label="Total (USD)" value={formatCurrency(booking.totalAmount)} bold />
      </div>
    </div>
  );
}
