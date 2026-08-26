import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  closeDrawer,
} from "@/features/cart/cartSlice";

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isDrawerOpen } = useSelector((state) => state.cart);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const totalCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const getPrice = (item) => {
    if (typeof item.priceNumber === "number" && item.priceNumber > 0) return item.priceNumber;
    return Number(String(item.price || 0).replace(/[^0-9.-]+/g, "")) || 0;
  };

  const subtotal = items.reduce((sum, item) => sum + getPrice(item) * (item.quantity || 1), 0);
  const freeShippingThreshold = 8000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    dispatch(closeDrawer());
    navigate("/checkout");
  };

  const handleWhatsAppCheckout = () => {
    if (!items.length) return;
    const itemsList = items
      .map((it, idx) => `${idx + 1}. ${it.name} (Qty: ${it.quantity}) - Rs. ${(getPrice(it) * it.quantity).toLocaleString()}`)
      .join("%0A");

    const message = `Salam DRIP Team!%0A%0AI would like to place an order for the following paint items:%0A${itemsList}%0A%0A*Estimated Subtotal:* Rs. ${subtotal.toLocaleString()}%0A*Payment:* Cash on Delivery%0A%0APlease confirm availability and dispatch!`;
    const url = `https://wa.me/923001234567?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="cart-drawer-root">
      {/* Backdrop */}
      <div
        className="cart-drawer-backdrop"
        onClick={() => dispatch(closeDrawer())}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className="cart-drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-group">
            <span className="cart-drawer-icon">🛍️</span>
            <div>
              <h3 className="cart-drawer-title">Shopping Bag</h3>
              <p className="cart-drawer-sub">
                {totalCount} {totalCount === 1 ? "item" : "items"} in cart
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cart-drawer-close-btn"
            onClick={() => dispatch(closeDrawer())}
            aria-label="Close cart drawer"
          >
            ✕
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="cart-drawer-promo-bar">
          <div className="cart-drawer-promo-label">
            {remainingForFree > 0 ? (
              <span>
                Add <strong>Rs. {remainingForFree.toLocaleString()}</strong> more for <strong>FREE Standard Delivery</strong> 🚚
              </span>
            ) : (
              <span style={{ color: "var(--sage)", fontWeight: "700" }}>
                🎉 You've unlocked FREE Standard Delivery!
              </span>
            )}
          </div>
          <div className="cart-drawer-progress-track">
            <div
              className="cart-drawer-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="cart-drawer-items">
          {items.length === 0 ? (
            <div className="cart-drawer-empty">
              <span className="cart-drawer-empty-icon">🎨</span>
              <h4>Your Paint Bag is Empty</h4>
              <p>Explore our architectural paints, rollers, and weatherproof shields to get started.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  dispatch(closeDrawer());
                  navigate("/shop");
                }}
              >
                Browse Paint Shop →
              </button>
            </div>
          ) : (
            items.map((item) => {
              const price = getPrice(item);
              const lineTotal = price * (item.quantity || 1);

              return (
                <div key={item.id} className="cart-drawer-item-row">
                  <Link
                    to={`/product/${item.id}`}
                    onClick={() => dispatch(closeDrawer())}
                    className="cart-drawer-item-img-wrap"
                  >
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200"}
                      alt={item.name}
                      className="cart-drawer-item-img"
                    />
                  </Link>

                  <div className="cart-drawer-item-info">
                    <span className="cart-drawer-item-cat">{item.category || "Paint & Finishes"}</span>
                    <Link
                      to={`/product/${item.id}`}
                      onClick={() => dispatch(closeDrawer())}
                      className="cart-drawer-item-title"
                    >
                      {item.name}
                    </Link>
                    <div className="cart-drawer-item-price-unit">
                      Rs. {price.toLocaleString()} {item.unit ? `· ${item.unit}` : ""}
                    </div>

                    <div className="cart-drawer-item-actions">
                      <div className="cart-drawer-stepper">
                        <button
                          type="button"
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => dispatch(increaseQuantity(item.id))}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-drawer-line-total">
                        Rs. {lineTotal.toLocaleString()}
                      </span>

                      <button
                        type="button"
                        className="cart-drawer-remove-btn"
                        onClick={() => dispatch(removeFromCart(item.id))}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-summary-row">
              <span>Subtotal</span>
              <strong className="cart-drawer-subtotal-val">
                Rs. {subtotal.toLocaleString()}
              </strong>
            </div>
            <p className="cart-drawer-notice">
              Taxes and delivery fee calculated during checkout. Cash on Delivery supported nationwide.
            </p>

            <div className="cart-drawer-buttons">
              <button
                type="button"
                className="btn btn-primary btn-lg cart-drawer-checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout →
              </button>

              <button
                type="button"
                className="btn btn-ghost cart-drawer-wa-btn"
                onClick={handleWhatsAppCheckout}
              >
                💬 1-Click WhatsApp Order
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
