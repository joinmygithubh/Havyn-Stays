/**
 * Wraps an async route handler so any rejected promise is forwarded to
 * Express' error-handling middleware instead of crashing the process.
 * This removes the need for repetitive try/catch in every controller.
 *
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
