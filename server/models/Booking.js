import mongoose from 'mongoose';

export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
export const PAYMENT_METHODS = ['Online', 'Pay at Property'];
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Refunded', 'Failed'];

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true, min: 1 },

    // Price breakdown — captured at booking time so historical bookings are
    // unaffected by later price changes on the listing.
    nightlyRate: { type: Number, required: true },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'Pay at Property',
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'Pending',
    },
    paymentIntentId: { type: String }, // Stripe PaymentIntent reference

    bookingStatus: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'Pending',
      index: true,
    },

    // Set to true once the guest has reviewed this completed stay.
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Speeds up the overlap query used to prevent double-booking.
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });

/**
 * Static helper: returns true if the given date range overlaps an existing
 * active (Pending/Confirmed) booking for the property.
 */
bookingSchema.statics.hasConflict = async function hasConflict(
  propertyId,
  checkIn,
  checkOut,
  excludeBookingId = null
) {
  const query = {
    property: propertyId,
    bookingStatus: { $in: ['Pending', 'Confirmed'] },
    // Standard overlap test: existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const conflict = await this.findOne(query).lean();
  return Boolean(conflict);
};

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
