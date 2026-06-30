import mongoose from 'mongoose';
import Property from './Property.js';

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      maxlength: [2000, 'Review is too long'],
    },
  },
  { timestamps: true }
);

// A guest may review a given property only once.
reviewSchema.index({ property: 1, author: 1 }, { unique: true });

/**
 * Recompute and persist the property's average rating and review count.
 * Called after a review is created or removed so the listing stays in sync.
 */
reviewSchema.statics.recalcPropertyRating = async function recalc(propertyId) {
  const stats = await this.aggregate([
    { $match: { property: new mongoose.Types.ObjectId(propertyId) } },
    {
      $group: {
        _id: '$property',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const { avgRating = 0, count = 0 } = stats[0] || {};
  await Property.findByIdAndUpdate(propertyId, {
    rating: Math.round(avgRating * 10) / 10, // one decimal place
    reviewsCount: count,
  });
};

reviewSchema.post('save', function afterSave() {
  this.constructor.recalcPropertyRating(this.property);
});

reviewSchema.post('findOneAndDelete', function afterDelete(doc) {
  if (doc) doc.constructor.recalcPropertyRating(doc.property);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
