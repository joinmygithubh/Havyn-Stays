import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import sendResponse from '../utils/ApiResponse.js';

/**
 * Lazily build a Stripe client only if a key is configured. When no key is
 * present (e.g. local demo) the controller falls back to a mock gateway so
 * the full flow still works end-to-end without external credentials.
 */
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  // Use the mock gateway unless a real-looking Stripe secret key is provided.
  // Real keys start with "sk_"; anything blank or a placeholder => mock.
  if (!key || !key.startsWith('sk_') || /x{4,}|your_|here|placeholder/i.test(key)) {
    return null;
  }
  return new Stripe(key);
};

/**
 * @route   POST /api/payments/create
 * @access  Private
 * @desc    Create a Stripe PaymentIntent (or a mock secret) for a booking.
 */
export const createPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.guest.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to pay for this booking');
  }
  if (booking.paymentStatus === 'Paid') {
    throw new ApiError(400, 'This booking is already paid');
  }

  const stripe = getStripe();

  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // smallest currency unit
      currency: 'usd',
      metadata: { bookingId: booking._id.toString(), guest: req.user._id.toString() },
      automatic_payment_methods: { enabled: true },
    });

    booking.paymentIntentId = intent.id;
    await booking.save();

    return sendResponse(res, 201, 'Payment intent created', {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      provider: 'stripe',
      amount: booking.totalAmount,
    });
  }

  // ── Mock gateway (no Stripe key configured) ──
  const mockSecret = `mock_secret_${booking._id}_${Date.now()}`;
  booking.paymentIntentId = mockSecret;
  await booking.save();

  return sendResponse(res, 201, 'Mock payment intent created', {
    clientSecret: mockSecret,
    paymentIntentId: mockSecret,
    provider: 'mock',
    amount: booking.totalAmount,
  });
});

/**
 * @route   POST /api/payments/verify
 * @access  Private
 * @desc    Confirm a payment and flip the booking to Paid / Confirmed.
 *          With Stripe, verifies the PaymentIntent status; with the mock
 *          gateway, trusts the matching secret.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentIntentId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.guest.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const stripe = getStripe();
  let paid = false;

  if (stripe && paymentIntentId && !paymentIntentId.startsWith('mock_secret')) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    paid = intent.status === 'succeeded';
    if (!paid) {
      throw new ApiError(402, `Payment not completed (status: ${intent.status})`);
    }
  } else {
    // Mock gateway: accept if the secret matches the one we issued.
    paid = booking.paymentIntentId === paymentIntentId;
    if (!paid) throw new ApiError(402, 'Payment verification failed');
  }

  booking.paymentStatus = 'Paid';
  // A successful online payment confirms the reservation.
  if (booking.bookingStatus === 'Pending') booking.bookingStatus = 'Confirmed';
  await booking.save();

  return sendResponse(res, 200, 'Payment confirmed', { booking });
});

/**
 * @route   GET /api/payments/config
 * @access  Public — expose the publishable key (or mock flag) to the client.
 */
export const getPaymentConfig = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  return sendResponse(res, 200, 'Payment config', {
    provider: stripe ? 'stripe' : 'mock',
    publishableKey: stripe ? process.env.STRIPE_PUBLISHABLE_KEY : null,
  });
});
