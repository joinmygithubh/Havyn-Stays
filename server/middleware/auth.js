import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from './asyncHandler.js';

/**
 * Extract a JWT from either the Authorization header (Bearer <token>)
 * or an httpOnly cookie named `token`.
 */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
};

/**
 * `protect` — guards routes that require an authenticated user.
 * Attaches the resolved user document to `req.user`.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new ApiError(401, 'Not authorized — no token provided');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    throw new ApiError(401, 'The user belonging to this token no longer exists');
  }

  req.user = user;
  next();
});

/**
 * `restrictTo('host', 'admin')` — role-based authorization. Must run after
 * `protect`. A user gains the `host` capability once `isHost` is true.
 */
export const restrictTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const userRoles = [req.user.role];
    if (req.user.isHost) userRoles.push('host');

    const allowed = roles.some((r) => userRoles.includes(r));
    if (!allowed) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  });

/**
 * `optionalAuth` — populates req.user if a valid token is present but does
 * not reject the request when it is absent. Useful for endpoints whose
 * response is enriched for logged-in users (e.g. wishlist flags).
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    // Ignore invalid tokens for optional auth.
  }
  next();
});
