import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import ProductForm from "./components/ProductForm";

/**
 * App — Root component.
 * Redux Provider + BrowserRouter + route definitions.
 *
 * Routes:
 *   /          → Product catalogue (ProductList)
 *   /add        → Create new product (ProductForm)
 *   /edit/:id   → Edit product by ID (ProductForm)
 */
function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          style={{
            position: "absolute",
            top: -100,
            left: 0,
            background: "#000",
            color: "#fff",
            padding: "8px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            zIndex: 9999,
          }}
          onFocus={(e) => (e.target.style.top = "0")}
          onBlur={(e) => (e.target.style.top = "-100px")}
        >
          Skip to content
        </a>

        <Navbar />

        <main id="main-content" className="main-content">
          <div className="container">
            <Routes>
              <Route path="/"        element={<ProductList />} />
              <Route path="/add"     element={<ProductForm />} />
              <Route path="/edit/:id" element={<ProductForm />} />
            </Routes>
          </div>
        </main>

        {/* Inverted footer — black background, white text */}
        <footer className="footer">
          <span className="footer__text">
            © {new Date().getFullYear()} ProductHub · MERN Stack
          </span>
          <span className="footer__mark">ProductHub</span>
        </footer>
      </Router>
    </Provider>
  );
}

export default App;
