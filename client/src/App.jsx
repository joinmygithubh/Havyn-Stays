import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { useWishlistStore } from './store/wishlistStore.js';

import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Trips from './pages/Trips.jsx';
import Profile from './pages/Profile.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import ListingForm from './pages/ListingForm.jsx';
import Checkout from './pages/Checkout.jsx';
import NotFound from './pages/NotFound.jsx';

/**
 * Root component: bootstraps the session, hydrates the wishlist, and declares
 * the route table. Public routes render freely; private routes are wrapped in
 * <ProtectedRoute>, host-only routes additionally require the host role.
 */
export default function App() {
  const init = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const hydrateWishlist = useWishlistStore((s) => s.hydrateFromUser);

  // Restore session once on mount.
  useEffect(() => {
    init();
  }, [init]);

  // Keep the wishlist store in sync whenever the user object changes.
  useEffect(() => {
    hydrateWishlist(user);
  }, [user, hydrateWishlist]);

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Authenticated */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:bookingId"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Host-only */}
        <Route
          path="/host"
          element={
            <ProtectedRoute requireHost>
              <HostDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/listings/new"
          element={
            <ProtectedRoute requireHost>
              <ListingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/listings/:id/edit"
          element={
            <ProtectedRoute requireHost>
              <ListingForm />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
