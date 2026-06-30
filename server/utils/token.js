import jwt from 'jsonwebtoken';

/**
 * Sign a JWT carrying the user id.
 */
export const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Standard cookie options for the auth token. httpOnly prevents XSS access,
 * sameSite=lax mitigates CSRF, secure is enabled in production (HTTPS).
 */
export const cookieOptions = () => {
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  };
};
