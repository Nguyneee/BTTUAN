import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
