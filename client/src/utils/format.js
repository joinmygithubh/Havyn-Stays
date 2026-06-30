import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

/** Format a number as a USD currency string (no cents for round amounts). */
export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

/** Safe date formatter that accepts Date objects or ISO strings. */
export const formatDate = (value, pattern = 'MMM d, yyyy') => {
  if (!value) return '';
  const d = typeof value === 'string' ? parseISO(value) : value;
  return isValid(d) ? format(d, pattern) : '';
};

/** Number of nights between two dates (>= 0). */
export const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const a = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const b = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;
  if (!isValid(a) || !isValid(b)) return 0;
  return Math.max(0, differenceInCalendarDays(b, a));
};

/** Convert a Date to a yyyy-MM-dd string for <input type="date"> and APIs. */
export const toDateInput = (date) => (date ? format(date, 'yyyy-MM-dd') : '');

/**
 * Client-side mirror of the server pricing formula so the booking widget can
 * show a live breakdown. The server value remains authoritative on submit.
 */
export const calcPricing = (property, checkIn, checkOut) => {
  const nights = nightsBetween(checkIn, checkOut);
  const nightlyRate = property?.pricePerNight || 0;
  const subtotal = nightlyRate * nights;
  const cleaningFee = property?.cleaningFee || 0;
  const serviceFee = Math.round(subtotal * (property?.serviceFeeRate ?? 0.12));
  const taxes = Math.round((subtotal + cleaningFee) * (property?.taxRate ?? 0.08));
  const total = subtotal + cleaningFee + serviceFee + taxes;
  return { nights, nightlyRate, subtotal, cleaningFee, serviceFee, taxes, total };
};

/** Pluralise a label, e.g. pluralize(1,'night') => '1 night'. */
export const pluralize = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
