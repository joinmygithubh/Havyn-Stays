/**
 * Consistent success response shape across the whole API:
 *   { success: true, message, data }
 *
 * Usage:
 *   return sendResponse(res, 200, 'Properties fetched', { items, total });
 */
export const sendResponse = (res, statusCode = 200, message = 'OK', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export default sendResponse;
