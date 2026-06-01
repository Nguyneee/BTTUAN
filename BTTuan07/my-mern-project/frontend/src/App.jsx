import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchPage from "./pages/SearchPage";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoyaltyPage from "./pages/LoyaltyPage";
import WishlistPage from "./pages/WishlistPage";
import ViewHistoryPage from "./pages/ViewHistoryPage";

// Auth Pages
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ProfilePage from "./pages/auth/ProfilePage";

/**
 * App — Root component.
 * Auth context wraps everything; Navbar shows on protected pages.
 *
 * Routes:
 *   /login            → LoginPage (public)
 *   /register         → RegisterPage (public)
 *   /forgot-password  → ForgotPasswordPage (public)
 *   /reset-password   → ResetPasswordPage (public)
 *   /user/profile     → ProfilePage (PrivateRoute - member)
 *   /                 → HomePage (PrivateRoute)
 *   /products/:id     → ProductDetailPage (PrivateRoute)
 *   /search           → SearchPage (PrivateRoute)
 *   /cart             → CartPage (PrivateRoute - member)
 *   /checkout         → CheckoutPage (PrivateRoute - member)
 *   /orders           → OrderHistoryPage (PrivateRoute - member)
 *   /orders/:id       → OrderDetailPage (PrivateRoute - member)
 *   /order-success/:id → OrderSuccessPage (PrivateRoute - member)
 *   /admin/profile    → ProfilePage (PrivateRoute - admin only)
 *   /admin            → ProductList (PrivateRoute - admin only)
 *   /admin/add        → ProductForm (PrivateRoute - admin only)
 *   /admin/edit/:id   → ProductForm (PrivateRoute - admin only)
 *   /admin/orders     → AdminOrdersPage (PrivateRoute - admin only)
 */
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* ── Protected routes (member) ─────────────────────────────── */}
      <Route
        path="/user/profile"
        element={
          <PrivateRoute>
            <Navbar />
            <ProfilePage />
          </PrivateRoute>
        }
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Navbar />
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <PrivateRoute>
            <Navbar />
            <ProductDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <Navbar />
            <SearchPage />
          </PrivateRoute>
        }
      />

      {/* ── Cart & Checkout routes ─────────────────────────────── */}
      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Navbar />
            <CartPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Navbar />
            <CheckoutPage />
          </PrivateRoute>
        }
      />

      {/* ── Order routes ───────────────────────────────────────── */}
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Navbar />
            <OrderHistoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <PrivateRoute>
            <Navbar />
            <OrderDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/order-success/:id"
        element={
          <PrivateRoute>
            <Navbar />
            <OrderSuccessPage />
          </PrivateRoute>
        }
      />

      {/* ── Notifications ───────────────────────────────────────── */}
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <NotificationsPage />
            </main>
          </PrivateRoute>
        }
      />
      <Route
        path="/loyalty"
        element={
          <PrivateRoute>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <LoyaltyPage />
            </main>
          </PrivateRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <PrivateRoute>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <WishlistPage />
            </main>
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <ViewHistoryPage />
            </main>
          </PrivateRoute>
        }
      />

      {/* ── Admin routes ──────────────────────────────────────── */}
      <Route
        path="/admin/profile"
        element={
          <PrivateRoute requiredRole="admin">
            <Navbar />
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute requiredRole="admin">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <ProductList />
            </main>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute requiredRole="admin">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <AdminDashboardPage />
            </main>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/add"
        element={
          <PrivateRoute requiredRole="admin">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <ProductForm />
            </main>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/edit/:id"
        element={
          <PrivateRoute requiredRole="admin">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <ProductForm />
            </main>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <PrivateRoute requiredRole="admin">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <AdminOrdersPage />
            </main>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/coupons"
        element={
          <PrivateRoute requiredRole="admin">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <AdminCouponsPage />
            </main>
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <WishlistProvider>
              <CartProvider>
                <AppRoutes />
              </CartProvider>
            </WishlistProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
