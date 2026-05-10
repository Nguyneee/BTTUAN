import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/Profile/EditProfilePage'));

const withSuspense = (element) => (
  <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
    {element}
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: withSuspense(<LoginPage />) },
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterPage />) },
      {
        path: '/profile',
        element: withSuspense(
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        ),
      },
      {
        path: '/profile/edit',
        element: withSuspense(
          <ProtectedRoute><EditProfilePage /></ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
