import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuickViewModal from "@/components/product/QuickViewModal";

export function ProductCardSkeleton() {
  return (
    <div className="product-skeleton">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line skeleton-line-sm" />
        <div className="skeleton skeleton-line skeleton-line-md" />
        <div className="skeleton skeleton-line skeleton-line-lg" />
        <div className="skeleton skeleton-line skeleton-line-sm" style={{ marginTop: "8px" }} />
      </div>
    </div>
  );
}

export default function ProductCard({
  image,
  category,
  name,
  rating,
  reviews,
  price,
  unit,
  stock,
  product,
  addToWishlist,
  removeFromWishlist,
  isWishlist,
  addToCart,
}) {
  const navigate = useNavigate();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const isLowStock = stock !== undefined && stock > 0 && stock <= 10;
  const isOutOfStock = stock !== undefined && stock === 0;

  const currentProduct = product || {
    id: 1,
    image,
    category,
    name,
    rating,
    reviews,
    price,
    unit,
    stock,
  };

  const productId = currentProduct.id || 1;

  function handleCardClick() {
    navigate(`/product/${productId}`);
  }

  function handleAddToCart(e) {
    e.stopPropagation();
    if (addToCart && currentProduct) addToCart(currentProduct);
  }

  function handleWishlist(e) {
    e.stopPropagation();
    if (!currentProduct) return;
    if (isWishlist) {
      removeFromWishlist?.(currentProduct.id);
    } else {
      addToWishlist?.(currentProduct);
    }
  }

  function handleQuickView(e) {
    e.stopPropagation();
    setIsQuickViewOpen(true);
  }

  return (
    <>
      <div className="product-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
        {/* Image + quick actions */}
        <div className="product-card-img-wrap">
          <img
            src={image || currentProduct.image_url || currentProduct.image}
            alt={name || currentProduct.name}
            className="product-card-img"
            loading="lazy"
          />

          {/* Quick actions overlay */}
          <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="product-card-action-btn quick-view"
              onClick={handleQuickView}
              title="Quick View Details"
              aria-label="Quick View"
            >
              👁️ Quick View
            </button>
            <button
              className="product-card-action-btn cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              title="Add to Cart"
            >
              {isOutOfStock ? "Sold Out" : "+ Cart"}
            </button>
            <button
              className={`product-card-action-btn wish ${isWishlist ? "active" : ""}`}
              onClick={handleWishlist}
              aria-label={isWishlist ? "Remove from wishlist" : "Add to wishlist"}
              title="Wishlist"
            >
              {isWishlist ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Stock indicator */}
          {isLowStock && (
            <span className="product-card-badge badge-low-stock" style={{ position: "absolute", top: "10px", left: "10px" }}>
              Only {stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="product-card-badge badge-in-stock" style={{
              position: "absolute", top: "10px", left: "10px",
              background: "#fef2f2", color: "#b91c1c"
            }}>
              Sold Out
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="product-card-body">
          <span className="product-card-cat">{category || currentProduct.category}</span>
          <h3 className="product-card-name">{name || currentProduct.name}</h3>

          <div className="product-card-rating">
            <span className="product-card-stars">{rating || currentProduct.rating || "★★★★★"}</span>
            <span>({reviews || currentProduct.reviews || "0"} reviews)</span>
          </div>

          <div className="product-card-footer">
            <div>
              <span className="product-card-price">
                {typeof price === "number"
                  ? `Rs. ${price.toLocaleString()}`
                  : price || `Rs. ${(currentProduct.price || 0).toLocaleString()}`}
              </span>
              {" "}
              <span className="product-card-unit">{unit || currentProduct.unit}</span>
            </div>

            <span className={`product-card-badge ${isOutOfStock ? "" : "badge-in-stock"}`}>
              {isOutOfStock ? "" : "In Stock"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick View Modal Popup */}
      <QuickViewModal
        product={currentProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}