import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteProduct } from "../redux/productSlice";

/**
 * ProductItem — Monochrome product card.
 *
 * Design: Sharp borders, no shadow, no radius.
 * Hover: Full black inversion (bg + text). Image de-grays on hover.
 * Index: Mono-type serial number shown above the title.
 *
 * Props:
 *   product: { _id, name, price, description, imageUrl }
 *   index:   Serial number for display (1-based)
 */
function ProductItem({ product, index }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = () => {
    if (window.confirm(`Delete "${product.name}"?`)) {
      dispatch(deleteProduct(product._id));
    }
  };

  const handleEdit = () => navigate(`/edit/${product._id}`);

  // Grayscale placeholder — keeps aesthetic even without a real image
  const imgSrc =
    product.imageUrl ||
    `https://placehold.co/600x450/f5f5f5/525252?text=${encodeURIComponent(product.name)}`;

  const serialNo = String(index).padStart(2, "0");

  return (
    <article className="product-card" role="listitem">
      {/* Image — grayscale by default, color on hover via CSS */}
      <div className="product-card__image-wrapper">
        <img
          src={imgSrc}
          alt={product.name}
          className="product-card__image"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/600x450/f5f5f5/525252?text=No+Image";
          }}
        />
      </div>

      {/* Body */}
      <div className="product-card__body">
        <p className="product-card__index">
          No.&nbsp;{serialNo}
        </p>
        <h2 className="product-card__name">{product.name}</h2>
        <p className="product-card__price">
          ${Number(product.price).toFixed(2)}
        </p>
        {product.description && (
          <p className="product-card__desc">{product.description}</p>
        )}
      </div>

      {/* Actions — sit at the bottom, share border */}
      <div className="product-card__actions">
        <button
          id={`edit-btn-${product._id}`}
          className="btn btn--outline"
          onClick={handleEdit}
          aria-label={`Edit ${product.name}`}
        >
          Edit →
        </button>
        <button
          id={`delete-btn-${product._id}`}
          className="btn btn--danger"
          onClick={handleDelete}
          aria-label={`Delete ${product.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default ProductItem;
