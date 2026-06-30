import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import Spinner from '../ui/Spinner.jsx';

/**
 * Route guard. Waits for the initial session check, then:
 *  - redirects unauthenticated users to /login (preserving intended path),
 *  - redirects non-hosts away from host-only routes.
 */
export default function ProtectedRoute({ children, requireHost = false }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-coral-500">
        <Spinner size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireHost && !user.isHost) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
