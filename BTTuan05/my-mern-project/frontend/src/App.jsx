import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { AuthProvider } from "./context/AuthContext";
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
 *   /admin       → ProductList (PrivateRoute - admin only)
 *   /admin/add   → ProductForm (PrivateRoute - admin only)
 *   /admin/edit/:id → ProductForm (PrivateRoute - admin only)
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

      {/* ── Admin routes ──────────────────────────────────────────── */}
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
          <AppRoutes />
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
