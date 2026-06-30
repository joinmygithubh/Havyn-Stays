import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import sendResponse from '../utils/ApiResponse.js';
import { signToken, cookieOptions } from '../utils/token.js';

/**
 * Issue a token, set it as an httpOnly cookie and return it in the body too
 * (so SPA clients that prefer Authorization headers can store it).
 */
const issueToken = (res, user, statusCode, message) => {
  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());
  return sendResponse(res, statusCode, message, { user, token });
};

/**
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(409, 'An account with that email already exists');
  }

  const user = await User.create({ name, email, password });
  return issueToken(res, user, 201, 'Account created successfully');
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select the password since it is excluded by default.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return issueToken(res, user, 200, 'Logged in successfully');
});

/**
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', cookieOptions());
  return sendResponse(res, 200, 'Logged out successfully');
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'title images pricePerNight location rating');
  return sendResponse(res, 200, 'Current user', { user });
});

/**
 * @route   PUT /api/auth/me
 * @access  Private — update profile fields.
 */
export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatar', 'phone', 'bio'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  return sendResponse(res, 200, 'Profile updated', { user });
});

/**
 * @route   POST /api/auth/become-host
 * @access  Private — opt into hosting.
 */
export const becomeHost = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { isHost: true },
    { new: true }
  );
  return sendResponse(res, 200, 'You are now a host', { user });
});


/**
 * @route   GET /api/auth/wishlist
 * @access  Private — full wishlist property documents.
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    match: { isActive: true },
    populate: { path: 'host', select: 'name avatar isSuperhost' },
  });
  return sendResponse(res, 200, 'Wishlist', { items: user.wishlist });
});

/**
 * @route   POST /api/auth/wishlist/:propertyId
 * @access  Private — toggle a property in the user's wishlist.
 */
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;
  const user = await User.findById(req.user._id);

  const idx = user.wishlist.findIndex((p) => p.toString() === propertyId);
  let saved;
  if (idx >= 0) {
    user.wishlist.splice(idx, 1);
    saved = false;
  } else {
    user.wishlist.push(propertyId);
    saved = true;
  }
  await user.save();

  return sendResponse(res, 200, saved ? 'Added to wishlist' : 'Removed from wishlist', {
    saved,
    wishlist: user.wishlist,
  });
});
