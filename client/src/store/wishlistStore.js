import { create } from 'zustand';
import { authService } from '../api/services.js';
import { useAuthStore } from './authStore.js';

/**
 * Wishlist state kept as a Set of property ids for O(1) membership checks in
 * cards. Mirrors the server; optimistically updates the UI then reconciles.
 */
export const useWishlistStore = create((set, get) => ({
  ids: new Set(),

  /** Hydrate from the logged-in user's wishlist (array of ids or populated docs). */
  hydrateFromUser: (user) => {
    if (!user?.wishlist) return set({ ids: new Set() });
    const ids = user.wishlist.map((p) => (typeof p === 'string' ? p : p._id));
    set({ ids: new Set(ids) });
  },

  has: (propertyId) => get().ids.has(propertyId),

  /**
   * Toggle a property. Requires auth — returns false if the user is not logged
   * in so the caller can prompt a sign-in.
   */
  toggle: async (propertyId) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;

    // Optimistic update.
    const next = new Set(get().ids);
    const wasSaved = next.has(propertyId);
    if (wasSaved) next.delete(propertyId);
    else next.add(propertyId);
    set({ ids: next });

    try {
      const { wishlist } = await authService.toggleWishlist(propertyId);
      useAuthStore.getState().setWishlistIds(wishlist);
      return !wasSaved;
    } catch (err) {
      // Roll back on failure.
      set({ ids: get().ids });
      const revert = new Set(get().ids);
      if (wasSaved) revert.add(propertyId);
      else revert.delete(propertyId);
      set({ ids: revert });
      throw err;
    }
  },

  clear: () => set({ ids: new Set() }),
}));
