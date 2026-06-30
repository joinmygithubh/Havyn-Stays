import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Users } from 'lucide-react';
import { toDateInput } from '../../utils/format.js';

/**
 * Hero search form: location, check-in/check-out dates and guest count.
 * On submit it serialises the criteria into the URL query string and navigates
 * home, where <Home> reads the params and fetches matching listings.
 *
 * @param {function} onDone  optional callback (used to close a containing modal)
 */
export default function SearchBar({ onDone, variant = 'hero' }) {
  const navigate = useNavigate();
  const today = toDateInput(new Date());

  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 1) params.set('guests', String(guests));
    navigate(`/?${params.toString()}`);
    onDone?.();
  };

  const isModal = variant === 'modal';

  return (
    <form
      onSubmit={submit}
      className={
        isModal
          ? 'space-y-3'
          : 'mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-3xl bg-white p-2 shadow-card dark:bg-ink-800 md:flex-row md:items-center md:rounded-full md:p-1.5'
      }
    >
      {/* Location */}
      <label className={isModal ? 'block' : 'flex-1 md:px-3'}>
        <span className="mb-1 flex items-center gap-1.5 px-3 text-xs font-semibold text-ink-500 md:px-0">
          <MapPin size={14} /> Where
        </span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Search destinations"
          className={isModal ? 'input' : 'w-full bg-transparent px-3 text-sm outline-none placeholder:text-ink-400 md:px-0'}
        />
      </label>

      <div className={isModal ? 'grid grid-cols-2 gap-3' : 'flex flex-1 items-center'}>
        {/* Check-in */}
        <label className={isModal ? 'block' : 'flex-1 border-l border-ink-100 px-3 dark:border-ink-700'}>
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <CalendarDays size={14} /> Check in
          </span>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={isModal ? 'input' : 'w-full bg-transparent text-sm outline-none'}
          />
        </label>

        {/* Check-out */}
        <label className={isModal ? 'block' : 'flex-1 border-l border-ink-100 px-3 dark:border-ink-700'}>
          <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <CalendarDays size={14} /> Check out
          </span>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={isModal ? 'input' : 'w-full bg-transparent text-sm outline-none'}
          />
        </label>
      </div>

      {/* Guests */}
      <label className={isModal ? 'block' : 'flex items-center border-l border-ink-100 px-3 dark:border-ink-700'}>
        <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
          <Users size={14} /> Guests
        </span>
        <input
          type="number"
          min={1}
          max={16}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))}
          className={isModal ? 'input' : 'w-16 bg-transparent text-sm outline-none'}
        />
      </label>

      <button
        type="submit"
        className={
          isModal
            ? 'btn-primary w-full'
            : 'flex items-center justify-center gap-2 rounded-full bg-coral-500 px-5 py-3 font-semibold text-white transition hover:bg-coral-600 md:py-3.5'
        }
      >
        <Search size={18} />
        <span className={isModal ? '' : 'md:hidden lg:inline'}>Search</span>
      </button>
    </form>
  );
}
