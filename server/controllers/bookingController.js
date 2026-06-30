import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import sendResponse from '../utils/ApiResponse.js';
import { calculatePricing, nightsBetween } from '../utils/pricing.js';

/**
 * @route   POST /api/bookings
 * @access  Private
 * @desc    Create a reservation. Validates date range, guest count and
 *          double-booking before persisting. Pricing is computed server-side.
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { propertyId, checkIn, checkOut, guests, paymentMethod } = req.body;

  const property = await Property.findById(propertyId);
  if (!property || !property.isActive) {
    throw new ApiError(404, 'Property not found');
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    throw new ApiError(400, 'Invalid check-in or check-out date');
  }
  if (inDate < today) throw new ApiError(400, 'Check-in date cannot be in the past');
  if (outDate <= inDate) throw new ApiError(400, 'Check-out must be after check-in');
  if (guests < 1 || guests > property.maxGuests) {
    throw new ApiError(400, `This place allows between 1 and ${property.maxGuests} guests`);
  }
  if (property.host.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot book your own listing');
  }

  // Server-side double-booking guard.
  const conflict = await Booking.hasConflict(property._id, inDate, outDate);
  if (conflict) {
    throw new ApiError(409, 'Those dates are no longer available for this property');
  }

  const pricing = calculatePricing(property, inDate, outDate);
  if (pricing.nights < 1) throw new ApiError(400, 'Stay must be at least one night');

  // Instant-book listings are confirmed immediately; otherwise pending host approval.
  const bookingStatus = property.instantBook ? 'Confirmed' : 'Pending';

  const booking = await Booking.create({
    property: property._id,
    guest: req.user._id,
    host: property.host,
    checkIn: inDate,
    checkOut: outDate,
    guests,
    nights: pricing.nights,
    nightlyRate: pricing.nightlyRate,
    cleaningFee: pricing.cleaningFee,
    serviceFee: pricing.serviceFee,
    taxes: pricing.taxes,
    totalAmount: pricing.totalAmount,
    paymentMethod: paymentMethod === 'Online' ? 'Online' : 'Pay at Property',
    paymentStatus: 'Pending',
    bookingStatus,
  });

  await booking.populate('property', 'title images location');
  return sendResponse(res, 201, 'Booking created', { booking });
});

/**
 * @route   GET /api/bookings/me
 * @access  Private — current user's trips (as a guest).
 *          Optional ?status=upcoming|past to split trips.
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const query = { guest: req.user._id };
  const now = new Date();

  if (req.query.status === 'upcoming') {
    query.checkOut = { $gte: now };
    query.bookingStatus = { $ne: 'Cancelled' };
  } else if (req.query.status === 'past') {
    query.$or = [{ checkOut: { $lt: now } }, { bookingStatus: 'Cancelled' }];
  }

  const items = await Booking.find(query)
    .populate('property', 'title images location pricePerNight')
    .sort({ checkIn: -1 })
    .lean();

  return sendResponse(res, 200, 'Your bookings', { items });
});

/**
 * @route   GET /api/bookings/host/me
 * @access  Private (host) — incoming booking requests for the host's listings.
 */
export const getHostBookings = asyncHandler(async (req, res) => {
  const items = await Booking.find({ host: req.user._id })
    .populate('property', 'title images location')
    .populate('guest', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();

  // Aggregate earnings from paid / confirmed-completed bookings.
  const earnings = items
    .filter((b) => ['Confirmed', 'Completed'].includes(b.bookingStatus))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return sendResponse(res, 200, 'Host bookings', { items, earnings });
});

/**
 * @route   GET /api/bookings/:id
 * @access  Private (guest or host on the booking)
 */
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('property')
    .populate('guest', 'name avatar email')
    .populate('host', 'name avatar');
  if (!booking) throw new ApiError(404, 'Booking not found');

  const uid = req.user._id.toString();
  if (booking.guest._id.toString() !== uid && booking.host._id.toString() !== uid) {
    throw new ApiError(403, 'Not authorized to view this booking');
  }

  return sendResponse(res, 200, 'Booking', { booking });
});

/**
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (guest who owns the booking)
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (booking.guest.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only cancel your own bookings');
  }
  if (['Cancelled', 'Completed'].includes(booking.bookingStatus)) {
    throw new ApiError(400, `Booking is already ${booking.bookingStatus.toLowerCase()}`);
  }

  booking.bookingStatus = 'Cancelled';
  if (booking.paymentStatus === 'Paid') booking.paymentStatus = 'Refunded';
  await booking.save();

  return sendResponse(res, 200, 'Booking cancelled', { booking });
});

/**
 * @route   PUT /api/bookings/:id/status
 * @access  Private (host) — confirm / complete a booking on a host's listing.
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['Confirmed', 'Cancelled', 'Completed'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.host.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the host can update this booking');
  }

  booking.bookingStatus = status;
  await booking.save();
  return sendResponse(res, 200, `Booking marked as ${status}`, { booking });
});

/**
 * @route   GET /api/bookings/availability/:propertyId
 * @access  Public — quick availability check for a date range.
 */
export const checkAvailability = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    throw new ApiError(400, 'checkIn and checkOut query params are required');
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) throw new ApiError(400, 'Invalid date range');

  const conflict = await Booking.hasConflict(
    req.params.propertyId,
    new Date(checkIn),
    new Date(checkOut)
  );
  return sendResponse(res, 200, 'Availability checked', { available: !conflict, nights });
});
