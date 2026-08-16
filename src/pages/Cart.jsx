import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Navbar, Footer, Button } from "@/components";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setCart,
} from "@/features/cart/cartSlice";
import { getCartFromSupabase, syncCartToSupabase } from "@/services/supabaseHelpers";

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  // Load cart from Supabase on auth
  useEffect(() => {
    async function loadCart() {
      if (!isAuthenticated || !user?.id) return;
      try {
        setLoading(true);
        const remoteCart = await getCartFromSupabase(user.id);
        if (remoteCart?.length) dispatch(setCart(remoteCart));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [dispatch, isAuthenticated, user?.id]);

  // Sync cart to Supabase whenever it changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    syncCartToSupabase(user.id, cart).catch(console.error);
  }, [isAuthenticated, user?.id, cart]);

  const getPrice = (item) => {
    // price is stored as raw number (e.g. 10000) — read directly
    if (typeof item.price === "number" && item.price > 0) return item.price;
    if (typeof item.priceNumber === "number" && item.priceNumber > 0) return item.priceNumber;
    // fallback: strip any formatting if old data still in persist
    return Number(String(item.price || 0).replace(/[^0-9]+/g, "")) || 0;
  };

  const subtotal = cart.reduce((s, it) => s + getPrice(it) * (it.quantity || 1), 0);
  const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`;

  return (
    <>
      <Navbar />

      <section className="cart-page">
        <div className="wrap">

          {/* Header */}
          <div className="cart-header">
            <div>
              <p className="products-eyebrow">YOUR SHOPPING CART</p>
              <h1 className="products-title">
                Shopping Cart
                {cart.length > 0 && (
                  <span style={{ fontSize: "18px", fontFamily: "var(--mono)", fontWeight: "400", color: "var(--ink-muted)", marginLeft: "12px" }}>
                    ({cart.reduce((s, it) => s + it.quantity, 0)} items)
                  </span>
                )}
              </h1>
            </div>
            {cart.length > 0 && (
              <Button text="Continue Shopping" className="btn btn-ghost btn-sm" onClick={() => navigate("/shop")} />
            )}
          </div>

          {loading ? (
            <div className="empty-state" style={{ padding: "60px 0" }}>
              <div className="empty-state-icon" style={{ animation: "dot-pulse 1s infinite" }}>🛒</div>
              <p className="empty-wishlist-copy">Syncing your cart...</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", marginBottom: "12px" }}>Your cart is empty</h2>
              <p className="empty-wishlist-copy">
                Add items from the shop and they will appear here.
              </p>
              <Button text="Shop Products" className="btn btn-primary" onClick={() => navigate("/shop")} />
            </div>
          ) : (
            <div className="cart-layout">
              {/* Cart Items */}
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-card" key={item.id}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-img"
                      loading="lazy"
                    />

                    <div className="cart-info">
                      <span className="cart-category">{item.category}</span>
                      <h3 className="cart-name">{item.name}</h3>
                      <p className="cart-price">{fmt(getPrice(item))} <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>{item.unit}</span></p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="cart-qty">
                      <button
                        className="qty-btn"
                        onClick={() => dispatch(decreaseQuantity(item.id))}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-num">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => dispatch(increaseQuantity(item.id))}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Line total */}
                    <div style={{ minWidth: "100px", textAlign: "right" }}>
                      <p style={{ fontFamily: "var(--ui)", fontWeight: "700", fontSize: "16px" }}>
                        {fmt(getPrice(item) * item.quantity)}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      className="cart-remove"
                      onClick={() => dispatch(removeFromCart(item.id))}
                      aria-label={`Remove ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Clear all */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button
                    onClick={() => dispatch(clearCart())}
                    style={{ border: "none", background: "none", color: "var(--ink-muted)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--ui)", textDecoration: "underline" }}
                  >
                    Clear all items
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <aside className="cart-summary">
                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal ({cart.reduce((s, it) => s + it.quantity, 0)} items)</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span style={{ color: "var(--sage)", fontWeight: "600" }}>Free</span>
                </div>
                <div className="summary-row">
                  <span>Tax (est.)</span>
                  <span>{fmt(subtotal * 0.05)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{fmt(subtotal + subtotal * 0.05)}</span>
                </div>

                <Button
                  text="Proceed to Checkout →"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "20px" }}
                  onClick={() => isAuthenticated ? navigate("/checkout") : navigate("/login")}
                />
                <Button
                  text="Continue Shopping"
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", marginTop: "10px" }}
                  onClick={() => navigate("/shop")}
                />

                <p style={{ fontSize: "12px", color: "var(--ink-muted)", textAlign: "center", marginTop: "16px" }}>
                  🔒 Secure checkout · Free returns
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}