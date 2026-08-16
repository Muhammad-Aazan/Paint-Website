import React from "react";

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
  const isLowStock = stock !== undefined && stock > 0 && stock <= 10;
  const isOutOfStock = stock !== undefined && stock === 0;

  function handleAddToCart() {
    if (addToCart && product) addToCart(product);
  }

  function handleWishlist() {
    if (!product) return;
    if (isWishlist) {
      removeFromWishlist?.(product.id);
    } else {
      addToWishlist?.(product);
    }
  }

  return (
    <div className="product-card">
      {/* Image + quick actions */}
      <div className="product-card-img-wrap">
        <img
          src={image || product?.image_url || product?.image}
          alt={name}
          className="product-card-img"
          loading="lazy"
        />

        {/* Quick actions overlay */}
        <div className="product-card-actions">
          <button
            className="product-card-action-btn cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "+ Cart"}
          </button>
          <button
            className={`product-card-action-btn wish ${isWishlist ? "active" : ""}`}
            onClick={handleWishlist}
            aria-label={isWishlist ? "Remove from wishlist" : "Add to wishlist"}
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
        <span className="product-card-cat">{category || product?.category}</span>
        <h3 className="product-card-name">{name || product?.name}</h3>

        <div className="product-card-rating">
          <span className="product-card-stars">{rating || product?.rating || "★★★★★"}</span>
          <span>({reviews || product?.reviews || "0"} reviews)</span>
        </div>

        <div className="product-card-footer">
          <div>
            <span className="product-card-price">
              {typeof price === "number"
                ? `Rs. ${price.toLocaleString()}`
                : price || `Rs. ${(product?.price || 0).toLocaleString()}`}
            </span>
            {" "}
            <span className="product-card-unit">{unit || product?.unit}</span>
          </div>

          <span className={`product-card-badge ${isOutOfStock ? "" : "badge-in-stock"}`}>
            {isOutOfStock ? "" : "In Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}