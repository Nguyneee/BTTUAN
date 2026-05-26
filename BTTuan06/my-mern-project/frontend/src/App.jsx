import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
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

/**
 * App — Root component.
 * Auth context wraps everything; Navbar shows on protected pages.
 *
 * Routes:
 *   /login       → LoginPage (public)
 *   /register    → RegisterPage (public)
 *   /            → HomePage (PrivateRoute - member)
 *   /products/:id → ProductDetailPage (PrivateRoute)
 *   /search      → SearchPage (PrivateRoute)
 *   /cart        → CartPage (PrivateRoute - member)
 *   /checkout    → CheckoutPage (PrivateRoute - member)
 *   /orders      → OrderHistoryPage (PrivateRoute - member)
 *   /orders/:id  → OrderDetailPage (PrivateRoute - member)
 *   /order-success/:id → OrderSuccessPage (PrivateRoute - member)
 *   /admin       → ProductList (PrivateRoute - admin only)
 *   /admin/add   → ProductForm (PrivateRoute - admin only)
 *   /admin/edit/:id → ProductForm (PrivateRoute - admin only)
 *   /admin/orders → AdminOrdersPage (PrivateRoute - admin only)
 */
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Protected routes (member) ─────────────────────────────── */}
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

      {/* ── Admin routes ──────────────────────────────────────── */}
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
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
