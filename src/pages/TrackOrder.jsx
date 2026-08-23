import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navbar, Footer, Button } from "@/components";
import { useToast } from "@/components/common/useToast";
import { supabase } from "@/services/supabase";
import { fetchAllOrders, updateOrderStatus } from "@/services/supabaseHelpers";

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
    title: "2. Order Verified & Confirmed",
    desc: "Payment verified and order approved by our dispatch operations.",
    icon: "✅",
  },
  {
    id: "processing",
    statusKey: "processing",
    title: "3. Custom Tinting & QC",
    desc: "Formulating custom shade pigments and paint quality checking.",
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

const fallbackDemoOrders = [
  {
    id: "DRIP-849201",
    order_number: "DRIP-849201",
    order_status: "pending",
    delivery_speed: "urgent",
    subtotal: 5700,
    shipping: 600,
    discount: 0,
    total: 6300,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    courier: "TCS Express Logistics",
    tracking_number: "TCS-849201",
    estimated_delivery: "Within 24 Hours",
    shipping_address: "House 42, Street 4, DHA Phase 5",
    city: "Karachi",
    recipient_name: "Ali Ahmed",
    phone: "+92 300 1234567",
    payment_method: "Cash on Delivery",
    items: [
      {
        id: 1,
        product_id: 1,
        name: "DRIP Architectural Interior — Cobalt Hour",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
        quantity: 2,
        price: 2450,
        category: "Interior Wall Paint",
        unit: "/ gallon",
      },
      {
        id: 5,
        product_id: 5,
        name: "Professional Dual-Angle Roller (9\")",
        image: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400",
        quantity: 1,
        price: 800,
        category: "Supplies & Rollers",
        unit: "/ piece",
      },
    ],
  },
  {
    id: "DRIP-592810",
    order_number: "DRIP-592810",
    order_status: "processing",
    delivery_speed: "fast",
    subtotal: 4200,
    shipping: 250,
    discount: 500,
    total: 3950,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    courier: "TCS Express Logistics",
    tracking_number: "TCS-592810",
    estimated_delivery: "Tomorrow by 5:00 PM",
    shipping_address: "Flat 12-B, Askari 11",
    city: "Lahore",
    recipient_name: "Fatima Khan",
    phone: "+92 321 9876543",
    payment_method: "Credit / Debit Card",
    items: [
      {
        id: 2,
        product_id: 2,
        name: "DRIP Exterior Weatherproof Shield",
        image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400",
        quantity: 1,
        price: 3400,
        category: "Exterior Wall Paint",
        unit: "/ gallon",
      },
      {
        id: 4,
        product_id: 4,
        name: "Precision Ergonomic Sash Brush (2.5\")",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
        quantity: 1,
        price: 800,
        category: "Application Brushes",
        unit: "/ piece",
      },
    ],
  },
];

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);

  const initialId = searchParams.get("id") || "";
  const [orderQuery, setOrderQuery] = useState(initialId);
  const [allOrders, setAllOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const previousStatusRef = useRef(null);

  // Load all available orders from Supabase + Local Storage
  const loadOrdersList = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const remoteOrders = await fetchAllOrders();
      const localDb = JSON.parse(localStorage.getItem("drip_orders_db") || "[]");

      // Merge remote and local orders (avoid duplicates)
      const mergedMap = new Map();

      // Seed fallbacks if completely empty
      fallbackDemoOrders.forEach((o) => mergedMap.set(String(o.order_number || o.id), o));

      (remoteOrders || []).forEach((o) => {
        const key = String(o.order_number || o.id);
        mergedMap.set(key, {
          ...o,
          order_number: o.order_number || `#${String(o.id).slice(0, 8)}`,
          courier: "TCS Express Logistics",
          tracking_number: `TCS-${String(o.id).slice(0, 6).toUpperCase()}`,
          estimated_delivery: o.delivery_speed === "urgent" ? "Within 24 Hours" : o.delivery_speed === "fast" ? "Within 1-2 Days" : "Within 3-4 Days",
          recipient_name: o.recipient_name || o.shipping_address?.split(",")[0] || "Customer",
        });
      });

      (localDb || []).forEach((o) => {
        const key = String(o.order_number || o.id);
        const existing = mergedMap.get(key);
        mergedMap.set(key, { ...existing, ...o });
      });

      const list = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );

      setAllOrders(list);

      // If URL has ?id=, automatically focus that order
      if (initialId) {
        const found = list.find(
          (o) =>
            String(o.order_number || "").toUpperCase() === initialId.toUpperCase() ||
            String(o.id || "").toUpperCase() === initialId.toUpperCase()
        );
        if (found) {
          setActiveOrder(found);
        }
      }
    } catch (e) {
      console.warn("loadOrdersList error:", e.message);
      setAllOrders(fallbackDemoOrders);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [initialId]);

  useEffect(() => {
    loadOrdersList();
  }, [loadOrdersList]);

  // Real-time listener for status changes
  useEffect(() => {
    let bc = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("drip_orders_realtime");
        bc.onmessage = (event) => {
          if (event.data?.type === "ORDER_STATUS_CHANGED" || event.data?.type === "ORDER_CREATED") {
            loadOrdersList(true);
            if (activeOrder && String(activeOrder.order_number || activeOrder.id) === String(event.data?.payload?.orderId)) {
              setActiveOrder((prev) => prev ? { ...prev, order_status: event.data.payload.status, status: event.data.payload.status } : prev);
            }
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }

    const handleStorage = (e) => {
      if (e.key === "drip_orders_db") {
        loadOrdersList(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(() => {
      loadOrdersList(true);
    }, 3000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [loadOrdersList, activeOrder]);

  // Select an order to view full details
  const handleSelectOrder = (order) => {
    setActiveOrder(order);
    setSearchParams({ id: order.order_number || order.id });
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const handleBackToAllOrders = () => {
    setActiveOrder(null);
    setSearchParams({});
  };

  // Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    const clean = orderQuery.trim().toUpperCase();
    const found = allOrders.find(
      (o) =>
        String(o.order_number || "").toUpperCase().includes(clean) ||
        String(o.id || "").toUpperCase().includes(clean) ||
        String(o.recipient_name || "").toUpperCase().includes(clean) ||
        String(o.city || "").toUpperCase().includes(clean)
    );

    if (found) {
      handleSelectOrder(found);
    } else {
      toast?.show(`No order found matching "${orderQuery}".`, "warning");
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    const orderId = activeOrder.id || activeOrder.order_number;
    try {
      setCancelLoading(true);

      const localDb = JSON.parse(localStorage.getItem("drip_orders_db") || "[]");
      const updated = localDb.map((ord) => {
        if (String(ord.id) === String(orderId) || String(ord.order_number) === String(orderId)) {
          return { ...ord, order_status: "cancelled", status: "cancelled" };
        }
        return ord;
      });
      localStorage.setItem("drip_orders_db", JSON.stringify(updated));

      try {
        await updateOrderStatus(orderId, "cancelled");
      } catch (err) {
        console.warn("Supabase cancel warning:", err.message);
      }

      if ("BroadcastChannel" in window) {
        new BroadcastChannel("drip_orders_realtime").postMessage({
          type: "ORDER_STATUS_CHANGED",
          payload: { orderId, status: "cancelled" },
        });
      }

      setActiveOrder((prev) => prev ? { ...prev, order_status: "cancelled", status: "cancelled" } : prev);
      setCancelConfirm(false);
      toast?.show("Your order has been cancelled successfully.", "info");
      loadOrdersList(true);
    } catch (err) {
      console.warn("Cancel error:", err.message);
      setCancelConfirm(false);
    } finally {
      setCancelLoading(false);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return allOrders.filter((ord) => {
      const status = (ord.order_status || ord.status || "pending").toLowerCase();
      if (statusFilter === "pending" && status !== "pending") return false;
      if (statusFilter === "processing" && (status !== "confirmed" && status !== "processing")) return false;
      if (statusFilter === "shipped" && (status !== "shipped" && status !== "out_for_delivery")) return false;
      if (statusFilter === "delivered" && status !== "delivered") return false;
      if (statusFilter === "cancelled" && status !== "cancelled") return false;

      if (orderQuery.trim()) {
        const q = orderQuery.trim().toLowerCase();
        const num = String(ord.order_number || ord.id || "").toLowerCase();
        const recipient = String(ord.recipient_name || "").toLowerCase();
        const city = String(ord.city || "").toLowerCase();
        const hasItem = (ord.items || []).some((it) => String(it.name || "").toLowerCase().includes(q));
        if (!num.includes(q) && !recipient.includes(q) && !city.includes(q) && !hasItem) return false;
      }
      return true;
    });
  }, [allOrders, statusFilter, orderQuery]);

  // Determine step index
  const getStepIndex = (status) => {
    switch (status) {
      case "pending": return 0;
      case "confirmed": return 1;
      case "processing": return 2;
      case "shipped": return 3;
      case "out_for_delivery": return 4;
      case "delivered": return 5;
      default: return 0;
    }
  };

  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.order_status || activeOrder.status) : 0;
  const isPendingApproval = (activeOrder?.order_status || activeOrder?.status) === "pending";

  const renderStatusBadge = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (s === "pending") {
      return (
        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", background: "#fef3c7", color: "#92400e", fontFamily: "var(--mono)", textTransform: "uppercase" }}>
          ⏳ Awaiting Approval
        </span>
      );
    }
    if (s === "confirmed" || s === "processing") {
      return (
        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", background: "#e0e7ff", color: "#3730a3", fontFamily: "var(--mono)", textTransform: "uppercase" }}>
          🎨 Mixing &amp; QC
        </span>
      );
    }
    if (s === "shipped" || s === "out_for_delivery") {
      return (
        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", background: "#dbeafe", color: "#1e40af", fontFamily: "var(--mono)", textTransform: "uppercase" }}>
          📦 In Transit
        </span>
      );
    }
    if (s === "delivered") {
      return (
        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", background: "#ecfdf5", color: "#047857", fontFamily: "var(--mono)", textTransform: "uppercase" }}>
          ✓ Delivered
        </span>
      );
    }
    return (
      <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", background: "#fee2e2", color: "#991b1b", fontFamily: "var(--mono)", textTransform: "uppercase" }}>
        ✕ Cancelled
      </span>
    );
  };

  const renderDeliveryBadge = (speed) => {
    if (speed === "urgent") {
      return (
        <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "99px", background: "#fee2e2", color: "#991b1b" }}>
          ⚡ Urgent 24h
        </span>
      );
    }
    if (speed === "fast") {
      return (
        <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "#e0e7ff", color: "#3730a3" }}>
          🚀 Fast Express
        </span>
      );
    }
    return (
      <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "99px", background: "#ecfdf5", color: "#047857" }}>
        🚚 Standard
      </span>
    );
  };

  return (
    <>
      <Navbar />

      <main className="track-order-page">
        {/* Hero Section */}
        <section className="track-hero">
          <div className="wrap">
            <p className="page-eyebrow">MY ORDERS &amp; LIVE TRACKING</p>
            <h1 className="track-title">Order Dashboard &amp; Live Tracker</h1>
            <p className="track-sub">
              View all your paint orders, real-time batch mixing progress, and click any item to read full specifications, reviews, and ratings!
            </p>

            {/* Quick Search */}
            <form className="track-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search by Order ID (e.g. DRIP-849201), Customer, City..."
                className="track-search-input"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-lg track-search-btn">
                🔍 Filter Orders
              </button>
            </form>

            {/* Filter Tabs */}
            <div className="track-filter-tabs">
              {[
                { id: "all", label: `All Orders (${allOrders.length})` },
                { id: "pending", label: "⏳ Awaiting Approval" },
                { id: "processing", label: "🎨 Mixing & QC" },
                { id: "shipped", label: "📦 In Transit" },
                { id: "delivered", label: "🏡 Delivered" },
                { id: "cancelled", label: "❌ Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`track-filter-btn ${statusFilter === tab.id ? "active" : ""}`}
                  onClick={() => setStatusFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="track-content-section">
          <div className="wrap">
            {/* VIEW 1: SINGLE ORDER DETAILED DRILLDOWN */}
            {activeOrder ? (
              <div className="track-details-wrapper">
                {/* Back to All Orders Button */}
                <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleBackToAllOrders}
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700" }}
                  >
                    ← View All Orders List
                  </button>
                  <span style={{ fontSize: "12px", color: "var(--ink-muted)", fontFamily: "var(--mono)" }}>
                    Showing Details for #{activeOrder.order_number || activeOrder.id}
                  </span>
                </div>

                {/* Status Banner */}
                <div className="track-status-banner">
                  <div className="track-banner-left">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span className="track-banner-tag">ORDER STATUS</span>
                      {renderStatusBadge(activeOrder.order_status || activeOrder.status)}
                      {renderDeliveryBadge(activeOrder.delivery_speed)}
                    </div>

                    <h2 className="track-banner-id">{activeOrder.order_number || `#${activeOrder.id}`}</h2>
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
                        <p>{activeOrder.order_status === "cancelled" ? "Order Cancelled" : activeOrder.estimated_delivery || "Within 2-3 business days"}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm track-print-btn"
                        onClick={() => window.print()}
                      >
                        🖨️ Print Invoice
                      </button>
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

                {/* Cancel Confirmation Modal */}
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
                      </p>
                      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setCancelConfirm(false)} disabled={cancelLoading}>
                          Keep Order
                        </button>
                        <button type="button" className="btn btn-danger" onClick={handleCancelOrder} disabled={cancelLoading}>
                          {cancelLoading ? "Cancelling..." : "Yes, Cancel Order"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancelled Alert Banner */}
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
                        This order has been cancelled. If any online payment was made, a refund will be processed within 5–7 business days.
                      </p>
                    </div>
                  </div>
                )}

                {/* Real-time Notice if Pending */}
                {isPendingApproval && (
                  <div style={{
                    background: "var(--surface)", border: "1.5px solid #fcd34d", borderRadius: "var(--r-xl)",
                    padding: "20px 24px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "var(--shadow-sm)"
                  }}>
                    <div style={{ fontSize: "32px", animation: "dot-pulse 1.2s infinite" }}>⏳</div>
                    <div>
                      <h4 style={{ fontFamily: "var(--display)", fontSize: "17px", fontWeight: "700", margin: 0, color: "#b45309" }}>
                        Order Under Review
                      </h4>
                      <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", margin: "4px 0 0", lineHeight: "1.5" }}>
                        Our fulfillment team is reviewing your order details and preparing your custom paint batch. This timeline updates automatically in real-time.
                      </p>
                    </div>
                  </div>
                )}

                {/* 6-Step Visual Timeline */}
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
                      const isAwaiting = idx === 1 && isPendingApproval;

                      return (
                        <div
                          key={step.id}
                          className={`track-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isAwaiting ? "awaiting" : ""}`}
                        >
                          <div className="track-step-marker">
                            <span className="track-step-icon">
                              {isCompleted ? "✓" : isAwaiting ? "⏳" : step.icon}
                            </span>
                          </div>
                          <div className="track-step-info">
                            <h4 className="track-step-title">{step.title}</h4>
                            <p className="track-step-desc">
                              {isAwaiting ? "Waiting for operations verification..." : step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="track-grid-2col">
                  {/* Shipment Info */}
                  <div className="track-card">
                    <h3 className="track-section-title">📦 Delivery &amp; Contact Info</h3>
                    <div className="track-info-list">
                      <div className="track-info-row">
                        <span>Courier:</span>
                        <strong>{activeOrder.courier || "TCS Express Logistics"}</strong>
                      </div>
                      <div className="track-info-row">
                        <span>Tracking Number:</span>
                        <strong style={{ fontFamily: "var(--mono)", color: "var(--cobalt)" }}>
                          {activeOrder.tracking_number || `TCS-${String(activeOrder.id).slice(0, 6)}`}
                        </strong>
                      </div>
                      <div className="track-info-row">
                        <span>Recipient Name:</span>
                        <strong>{activeOrder.recipient_name}</strong>
                      </div>
                      <div className="track-info-row">
                        <span>Delivery Address:</span>
                        <strong>{activeOrder.shipping_address}, {activeOrder.city}</strong>
                      </div>
                      <div className="track-info-row">
                        <span>Delivery Speed:</span>
                        <div>{renderDeliveryBadge(activeOrder.delivery_speed)}</div>
                      </div>
                      <div className="track-info-row">
                        <span>Payment Method:</span>
                        <strong>{activeOrder.payment_method || "Cash on Delivery"}</strong>
                      </div>
                      {activeOrder.notes && (
                        <div className="track-info-row">
                          <span>Special Notes:</span>
                          <span style={{ fontSize: "12.5px", color: "var(--ink-soft)" }}>{activeOrder.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary & CLICKABLE PRODUCTS */}
                  <div className="track-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <h3 className="track-section-title" style={{ margin: 0 }}>🛍️ Ordered Items ({(activeOrder.items || []).length})</h3>
                      <span style={{ fontSize: "11px", color: "var(--cobalt)", fontWeight: "700" }}>
                        Click item for 5★ Reviews
                      </span>
                    </div>

                    <div className="track-items-list" style={{ marginBottom: "16px" }}>
                      {(activeOrder.items || []).map((item, i) => {
                        const targetProductId = item.product_id || item.id || 1;
                        return (
                          <div
                            key={i}
                            className="track-item-card-interactive"
                            onClick={() => navigate(`/product/${targetProductId}`)}
                            style={{ cursor: "pointer" }}
                            title="Click to view complete product details, reviews, and ratings"
                          >
                            <img
                              src={item.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200"}
                              alt={item.name}
                              style={{ width: "52px", height: "52px", objectFit: "contain", borderRadius: "8px", background: "var(--canvas)", padding: "4px", flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: "14px", color: "var(--ink)", display: "block", marginBottom: "2px" }}>
                                {item.name || "DRIP Premium Paint"}
                              </strong>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                                  Qty: {item.quantity || 1} {item.unit || ""} · Rs. {Number(item.price || 2450).toLocaleString()}
                                </span>
                                <button
                                  type="button"
                                  className="track-product-link-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/product/${targetProductId}`);
                                  }}
                                >
                                  ✦ View Reviews &amp; Specs →
                                </button>
                              </div>
                            </div>
                            <span style={{ fontWeight: "700", fontFamily: "var(--ui)", fontSize: "15px", color: "var(--ink)" }}>
                              Rs. {((Number(item.price) || 2450) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="track-divider" />

                    {/* Financial Totals */}
                    <div className="track-totals-box">
                      <div className="track-total-row">
                        <span>Subtotal:</span>
                        <span>Rs. {(activeOrder.subtotal || activeOrder.total || 0).toLocaleString()}</span>
                      </div>
                      <div className="track-total-row">
                        <span>Shipping ({activeOrder.delivery_speed === "urgent" ? "Urgent ⚡" : activeOrder.delivery_speed === "fast" ? "Fast 🚀" : "Standard 🚚"}):</span>
                        <span style={{ color: Number(activeOrder.shipping || 0) === 0 ? "var(--sage)" : "var(--ink)", fontWeight: "600" }}>
                          {Number(activeOrder.shipping || 0) === 0 ? "FREE" : `Rs. ${Number(activeOrder.shipping).toLocaleString()}`}
                        </span>
                      </div>
                      {Number(activeOrder.discount || 0) > 0 && (
                        <div className="track-total-row" style={{ color: "var(--sage)", fontWeight: "600" }}>
                          <span>Promo Discount:</span>
                          <span>-Rs. {Number(activeOrder.discount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="track-total-row grand">
                        <span>Grand Total:</span>
                        <span style={{ color: "var(--cobalt)" }}>Rs. {(activeOrder.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Support Help Banner */}
                <div className="track-help-banner">
                  <div>
                    <h4>Need immediate assistance with your paint delivery?</h4>
                    <p>Our paint laboratory and logistics dispatch team is online 9:00 AM – 9:00 PM.</p>
                  </div>
                  <a
                    href={`https://wa.me/923001234567?text=Hi%20Drip%20Team%2C%20I%20have%20an%20inquiry%20regarding%20Order%20${activeOrder.order_number || activeOrder.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    💬 WhatsApp Live Support
                  </a>
                </div>
              </div>
            ) : (
              /* VIEW 2: ALL ORDERS GRID / LIST VIEW */
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--display)", fontSize: "24px", margin: 0 }}>
                      Customer Order History ({filteredOrders.length})
                    </h2>
                    <p style={{ fontSize: "14px", color: "var(--ink-soft)", margin: "4px 0 0" }}>
                      Click on any order to view its live step-by-step dispatch timeline and click items for full specifications and reviews.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => loadOrdersList()}
                  >
                    ↺ Refresh Orders
                  </button>
                </div>

                {loading ? (
                  <div className="empty-state" style={{ padding: "60px 0" }}>
                    <div className="empty-state-icon" style={{ animation: "dot-pulse 1s infinite" }}>📦</div>
                    <h3>Loading Orders...</h3>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="empty-state" style={{ padding: "60px 0" }}>
                    <div className="empty-state-icon">🛍️</div>
                    <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", marginBottom: "8px" }}>
                      No Orders Found
                    </h3>
                    <p style={{ color: "var(--ink-soft)", marginBottom: "20px" }}>
                      {orderQuery ? `No orders matched "${orderQuery}".` : "You haven't placed any orders in this category yet."}
                    </p>
                    <Button text="Browse Paint Shop →" className="btn btn-primary" onClick={() => navigate("/shop")} />
                  </div>
                ) : (
                  <div className="track-orders-grid">
                    {filteredOrders.map((ord) => {
                      const orderNum = ord.order_number || `#${String(ord.id).slice(0, 8)}`;
                      const itemsCount = (ord.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0) || (ord.items || []).length || 1;

                      return (
                        <div key={ord.id || ord.order_number} className="track-order-card">
                          <div>
                            {/* Card Header */}
                            <div className="track-order-card-header">
                              <div>
                                <h3 style={{ fontFamily: "var(--mono)", fontSize: "18px", fontWeight: "700", margin: "0 0 4px", color: "var(--cobalt)" }}>
                                  {orderNum}
                                </h3>
                                <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                                  {new Date(ord.created_at || Date.now()).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                                {renderStatusBadge(ord.order_status || ord.status)}
                                {renderDeliveryBadge(ord.delivery_speed)}
                              </div>
                            </div>

                            {/* Customer & City */}
                            <div style={{ marginBottom: "14px", fontSize: "13px", color: "var(--ink-soft)" }}>
                              <strong style={{ color: "var(--ink)" }}>{ord.recipient_name || "Customer"}</strong> · {ord.city || "Karachi"}
                            </div>

                            {/* Items Thumbnails & Summary */}
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", background: "var(--canvas-dark)", padding: "10px 12px", borderRadius: "var(--r-md)" }}>
                              <div style={{ display: "flex", marginRight: "6px" }}>
                                {(ord.items || []).slice(0, 3).map((item, idx) => (
                                  <img
                                    key={idx}
                                    src={item.image || "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100"}
                                    alt={item.name}
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      objectFit: "contain",
                                      borderRadius: "6px",
                                      background: "#ffffff",
                                      border: "1px solid var(--paper-line)",
                                      marginLeft: idx > 0 ? "-10px" : 0,
                                      boxShadow: "var(--shadow-sm)",
                                    }}
                                  />
                                ))}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--ink)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {ord.items?.[0]?.name || "Paint Products"} {ord.items?.length > 1 ? `+${ord.items.length - 1} more` : ""}
                                </p>
                                <span style={{ fontSize: "11.5px", color: "var(--ink-muted)" }}>{itemsCount} {itemsCount === 1 ? "item" : "items"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div style={{ borderTop: "1px solid var(--paper-line)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <span style={{ fontSize: "11px", color: "var(--ink-muted)", display: "block", textTransform: "uppercase" }}>Total Amount</span>
                              <strong style={{ fontFamily: "var(--ui)", fontSize: "16px", color: "var(--ink)" }}>
                                Rs. {Number(ord.total || ord.total_amount || 0).toLocaleString()}
                              </strong>
                            </div>

                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSelectOrder(ord)}
                            >
                              View Order &amp; Track →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
