/**
 * Operational error with an attached HTTP status code.
 * Throw `new ApiError(404, 'Property not found')` anywhere in the
 * request lifecycle and the central error handler will format the response.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // optional array of field-level validation errors
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
