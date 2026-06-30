/**
 * Pure pricing calculator shared by the booking and payment controllers so
 * the client and server always agree on the breakdown. The client computes
 * the same numbers for display, but the server value is authoritative.
 */
export const nightsBetween = (checkIn, checkOut) => {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
};

/**
 * @param {object} property  Mongoose property (needs pricePerNight, fees, rates)
 * @param {Date|string} checkIn
 * @param {Date|string} checkOut
 * @returns {{ nights, nightlyRate, subtotal, cleaningFee, serviceFee, taxes, totalAmount }}
 */
export const calculatePricing = (property, checkIn, checkOut) => {
  const nights = nightsBetween(checkIn, checkOut);
  const nightlyRate = property.pricePerNight;
  const subtotal = nightlyRate * nights;
  const cleaningFee = property.cleaningFee || 0;
  const serviceFee = Math.round(subtotal * (property.serviceFeeRate ?? 0.12));
  const taxes = Math.round((subtotal + cleaningFee) * (property.taxRate ?? 0.08));
  const totalAmount = subtotal + cleaningFee + serviceFee + taxes;

  return { nights, nightlyRate, subtotal, cleaningFee, serviceFee, taxes, totalAmount };
};
