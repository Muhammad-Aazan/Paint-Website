import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart, openDrawer } from "@/features/cart/cartSlice";
import { useToast } from "@/components/common/useToast";

export default function QuickViewModal({ product, isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("4 Litres (Gallon)");

  if (!isOpen || !product) return null;

  const getPrice = () => {
    if (typeof product.priceNumber === "number" && product.priceNumber > 0) return product.priceNumber;
    return Number(String(product.price || 0).replace(/[^0-9.-]+/g, "")) || 2450;
  };

  const basePrice = getPrice();
  const sizeMultiplier = selectedSize.includes("16 Litres") ? 3.6 : selectedSize.includes("1 Litre") ? 0.35 : 1;
  const currentPrice = Math.round(basePrice * sizeMultiplier);

  const images = product.images && product.images.length > 0
    ? product.images
    : [
        product.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600",
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600",
        "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=600",
      ];

  const [activeImg, setActiveImg] = useState(images[0]);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        ...product,
        price: currentPrice,
        priceNumber: currentPrice,
        unit: `/ ${selectedSize}`,
        quantity,
      })
    );
    toast?.show(`Added ${quantity} × ${product.name} (${selectedSize}) to bag!`, "success");
    dispatch(openDrawer());
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const text = `Salam DRIP Team! I want to order:%0A*Product:* ${product.name}%0A*Size:* ${selectedSize}%0A*Quantity:* ${quantity}%0A*Price:* Rs. ${(currentPrice * quantity).toLocaleString()}%0A%0APlease confirm availability for Cash on Delivery!`;
    window.open(`https://wa.me/923001234567?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="quickview-backdrop" onClick={onClose}>
      <div
        className="quickview-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="quickview-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="quickview-grid">
          {/* Left Gallery */}
          <div className="quickview-gallery">
            <div className="quickview-main-img-wrap">
              <img
                src={activeImg}
                alt={product.name}
                className="quickview-main-img"
              />
              <span className="quickview-badge">⚡ Quick Preview</span>
            </div>
            <div className="quickview-thumb-strip">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`quickview-thumb-btn ${activeImg === img ? "active" : ""}`}
                  onClick={() => setActiveImg(img)}
                >
                  <img src={img} alt="thumbnail" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Product Details */}
          <div className="quickview-details">
            <span className="quickview-cat">{product.category || "Premium Paint"}</span>
            <h2 className="quickview-title">{product.name}</h2>

            <div className="quickview-rating-row">
              <span className="quickview-stars">★★★★★</span>
              <span className="quickview-rating-val">{product.rating || 4.9}</span>
              <span className="quickview-review-count">({product.reviews || 84} verified reviews)</span>
            </div>

            <div className="quickview-price-box">
              <span className="quickview-price">Rs. {currentPrice.toLocaleString()}</span>
              <span className="quickview-unit">per {selectedSize}</span>
              <span className="quickview-stock-pill">✓ In Stock (Ready to Dispatch)</span>
            </div>

            <p className="quickview-desc">
              {product.description ||
                "Architectural grade luxury formulation engineered for high scrub resistance, computerized pigment stability, and ultra-smooth coverage across residential and commercial walls."}
            </p>

            {/* Size / Packaging Selector */}
            <div className="quickview-size-section">
              <label className="quickview-label">Packaging Volume:</label>
              <div className="quickview-size-options">
                {["1 Litre (Quarter)", "4 Litres (Gallon)", "16 Litres (Drum)"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`quickview-size-pill ${selectedSize === sz ? "active" : ""}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="quickview-actions-row">
              <div className="quickview-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg quickview-add-btn"
                onClick={handleAddToCart}
              >
                🛍️ Add to Bag (Rs. {(currentPrice * quantity).toLocaleString()})
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="quickview-sub-actions">
              <button
                type="button"
                className="btn btn-ghost quickview-wa-btn"
                onClick={handleWhatsAppOrder}
              >
                💬 Order via WhatsApp
              </button>

              <button
                type="button"
                className="quickview-full-link"
                onClick={() => {
                  onClose();
                  navigate(`/product/${product.id}`);
                }}
              >
                View Full Specs, Reviews &amp; Visualizer →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
