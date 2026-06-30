import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Collects the results of express-validator chains. If any validation failed,
 * it throws an ApiError(422) carrying the field-level error list so the
 * central error handler can format a consistent response.
 *
 * Usage:
 *   router.post('/', signupRules, validate, controller.signup);
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  throw new ApiError(422, 'Validation failed', errors);
};

export default validate;
