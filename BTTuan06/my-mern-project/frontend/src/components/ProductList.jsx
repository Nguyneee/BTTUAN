import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProducts } from "../redux/productSlice";
import ProductItem from "./ProductItem";

/**
 * ProductList — Editorial catalogue view.
 * Oversized Playfair Display headline, grid layout with shared borders,
 * and three monochrome async states (loading / error / empty).
 */
function ProductList() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="state-container" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <span className="state-label">Fetching catalogue…</span>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="state-container state-container--error" role="alert">
        <span className="state-icon" aria-hidden="true">!</span>
        <span className="state-label">Connection Error</span>
        <p className="state-message">{error}</p>
        <button className="btn btn--primary" onClick={() => dispatch(fetchProducts())}>
          Retry →
        </button>
      </div>
    );
  }

  /* ── Empty ── */
  if (products.length === 0) {
    return (
      <>
        <div className="list-header">
          <div>
            <p className="list-header__eyebrow">Product Catalogue</p>
            <h1 className="list-header__title">Empty.</h1>
          </div>
        </div>
        <div className="state-container">
          <span className="state-label">No products found</span>
          <p className="state-message" style={{ fontStyle: "italic" }}>
            Begin by adding your first product.
          </p>
          <Link to="/add" id="add-first-product-btn" className="btn btn--primary">
            + Add Product →
          </Link>
        </div>
      </>
    );
  }

  /* ── Products ── */
  return (
    <section aria-label="Product catalogue">
      <div className="list-header">
        <div>
          <p className="list-header__eyebrow">Product Catalogue</p>
          <h1 className="list-header__title">
            All Works
            <span className="badge" aria-label={`${products.length} products`}>
              {String(products.length).padStart(2, "0")}
            </span>
          </h1>
        </div>
        <Link to="/add" id="add-product-btn" className="btn btn--primary">
          + New Product →
        </Link>
      </div>

      <div className="product-grid" role="list">
        {products.map((product, idx) => (
          <ProductItem key={product._id} product={product} index={idx + 1} />
        ))}
      </div>
    </section>
  );
}

export default ProductList;
