import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, Footer, Button } from "@/components";
import { clearCart } from "@/features/cart/cartSlice";
import { createOrderInSupabase } from "@/services/supabaseHelpers";
import { validateAndApplyCoupon } from "@/services/couponHelpers";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);

  const initialDiscount = location.state?.discount || 0;
  const initialPromo = location.state?.promo || "";

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  // Promo State in Checkout
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(initialDiscount);
  const [appliedPromo, setAppliedPromo] = useState(initialPromo);
  const [promoError, setPromoError] = useState("");

  // Delivery Speed State
  const [deliverySpeed, setDeliverySpeed] = useState("standard"); // 'standard' | 'fast' | 'urgent'

  const deliveryOptions = [
    {
      id: "standard",
      name: "Standard Ground Delivery",
      icon: "🚚",
      time: "3 – 5 Business Days",
      price: 0,
      badge: "FREE",
      desc: "Safe nationwide logistics across all cities in Pakistan.",
    },
    {
      id: "fast",
      name: "Fast Express Delivery",
      icon: "🚀",
      time: "1 – 2 Business Days",
      price: 250,
      badge: "Rs. 250",
      desc: "Priority courier dispatch for prompt project timelines.",
    },
    {
      id: "urgent",
      name: "Urgent Same-Day / 24h Rush",
      icon: "⚡",
      time: "Under 24 Hours",
      price: 600,
      badge: "Rs. 600",
      desc: "Immediate paint mixing & express direct courier rush delivery.",
    },
  ];

  // Form State
  const [shipping, setShipping] = useState({
    fullName: user?.user_metadata?.full_name || "",
    phone: user?.user_metadata?.phone || "",
    email: user?.email || "",
    city: "Karachi",
    address: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' or 'card'

  const getPrice = (item) => {
    if (typeof item.priceNumber === "number" && item.priceNumber > 0) return item.priceNumber;
    return Number(String(item.price || 0).replace(/[^0-9.-]+/g, "")) || 0;
  };

  const selectedDelivery = deliveryOptions.find((d) => d.id === deliverySpeed) || deliveryOptions[0];
  const shippingFee = selectedDelivery.price;

  const subtotal = cart.reduce((s, it) => s + getPrice(it) * (it.quantity || 1), 0);
  const discount = appliedDiscount;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.05;
  const grandTotal = taxableAmount + tax + shippingFee;

  const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setPromoError("");
    const result = validateAndApplyCoupon(promoCodeInput, subtotal);
    if (result.isValid) {
      setAppliedDiscount(result.discountAmount);
      setAppliedPromo(result.label);
      setPromoCodeInput("");
    } else {
      setPromoError(result.error);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setAppliedPromo("");
    setPromoError("");
  };

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!cart.length) return;

    try {
      setLoading(true);
      setError("");

      const userId = user?.id || "guest";
      const order = await createOrderInSupabase(userId, cart, grandTotal, {
        fullName: shipping.fullName,
        phone: shipping.phone,
        email: shipping.email,
        city: shipping.city,
        address: shipping.address,
        notes: shipping.notes,
        shippingSpeed: deliverySpeed,
        shippingFee: shippingFee,
        discount: discount,
        paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Credit / Debit Card",
      });

      const generatedId = order?.order_number || order?.id || `DRIP-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      dispatch(clearCart());
      setOrderPlaced(true);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <section className="checkout-page">
        <div className="wrap">
          {/* Page Header */}
          <div className="cart-header" style={{ marginBottom: "32px" }}>
            <div>
              <p className="products-eyebrow">FINAL STEP</p>
              <h1 className="products-title">Complete Your Order</h1>
            </div>
            <Button text="← Back to Cart" className="btn btn-ghost btn-sm" onClick={() => navigate("/cart")} />
          </div>

          {orderPlaced ? (
            /* Order Success State */
            <div style={{
              maxWidth: "600px",
              margin: "40px auto",
              background: "var(--surface)",
              border: "1px solid var(--paper-line)",
              borderRadius: "var(--r-xl)",
              padding: "48px 36px",
              textAlign: "center",
              boxShadow: "var(--shadow-lg)"
            }}>
              <div style={{ fontSize: "56px", marginBottom: "20px", animation: "badge-pop 0.4s var(--ease-spring)" }}>🎉</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
                Order Confirmed!
              </h2>
              <p style={{ fontFamily: "var(--mono)", fontSize: "15px", color: "var(--cobalt)", fontWeight: "700", marginBottom: "16px" }}>
                Order #{orderId}
              </p>
              <p style={{ color: "var(--ink-soft)", fontSize: "16px", lineHeight: "1.65", marginBottom: "32px" }}>
                Thank you for your order! We have received your purchase request.
                Our delivery team will contact you at <strong>{shipping.phone || "your phone number"}</strong> before dispatch.
              </p>

              <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  text="🚚 Track Your Order Live →"
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate(`/track-order?id=${orderId}`)}
                />
                <Button
                  text="Continue Shopping"
                  className="btn btn-ghost btn-lg"
                  onClick={() => navigate("/shop")}
                />
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart Redirect */
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", marginBottom: "12px" }}>Your cart is empty</h2>
              <p className="empty-wishlist-copy">Please add items to your cart before proceeding to checkout.</p>
              <Button text="Browse Products" className="btn btn-primary" onClick={() => navigate("/shop")} />
            </div>
          ) : (
            /* 2-Column Checkout Layout */
            <form onSubmit={handlePlaceOrder} className="checkout-grid">
              {/* Left Column: Form Details */}
              <div>
                {error && (
                  <div className="settings-alert error" style={{ marginBottom: "24px" }}>
                    ⚠ {error}
                  </div>
                )}

                {/* Step 1: Shipping Address */}
                <div className="checkout-section">
                  <h3>1. Delivery & Contact Information</h3>

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Tariq Ahmed"
                      required
                      value={shipping.fullName}
                      onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+92 300 1234567"
                        required
                        value={shipping.phone}
                        onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        required
                        value={shipping.email}
                        onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <select
                        className="form-input"
                        required
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      >
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Quetta">Quetta</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="House / Flat No., Street, Block, Area"
                        required
                        value={shipping.address}
                        onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Special Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Call before arrival, leave with security"
                      value={shipping.notes}
                      onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Step 2: Choose Delivery Speed */}
                <div className="checkout-section">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0 }}>2. Choose Delivery Speed</h3>
                    <span style={{ fontSize: "12px", fontFamily: "var(--mono)", color: "var(--cobalt)", fontWeight: "700" }}>
                      {selectedDelivery.name}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {deliveryOptions.map((opt) => {
                      const isSelected = deliverySpeed === opt.id;
                      return (
                        <label
                          key={opt.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "16px",
                            padding: "16px 20px",
                            borderRadius: "var(--r-lg)",
                            border: isSelected ? "2px solid var(--cobalt)" : "1.5px solid var(--paper-line)",
                            background: isSelected ? "var(--cobalt-glow)" : "var(--surface)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? "0 4px 14px rgba(30, 61, 110, 0.08)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <input
                              type="radio"
                              name="deliverySpeed"
                              checked={isSelected}
                              onChange={() => setDeliverySpeed(opt.id)}
                            />
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                                <span style={{ fontSize: "20px" }}>{opt.icon}</span>
                                <strong style={{ fontSize: "15px", color: "var(--ink)" }}>{opt.name}</strong>
                                <span style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "2px 8px",
                                  borderRadius: "99px",
                                  background: opt.id === "urgent" ? "#fee2e2" : opt.id === "fast" ? "#e0e7ff" : "#ecfdf5",
                                  color: opt.id === "urgent" ? "#991b1b" : opt.id === "fast" ? "#3730a3" : "#047857",
                                }}>
                                  {opt.time}
                                </span>
                              </div>
                              <span style={{ fontSize: "12.5px", color: "var(--ink-soft)" }}>{opt.desc}</span>
                            </div>
                          </div>

                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <strong style={{
                              fontFamily: "var(--ui)",
                              fontSize: "15px",
                              color: opt.price === 0 ? "var(--sage)" : "var(--ink)",
                              display: "block"
                            }}>
                              {opt.badge}
                            </strong>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Payment Method */}
                <div className="checkout-section">
                  <h3>3. Payment Method</h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "16px 20px",
                      borderRadius: "var(--r-md)",
                      border: paymentMethod === "cod" ? "2px solid var(--cobalt)" : "1px solid var(--paper-line)",
                      background: paymentMethod === "cod" ? "var(--cobalt-glow)" : "var(--surface)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <div>
                        <strong style={{ display: "block", fontSize: "15px" }}>💵 Cash on Delivery (COD)</strong>
                        <span style={{ fontSize: "13px", color: "var(--ink-soft)" }}>Pay in cash upon receiving your paint shipment.</span>
                      </div>
                    </label>

                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "16px 20px",
                      borderRadius: "var(--r-md)",
                      border: paymentMethod === "card" ? "2px solid var(--cobalt)" : "1px solid var(--paper-line)",
                      background: paymentMethod === "card" ? "var(--cobalt-glow)" : "var(--surface)",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                      />
                      <div>
                        <strong style={{ display: "block", fontSize: "15px" }}>💳 Credit / Debit Card (Online)</strong>
                        <span style={{ fontSize: "13px", color: "var(--ink-soft)" }}>Visa, MasterCard, UnionPay, &amp; JazzCash / EasyPaisa.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <aside className="cart-summary" style={{ position: "sticky", top: "100px" }}>
                <h3>Order Items ({cart.length})</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "280px", overflowY: "auto", marginBottom: "20px", paddingRight: "4px" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img src={item.image} alt={item.name} style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "6px", background: "var(--canvas-dark)", padding: "4px", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontFamily: "var(--display)", fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{item.name}</h4>
                        <p style={{ fontSize: "12px", color: "var(--ink-muted)", margin: 0 }}>Qty: {item.quantity} × {fmt(getPrice(item))}</p>
                      </div>
                      <span style={{ fontFamily: "var(--ui)", fontWeight: "700", fontSize: "14px", color: "var(--ink)" }}>{fmt(getPrice(item) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input in Checkout */}
                <div style={{ margin: "16px 0", padding: "14px", background: "var(--canvas-dark)", borderRadius: "var(--r-md)", border: "1px solid var(--paper-line)" }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", fontFamily: "var(--mono)", color: "var(--ink-muted)", display: "block", marginBottom: "6px" }}>
                    PROMO / DISCOUNT COUPON
                  </label>
                  {appliedPromo ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", padding: "8px 12px", borderRadius: "6px", border: "1px solid #bbf7d0", fontSize: "13px" }}>
                      <span style={{ color: "#166534", fontWeight: "600" }}>✓ {appliedPromo} Applied</span>
                      <button type="button" onClick={handleRemoveCoupon} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: "700" }}>✕</button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="Coupon (e.g. WELCOME20)"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        style={{ flex: 1, padding: "8px 10px", fontSize: "13px", borderRadius: "6px", border: "1px solid var(--paper-line)", textTransform: "uppercase" }}
                      />
                      <button type="submit" className="btn btn-ghost btn-sm" style={{ whiteSpace: "nowrap" }}>
                        Apply
                      </button>
                    </form>
                  )}
                  {promoError && (
                    <p style={{ color: "var(--poppy)", fontSize: "12px", margin: "6px 0 0" }}>{promoError}</p>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--paper-line)", paddingTop: "16px" }}>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="summary-row" style={{ color: "var(--sage)", fontWeight: "600" }}>
                      <span>Promo Discount {appliedPromo ? `(${appliedPromo})` : ""}</span>
                      <span>-{fmt(discount)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>GST Tax (5%)</span>
                    <span>{fmt(tax)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Speed</span>
                    <span style={{ fontWeight: "600" }}>
                      {selectedDelivery.icon} {selectedDelivery.name.split(" ")[0]} ({shippingFee === 0 ? "FREE" : fmt(shippingFee)})
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>{fmt(grandTotal)}</span>
                  </div>
                </div>

                <Button
                  text={loading ? "Processing Order..." : `Confirm & Place Order (${fmt(grandTotal)}) →`}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", marginTop: "24px" }}
                />

                <p style={{ fontSize: "12px", color: "var(--ink-muted)", textAlign: "center", marginTop: "16px" }}>
                  🔒 Guaranteed safe &amp; secure checkout
                </p>
              </aside>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
