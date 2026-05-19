import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  fetchProductById,
  clearSelectedProduct,
  clearError,
} from "../redux/productSlice";

/**
 * ProductForm — Minimalist monochrome form.
 *
 * Design: Thick top border on header, bottom-border-only inputs,
 * mono-type uppercase labels, sharp corners, inverted submit button.
 *
 * Dual-mode: /add → create | /edit/:id → pre-populate & update.
 */
function ProductForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { selectedProduct, loading, error } = useSelector((s) => s.products);

  const [formData, setFormData] = useState({
    name: "", price: "", description: "", imageUrl: "",
  });
  const [successMsg, setSuccessMsg] = useState("");

  /* Fetch existing product on edit mode */
  useEffect(() => {
    if (isEditMode) dispatch(fetchProductById(id));
    return () => {
      dispatch(clearSelectedProduct());
      dispatch(clearError());
    };
  }, [id, isEditMode, dispatch]);

  /* Populate fields when selectedProduct loads */
  useEffect(() => {
    if (isEditMode && selectedProduct) {
      setFormData({
        name:        selectedProduct.name        || "",
        price:       selectedProduct.price       ?? "",
        description: selectedProduct.description || "",
        imageUrl:    selectedProduct.imageUrl    || "",
      });
    }
  }, [selectedProduct, isEditMode]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    const payload = { ...formData, price: parseFloat(formData.price) };

    if (isEditMode) {
      const result = await dispatch(updateProduct({ id, productData: payload }));
      if (!result.error) {
        setSuccessMsg("Product updated.");
        setTimeout(() => navigate("/"), 1000);
      }
    } else {
      const result = await dispatch(createProduct(payload));
      if (!result.error) {
        setSuccessMsg("Product created.");
        setTimeout(() => navigate("/"), 1000);
      }
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">

        {/* ── Header ─────────────────────────────────── */}
        <div className="form-card__header">
          <p className="form-card__eyebrow">
            {isEditMode ? "Edit Existing" : "New Entry"}
          </p>
          <h1 className="form-card__title">
            {isEditMode ? "Update\nProduct" : "Add\nProduct"}
          </h1>
        </div>

        {/* ── Body ───────────────────────────────────── */}
        <div className="form-body">

          {error && (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="alert alert--success" role="status">
              {successMsg}
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Product Name <span className="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Wireless Headphones"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Price — USD <span className="required">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-input form-textarea"
                placeholder="Brief description of the product…"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl" className="form-label">
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => navigate("/")}
              >
                ← Cancel
              </button>
              <button
                id="submit-product-btn"
                type="submit"
                className="btn btn--primary"
                disabled={loading}
              >
                {loading
                  ? "Saving…"
                  : isEditMode
                  ? "Update →"
                  : "Create →"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default ProductForm;
