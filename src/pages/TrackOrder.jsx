import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navbar, Footer, Button } from "@/components";
import { useToast } from "@/components/common/useToast";
import { supabase } from "@/services/supabase";

const trackingSteps = [
  {
    id: "placed",
    statusKey: "pending",
    title: "1. Order Placed",
    desc: "Your order details have been received and logged in the system.",
    icon: "📝",
  },
  {
    id: "confirmed",
    statusKey: "confirmed",
    title: "2. Admin Approval & Confirmation",
    desc: "Payment verified and order approved by the operations admin.",
    icon: "✅",
  },
  {
    id: "processing",
    statusKey: "processing",
    title: "3. Custom Tinting & QC",
    desc: "Formulating custom shade pigments and quality checking.",
    icon: "🎨",
  },
  {
    id: "shipped",
    statusKey: "shipped",
    title: "4. Dispatched with Courier",
    desc: "Package picked up by TCS Express Logistics.",
    icon: "📦",
  },
  {
    id: "out_for_delivery",
    statusKey: "out_for_delivery",
    title: "5. Out for Delivery",
    desc: "Rider is heading to your delivery address.",
    icon: "🚚",
  },
  {
    id: "delivered",
    statusKey: "delivered",
    title: "6. Delivered & Inspected",
    desc: "Package received and signed for.",
    icon: "🏡",
  },
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const initialId = searchParams.get("id") || "";
  const [orderQuery, setOrderQuery] = useState(initialId);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const previousStatusRef = useRef(null);

  const fetchOrder = useCallback(async (searchId, isSilent = false) => {
    if (!searchId || !searchId.trim()) return;
    const cleanId = searchId.trim();

    try {
      if (!isSilent) setLoading(true);
      setNotFound(false);

      // 1. Try Local storage first for instantaneous offline/real-time update
      const localDb = JSON.parse(localStorage.getItem("drip_orders_db") || "[]");
      const localFound = localDb.find(
        (o) =>
          String(o.order_number || "").toUpperCase() === cleanId.toUpperCase() ||
          String(o.id || "").toUpperCase() === cleanId.toUpperCase()
      );

      // 2. Query Supabase
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .or(`order_number.ilike.%${cleanId}%,id.eq.${cleanId.length === 36 ? cleanId : "00000000-0000-0000-0000-000000000000"}`)
        .maybeSingle();

      let orderResult = null;

      if (data && !error) {
        orderResult = {
          ...data,
          order_number: data.order_number || `#${String(data.id).slice(0, 8)}`,
          order_status: data.order_status || localFound?.order_status || "pending",
          items: data.order_items?.length ? data.order_items : localFound?.items || [],
          courier: "TCS Express Logistics",
          tracking_number: `TCS-${String(data.id).slice(0, 8).toUpperCase()}`,
          estimated_delivery: "Within 2-3 business days",
          recipient_name: data.recipient_name || data.shipping_address?.split(",")[0] || localFound?.recipient_name || "Valued Customer",
        };
      } else if (localFound) {
        orderResult = {
          ...localFound,
          courier: "TCS Express Logistics",
          tracking_number: `TCS-${String(localFound.id).slice(0, 8).toUpperCase()}`,
          estimated_delivery: "Within 2-3 business days",
        };
      } else if (cleanId.toUpperCase().includes("DRIP") || cleanId.length >= 3) {
        // Fallback demo order
        orderResult = {
          id: cleanId.toUpperCase().startsWith("DRIP-") ? cleanId.toUpperCase() : `DRIP-${cleanId}`,
          order_number: cleanId.toUpperCase().startsWith("DRIP-") ? cleanId.toUpperCase() : `DRIP-${cleanId}`,
          order_status: "pending",
          subtotal: 5700,
          total: 5415,
          created_at: new Date().toISOString(),
          courier: "TCS Express Logistics",
          tracking_number: `TCS-${cleanId.slice(-6)}`,
          estimated_delivery: "Within 2 business days",
          shipping_address: "Gulshan-e-Iqbal Block 6",
          city: "Karachi",
          recipient_name: "Muhammad Ali",
          items: [
            { name: "Cobalt Hour — Matte (4L Gallon)", quantity: 2, price: 2450 },
            { name: "Professional Roller (9\")", quantity: 1, price: 950 },
          ],
        };
      }

      if (orderResult) {
        const currentStatus = orderResult.order_status || "pending";
        // Check if status changed from pending to confirmed in real-time
        if (
          previousStatusRef.current &&
          previousStatusRef.current === "pending" &&
          currentStatus !== "pending"
        ) {
          toast?.show(`🎉 Great news! Your order is now APPROVED (${currentStatus.toUpperCase()})!`, "success");
        }
        previousStatusRef.current = currentStatus;
        setActiveOrder(orderResult);
      } else {
        setNotFound(true);
        setActiveOrder(null);
      }
    } catch {
      // Fallback
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (initialId) {
      setOrderQuery(initialId);
      fetchOrder(initialId);
    }
  }, [initialId, fetchOrder]);

  // REAL-TIME LISTENER SETUP
  useEffect(() => {
    if (!orderQuery) return;

    // 1. Broadcast Channel listener (cross-tab instant sync)
    let bc = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("drip_orders_realtime");
        bc.onmessage = (event) => {
          if (event.data?.type === "ORDER_STATUS_CHANGED" || event.data?.type === "ORDER_CREATED") {
            fetchOrder(orderQuery, true);
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }

    // 2. Storage event listener (syncs across browser tabs when localStorage updates)
    const handleStorageChange = (e) => {
      if (e.key === "drip_orders_db") {
        fetchOrder(orderQuery, true);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 3. Supabase Realtime Postgres Changes Subscription
    let channel = null;
    try {
      channel = supabase
        .channel("order_tracking_live")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders" },
          () => {
            fetchOrder(orderQuery, true);
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("Supabase realtime subscription skipped:", e);
    }

    // 4. Polling fallback every 2.5 seconds
    const interval = setInterval(() => {
      fetchOrder(orderQuery, true);
    }, 2500);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorageChange);
      if (channel) supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [orderQuery, fetchOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    const orderId = activeOrder.id || activeOrder.order_number;
    try {
      setCancelLoading(true);
      // Update local storage first (instant)
      const localDb = JSON.parse(localStorage.getItem("drip_orders_db") || "[]");
      const updated = localDb.map((ord) => {
        if (String(ord.id) === String(orderId) || String(ord.order_number) === String(orderId)) {
          return { ...ord, order_status: "cancelled", status: "cancelled" };
        }
        return ord;
      });
      localStorage.setItem("drip_orders_db", JSON.stringify(updated));

      // Also try updating Supabase
      const { updateOrderStatus } = await import("@/services/supabaseHelpers");
      await updateOrderStatus(orderId, "cancelled");

      // Broadcast
      if ("BroadcastChannel" in window) {
        new BroadcastChannel("drip_orders_realtime").postMessage({
          type: "ORDER_STATUS_CHANGED",
          payload: { orderId, status: "cancelled" },
        });
      }

      setActiveOrder((prev) => prev ? { ...prev, order_status: "cancelled", status: "cancelled" } : prev);
      setCancelConfirm(false);
      toast?.show("Your order has been cancelled successfully.", "info");
    } catch (err) {
      console.warn("Cancel error:", err.message);
      setActiveOrder((prev) => prev ? { ...prev, order_status: "cancelled", status: "cancelled" } : prev);
      setCancelConfirm(false);
    } finally {
      setCancelLoading(false);
    }
  };

  // Helper to determine step completion index
  const getStepIndex = (status) => {
    switch (status) {
      case "pending":
        return 0; // Order placed is complete, step 2 (confirmed) is pending approval
      case "confirmed":
        return 1; // Approved by admin
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "out_for_delivery":
        return 4;
      case "delivered":
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.order_status) : 0;
  const isPendingApproval = activeOrder?.order_status === "pending";

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Navbar />

      <main className="track-order-page">
        {/* Hero */}
        <section className="track-hero">
          <div className="wrap">
            <p className="page-eyebrow">LIVE REAL-TIME TRACKER</p>
            <h1 className="track-title">Real-Time Order Tracking</h1>
            <p className="track-sub">
              Track your paint order status in real-time. When the Admin approves your order, this screen updates automatically.
            </p>

            {/* Search Bar */}
            <form className="track-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Enter Order ID (e.g. DRIP-849201)..."
                className="track-search-input"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-lg track-search-btn">
                {loading ? "Searching..." : "Track Order →"}
              </button>
            </form>

            <div className="track-sample-ids">
              <span>Try sample ID:</span>
              <button
                type="button"
                className="track-sample-pill"
                onClick={() => {
                  setOrderQuery("DRIP-849201");
                  fetchOrder("DRIP-849201");
                }}
              >
                DRIP-849201
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="track-content-section">
          <div className="wrap">
            {notFound && (
              <div className="empty-state" style={{ padding: "60px 0" }}>
                <div className="empty-state-icon">🔍</div>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", marginBottom: "8px" }}>
                  No Order Found
                </h3>
                <p style={{ color: "var(--ink-soft)", marginBottom: "20px" }}>
                  We couldn't find an order matching "<strong>{orderQuery}</strong>".
                </p>
                <Button
                  text="Try Sample Demo Order"
                  className="btn btn-primary"
                  onClick={() => {
                    setOrderQuery("DRIP-849201");
                    fetchOrder("DRIP-849201");
                  }}
                />
              </div>
            )}

            {activeOrder && (
              <div className="track-details-wrapper">
                {/* Top Status Banner */}
                <div className="track-status-banner">
                  <div className="track-banner-left">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="track-banner-tag">ORDER STATUS</span>
                      {isPendingApproval ? (
                        <span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "700", fontFamily: "var(--mono)", animation: "dot-pulse 1.5s infinite" }}>
                          ⏳ Awaiting Admin Approval
                        </span>
                      ) : (
                        <span style={{ background: "#f0fdf4", color: "#166534", padding: "3px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "700", fontFamily: "var(--mono)" }}>
                          ✅ Confirmed by Admin
                        </span>
                      )}
                    </div>

                    <h2 className="track-banner-id">{activeOrder.order_number}</h2>
                    <p className="track-banner-date">
                      Placed on {new Date(activeOrder.created_at || Date.now()).toLocaleDateString("en-PK", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="track-banner-right">
                    <div className="track-eta-badge">
                      <span className="track-eta-icon">🚚</span>
                      <div>
                        <strong>Estimated Delivery:</strong>
                        <p>{activeOrder.order_status === "cancelled" ? "Order Cancelled" : activeOrder.estimated_delivery}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm track-print-btn"
                        onClick={handlePrint}
                      >
                        🖨️ Print Invoice
                      </button>
                      {/* Show Cancel button only if order is still cancellable (pending or confirmed) */}
                      {(activeOrder.order_status === "pending" || activeOrder.order_status === "confirmed") && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" }}
                          onClick={() => setCancelConfirm(true)}
                        >
                          ✕ Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* CANCEL CONFIRMATION MODAL */}
                {cancelConfirm && (
                  <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
                  }}>
                    <div style={{
                      background: "var(--surface)", borderRadius: "var(--r-xl)", padding: "36px",
                      maxWidth: "440px", width: "100%", textAlign: "center", boxShadow: "var(--shadow-xl)"
                    }}>
                      <div style={{ fontSize: "44px", marginBottom: "12px" }}>⚠️</div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                        Cancel This Order?
                      </h3>
                      <p style={{ fontSize: "14px", color: "var(--ink-soft)", marginBottom: "24px", lineHeight: "1.5" }}>
                        Are you sure you want to cancel order <strong>{activeOrder.order_number}</strong>?
                        This action cannot be undone once confirmed.
                      </p>
                      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => setCancelConfirm(false)}
                          disabled={cancelLoading}
                        >
                          Keep Order
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={handleCancelOrder}
                          disabled={cancelLoading}
                        >
                          {cancelLoading ? "Cancelling..." : "Yes, Cancel Order"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CANCELLED BANNER */}
                {activeOrder.order_status === "cancelled" && (
                  <div style={{
                    background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "var(--r-xl)",
                    padding: "20px 28px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px"
                  }}>
                    <span style={{ fontSize: "28px" }}>❌</span>
                    <div>
                      <h4 style={{ fontFamily: "var(--display)", fontSize: "16px", fontWeight: "700", color: "#991b1b", margin: 0 }}>
                        Order Cancelled
                      </h4>
                      <p style={{ fontSize: "13px", color: "#7f1d1d", margin: "4px 0 0" }}>
                        This order has been cancelled. If a payment was made, a refund will be processed within 5–7 business days. For support: WhatsApp us below.
                      </p>
                    </div>
                  </div>
                )}

                {/* REAL-TIME ORDER VERIFICATION NOTICE (If pending) */}
                {isPendingApproval && (
                  <div style={{
                    background: "var(--surface)",
                    border: "1.5px solid #fcd34d",
                    borderRadius: "var(--r-xl)",
                    padding: "20px 24px",
                    marginBottom: "32px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    boxShadow: "var(--shadow-sm)"
                  }}>
                    <div style={{ fontSize: "32px", animation: "dot-pulse 1.2s infinite" }}>⏳</div>
                    <div>
                      <h4 style={{ fontFamily: "var(--display)", fontSize: "17px", fontWeight: "700", margin: 0, color: "#b45309" }}>
                        Order Under Review
                      </h4>
                      <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", margin: "4px 0 0", lineHeight: "1.5" }}>
                        Our fulfillment team is reviewing your order details and preparing your paint batch. This timeline will update automatically in real-time.
                      </p>
                    </div>
                  </div>
                )}

                {/* TIMELINE VISUALIZER */}
                <div className="track-timeline-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 className="track-section-title" style={{ margin: 0 }}>Delivery Progress</h3>
                    <span style={{ fontSize: "12px", fontFamily: "var(--mono)", color: "var(--sage)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="pdp-stock-dot" /> Live Realtime Sync Active
                    </span>
                  </div>

                  <div className="track-timeline-steps">
                    {trackingSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      const isAwaitingApproval = idx === 1 && isPendingApproval;

                      return (
                        <div
                          key={step.id}
                          className={`track-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isAwaitingApproval ? "awaiting" : ""}`}
                        >
                          <div className="track-step-marker">
                            <span className="track-step-icon">
                              {isCompleted ? "✓" : isAwaitingApproval ? "⏳" : step.icon}
                            </span>
                          </div>
                          <div className="track-step-info">
                            <h4 className="track-step-title">{step.title}</h4>
                            <p className="track-step-desc">
                              {isAwaitingApproval
                                ? "Waiting for admin confirmation..."
                                : step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TWO-COLUMN DETAILS GRID */}
                <div className="track-grid-2col">
                  {/* Shipping & Courier Info */}
                  <div className="track-card">
                    <h3 className="track-section-title">📦 Shipment Information</h3>
                    <div className="track-info-list">
                      <div className="track-info-row">
                        <span>Courier Partner:</span>
                        <strong>{activeOrder.courier}</strong>
                      </div>
                      <div className="track-info-row">
                        <span>Tracking Number:</span>
                        <strong style={{ fontFamily: "var(--mono)", color: "var(--cobalt)" }}>
                          {activeOrder.tracking_number}
                        </strong>
                      </div>
                      <div className="track-info-row">
                        <span>Recipient:</span>
                        <strong>{activeOrder.recipient_name}</strong>
                      </div>
                      <div className="track-info-row">
                        <span>Delivery Address:</span>
                        <strong>{activeOrder.shipping_address}, {activeOrder.city}</strong>
                      </div>
                      <div className="track-info-row">
                        <span>Payment Method:</span>
                        <strong>{activeOrder.payment_method || "Cash on Delivery"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Order Items & Totals */}
                  <div className="track-card">
                    <h3 className="track-section-title">🛍️ Order Summary</h3>
                    <div className="track-items-list">
                      {(activeOrder.items || []).map((item, i) => (
                        <div key={i} className="track-item-row">
                          <div>
                            <strong>{item.name || item.product_name || "Paint Product"}</strong>
                            <p style={{ fontSize: "12px", color: "var(--ink-muted)", margin: 0 }}>
                              Qty: {item.quantity || 1} · {item.category || "Supplies"}
                            </p>
                          </div>
                          <span style={{ fontWeight: "700" }}>
                            Rs. {((Number(item.price) || 2450) * (item.quantity || 1)).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="track-divider" />

                    <div className="track-totals-box">
                      <div className="track-total-row">
                        <span>Subtotal:</span>
                        <span>Rs. {(activeOrder.subtotal || activeOrder.total || 0).toLocaleString()}</span>
                      </div>
                      <div className="track-total-row">
                        <span>Shipping:</span>
                        <span style={{ color: "var(--sage)", fontWeight: "600" }}>Free Express Delivery</span>
                      </div>
                      <div className="track-total-row grand">
                        <span>Total Amount:</span>
                        <span>Rs. {(activeOrder.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Need Help Footer Banner */}
                <div className="track-help-banner">
                  <div>
                    <h4>Need urgent assistance with your shipment?</h4>
                    <p>Our logistics team is available on WhatsApp & Call 9:00 AM – 9:00 PM</p>
                  </div>
                  <a
                    href={`https://wa.me/923001234567?text=Hi%20Drip%20Team%2C%20I%20have%20an%20inquiry%20regarding%20Order%20${activeOrder.order_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    💬 WhatsApp Support
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
