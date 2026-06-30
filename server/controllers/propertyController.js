import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import sendResponse from '../utils/ApiResponse.js';

/**
 * Build a Mongoose filter object from query string parameters.
 * Supported: location (text), type, minPrice, maxPrice, bedrooms, bathrooms,
 * guests, amenities (csv), instantBook, superhost.
 */
const buildFilter = (query) => {
  const filter = { isActive: true };

  if (query.type) filter.propertyType = query.type;

  if (query.location) {
    const rx = new RegExp(query.location.trim(), 'i');
    filter.$or = [
      { 'location.city': rx },
      { 'location.state': rx },
      { 'location.country': rx },
      { title: rx },
    ];
  }

  if (query.minPrice || query.maxPrice) {
    filter.pricePerNight = {};
    if (query.minPrice) filter.pricePerNight.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.pricePerNight.$lte = Number(query.maxPrice);
  }

  if (query.bedrooms) filter.bedrooms = { $gte: Number(query.bedrooms) };
  if (query.bathrooms) filter.bathrooms = { $gte: Number(query.bathrooms) };
  if (query.guests) filter.maxGuests = { $gte: Number(query.guests) };
  if (query.instantBook === 'true') filter.instantBook = true;
  if (query.superhost === 'true') filter.isSuperhost = true;

  if (query.amenities) {
    const list = query.amenities.split(',').map((a) => a.trim()).filter(Boolean);
    if (list.length) filter.amenities = { $all: list };
  }

  return filter;
};

const SORT_MAP = {
  price_asc: { pricePerNight: 1 },
  price_desc: { pricePerNight: -1 },
  rating: { rating: -1, reviewsCount: -1 },
  newest: { createdAt: -1 },
};

/**
 * @route   GET /api/properties
 * @access  Public
 * @desc    Paginated, filterable list of active listings.
 */
export const getProperties = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const filter = buildFilter(req.query);
  const sort = SORT_MAP[req.query.sort] || { createdAt: -1 };

  const [items, total] = await Promise.all([
    Property.find(filter)
      .populate('host', 'name avatar isSuperhost')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Property.countDocuments(filter),
  ]);

  return sendResponse(res, 200, 'Properties fetched', {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + items.length < total,
  });
});

/**
 * @route   GET /api/properties/:id
 * @access  Public
 */
export const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    'host',
    'name avatar bio isSuperhost createdAt'
  );
  if (!property) throw new ApiError(404, 'Property not found');

  // Booked date ranges so the client can disable them in the date picker.
  const bookings = await Booking.find({
    property: property._id,
    bookingStatus: { $in: ['Pending', 'Confirmed'] },
    checkOut: { $gte: new Date() },
  })
    .select('checkIn checkOut -_id')
    .lean();

  return sendResponse(res, 200, 'Property fetched', {
    property,
    bookedRanges: bookings,
  });
});

/**
 * @route   POST /api/properties
 * @access  Private (host)
 */
export const createProperty = asyncHandler(async (req, res) => {
  const payload = { ...req.body, host: req.user._id };
  // A host that lists is implicitly flagged as superhost-eligible later;
  // mirror the user's superhost flag onto the listing for display.
  payload.isSuperhost = Boolean(req.user.isSuperhost);

  const property = await Property.create(payload);
  return sendResponse(res, 201, 'Listing created', { property });
});

/**
 * Ensures the requesting user owns the property (or is admin).
 */
const assertOwnership = (property, user) => {
  if (!property) throw new ApiError(404, 'Property not found');
  const isOwner = property.host.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw new ApiError(403, 'You can only manage your own listings');
  }
};

/**
 * @route   PUT /api/properties/:id
 * @access  Private (host owner)
 */
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  assertOwnership(property, req.user);

  // Prevent reassigning ownership through the body.
  delete req.body.host;
  Object.assign(property, req.body);
  await property.save();

  return sendResponse(res, 200, 'Listing updated', { property });
});

/**
 * @route   DELETE /api/properties/:id
 * @access  Private (host owner) — soft delete to preserve booking history.
 */
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  assertOwnership(property, req.user);

  property.isActive = false;
  await property.save();

  return sendResponse(res, 200, 'Listing removed');
});

/**
 * @route   GET /api/properties/host/me
 * @access  Private (host) — listings owned by the current user.
 */
export const getMyListings = asyncHandler(async (req, res) => {
  const items = await Property.find({ host: req.user._id, isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  return sendResponse(res, 200, 'Your listings', { items });
});

/**
 * @route   GET /api/properties/stats/prices
 * @access  Public
 * @desc    Price distribution (min, max, and a histogram of buckets) used to
 *          render the price-range slider + histogram in the filter UI.
 */
export const getPriceStats = asyncHandler(async (req, res) => {
  const docs = await Property.find({ isActive: true }).select('pricePerNight -_id').lean();
  const prices = docs.map((d) => d.pricePerNight).sort((a, b) => a - b);

  if (prices.length === 0) {
    return sendResponse(res, 200, 'Price stats', { min: 0, max: 0, count: 0, buckets: [] });
  }

  const min = prices[0];
  const max = prices[prices.length - 1];
  const BUCKETS = 24;
  const size = Math.max(1, (max - min) / BUCKETS);

  const buckets = Array.from({ length: BUCKETS }, (_, i) => ({
    from: Math.round(min + i * size),
    to: Math.round(min + (i + 1) * size),
    count: 0,
  }));

  prices.forEach((p) => {
    let idx = Math.floor((p - min) / size);
    if (idx >= BUCKETS) idx = BUCKETS - 1;
    if (idx < 0) idx = 0;
    buckets[idx].count += 1;
  });

  return sendResponse(res, 200, 'Price stats', { min, max, count: prices.length, buckets });
});
