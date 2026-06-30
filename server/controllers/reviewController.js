import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import sendResponse from '../utils/ApiResponse.js';

/**
 * @route   POST /api/reviews
 * @access  Private
 * @desc    Leave a review for a property the user has actually stayed at.
 */
export const createReview = asyncHandler(async (req, res) => {
  const { propertyId, rating, comment, bookingId } = req.body;

  // Guests may only review properties they have a completed booking for.
  const completed = await Booking.findOne({
    guest: req.user._id,
    property: propertyId,
    bookingStatus: 'Completed',
    ...(bookingId ? { _id: bookingId } : {}),
  });
  if (!completed) {
    throw new ApiError(403, 'You can only review a stay you have completed');
  }

  const already = await Review.findOne({ property: propertyId, author: req.user._id });
  if (already) {
    throw new ApiError(409, 'You have already reviewed this property');
  }

  const review = await Review.create({
    property: propertyId,
    author: req.user._id,
    booking: completed._id,
    rating,
    comment,
  });

  completed.isReviewed = true;
  await completed.save();

  await review.populate('author', 'name avatar');
  return sendResponse(res, 201, 'Review submitted', { review });
});

/**
 * @route   GET /api/reviews/:propertyId
 * @access  Public — list reviews + a rating-distribution breakdown.
 */
export const getPropertyReviews = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const reviews = await Review.find({ property: propertyId })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();

  // Build a 1–5 star distribution for the ratings breakdown UI.
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
  });
  const average =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  return sendResponse(res, 200, 'Reviews fetched', {
    reviews,
    count: reviews.length,
    average,
    breakdown,
  });
});

/**
 * @route   DELETE /api/reviews/:id
 * @access  Private (review author)
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own review');
  }

  // findOneAndDelete triggers the post-hook that recalculates the rating.
  await Review.findOneAndDelete({ _id: review._id });
  return sendResponse(res, 200, 'Review deleted');
});
