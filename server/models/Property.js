import mongoose from 'mongoose';

export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Villa',
  'Cabin',
  'Cottage',
  'Loft',
  'Beachfront',
  'Treehouse',
];

export const AMENITIES = [
  'WiFi',
  'Pool',
  'Parking',
  'AC',
  'Kitchen',
  'Pet-friendly',
  'Washer',
  'TV',
  'Hot tub',
  'Gym',
  'Workspace',
  'Fireplace',
  'BBQ grill',
  'Beach access',
];

const locationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [4000, 'Description is too long'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: true,
      index: true,
    },
    location: { type: locationSchema, required: true },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    cleaningFee: { type: Number, default: 0, min: 0 },
    serviceFeeRate: { type: Number, default: 0.12, min: 0, max: 1 }, // 12% of subtotal
    taxRate: { type: Number, default: 0.08, min: 0, max: 1 }, // 8% tax
    images: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: 'At least one image is required',
      },
    },
    amenities: [{ type: String, enum: AMENITIES }],
    bedrooms: { type: Number, default: 1, min: 0 },
    beds: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    maxGuests: { type: Number, default: 2, min: 1 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    isSuperhost: { type: Boolean, default: false },
    instantBook: { type: Boolean, default: false },
    // Optional explicit availability windows. Empty = available unless booked.
    availability: [
      {
        startDate: Date,
        endDate: Date,
        _id: false,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index powers keyword search across title, description and city.
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.country': 'text',
});

// Compound index for the common filter+sort path.
propertySchema.index({ propertyType: 1, pricePerNight: 1 });

const Property = mongoose.model('Property', propertySchema);
export default Property;
