import axios from 'axios';

/**
 * Single Axios instance used by the whole app. Centralising configuration here
 * (base URL, credentials, interceptors) keeps components free of HTTP plumbing.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send the httpOnly auth cookie
  timeout: 20000,
});

/**
 * Request interceptor — attach a bearer token from localStorage as a fallback
 * for environments where cross-site cookies are blocked.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('havyn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor — unwrap the consistent { success, data, message }
 * envelope and normalise errors into a single rejected object the UI can use.
 */
api.interceptors.response.use(
  (response) => response.data, // -> { success, message, data }
  (error) => {
    const payload = error.response?.data;
    const normalised = {
      status: error.response?.status,
      message: payload?.message || error.message || 'Something went wrong',
      errors: payload?.errors || [],
    };
    return Promise.reject(normalised);
  }
);

export default api;
