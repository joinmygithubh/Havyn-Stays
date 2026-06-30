import api from './axiosInstance.js';

/**
 * Thin, typed-ish service layer. Components call these named functions instead
 * of touching axios directly, so endpoints live in exactly one place.
 * Each function resolves to the `data` portion of the API envelope.
 */

/* ───────────── Auth ───────────── */
export const authService = {
  signup: (body) => api.post('/auth/signup', body).then((r) => r.data),
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (body) => api.put('/auth/me', body).then((r) => r.data),
  becomeHost: () => api.post('/auth/become-host').then((r) => r.data),
  getWishlist: () => api.get('/auth/wishlist').then((r) => r.data),
  toggleWishlist: (propertyId) =>
    api.post(`/auth/wishlist/${propertyId}`).then((r) => r.data),
};

/* ───────────── Properties ───────────── */
export const propertyService = {
  list: (params) => api.get('/properties', { params }).then((r) => r.data),
  get: (id) => api.get(`/properties/${id}`).then((r) => r.data),
  create: (body) => api.post('/properties', body).then((r) => r.data),
  update: (id, body) => api.put(`/properties/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/properties/${id}`).then((r) => r.data),
  myListings: () => api.get('/properties/host/me').then((r) => r.data),
  priceStats: () => api.get('/properties/stats/prices').then((r) => r.data),
};

/* ───────────── Bookings ───────────── */
export const bookingService = {
  create: (body) => api.post('/bookings', body).then((r) => r.data),
  myBookings: (status) =>
    api.get('/bookings/me', { params: status ? { status } : {} }).then((r) => r.data),
  hostBookings: () => api.get('/bookings/host/me').then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`).then((r) => r.data),
  updateStatus: (id, status) =>
    api.put(`/bookings/${id}/status`, { status }).then((r) => r.data),
  checkAvailability: (propertyId, checkIn, checkOut) =>
    api
      .get(`/bookings/availability/${propertyId}`, { params: { checkIn, checkOut } })
      .then((r) => r.data),
};

/* ───────────── Reviews ───────────── */
export const reviewService = {
  forProperty: (propertyId) => api.get(`/reviews/${propertyId}`).then((r) => r.data),
  create: (body) => api.post('/reviews', body).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};

/* ───────────── Payments ───────────── */
export const paymentService = {
  config: () => api.get('/payments/config').then((r) => r.data),
  create: (bookingId) => api.post('/payments/create', { bookingId }).then((r) => r.data),
  verify: (bookingId, paymentIntentId) =>
    api.post('/payments/verify', { bookingId, paymentIntentId }).then((r) => r.data),
};
