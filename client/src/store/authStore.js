import { create } from 'zustand';
import { authService } from '../api/services.js';

/**
 * Global authentication state. Holds the current user and exposes async actions
 * that talk to the API and keep the token in localStorage (header fallback).
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true, // true until the initial /me check resolves
  initialized: false,

  /** Persist or clear the bearer token used by the axios interceptor. */
  setToken: (token) => {
    if (token) localStorage.setItem('havyn_token', token);
    else localStorage.removeItem('havyn_token');
  },

  /** Run once on app boot to restore a session from the cookie/token. */
  init: async () => {
    if (get().initialized) return;
    try {
      const { user } = await authService.me();
      set({ user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  login: async (credentials) => {
    const { user, token } = await authService.login(credentials);
    get().setToken(token);
    set({ user });
    return user;
  },

  signup: async (body) => {
    const { user, token } = await authService.signup(body);
    get().setToken(token);
    set({ user });
    return user;
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      get().setToken(null);
      set({ user: null });
    }
  },

  becomeHost: async () => {
    const { user } = await authService.becomeHost();
    set({ user });
    return user;
  },

  updateProfile: async (body) => {
    const { user } = await authService.updateProfile(body);
    set({ user });
    return user;
  },

  /** Keep the local user's wishlist id array in sync after a toggle. */
  setWishlistIds: (ids) =>
    set((state) => (state.user ? { user: { ...state.user, wishlist: ids } } : {})),
}));
