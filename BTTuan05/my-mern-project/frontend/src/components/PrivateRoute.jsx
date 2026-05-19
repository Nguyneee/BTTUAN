import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * PrivateRoute — Protects routes that require authentication.
 * Shows spinner while loading, redirects to /login if not authenticated.
 */
export default function PrivateRoute({ children, requiredRole = null }) {
  const { isAuthenticated, loading, user } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access (optional)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
