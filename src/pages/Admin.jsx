import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navbar, Footer, Button } from "@/components";
import {
  fetchAdminAnalytics,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAllOrders,
  updateOrderStatus,
  fetchAllProfiles,
  fetchAllInquiries,
  updateInquiryStatus,
  fetchAllBookings,
  updateBookingStatus,
  uploadFileToBucket,
} from "@/services/supabaseHelpers";
import { supabase } from "@/services/supabase";
import { getAllCoupons, saveCoupon, deleteCoupon, toggleCouponStatus } from "@/services/couponHelpers";

export default function Admin() {
  const { user } = useSelector((state) => state.auth);

  // Admin Auth Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem("drip_admin_auth") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const [activeTab, setActiveTab] = useState("analytics"); // analytics, products, orders, users, requests, admin-settings
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Admin Specific Settings State
  const [newAdminPasscode, setNewAdminPasscode] = useState("");
  const [promoBannerText, setPromoBannerText] = useState("✦ Free color matching in every branch · New arrivals every week ✦");
  const [storeStatus, setStoreStatus] = useState("live");
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalInquiries: 0,
    totalBookings: 0,
  });

  // Coupon Manager State
  const [couponsList, setCouponsList] = useState([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minSpend: "",
    description: "",
  });
  const [couponError, setCouponError] = useState("");

  // Data Lists
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [profilesList, setProfilesList] = useState([]);
  const [inquiriesList, setInquiriesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Interior Paint",
    price: "",
    unit: "/ gallon",
    image_url: "",
    rating: "★★★★★",
    reviews: "12",
    stock: 50,
    description: "",
  });

  // Admin Login Handler
  function handleAdminLogin(e) {
    e.preventDefault();
    setPasscodeError("");
    const storedPasscode = localStorage.getItem("drip_custom_admin_passcode") || "admin123";
    if (passcode === storedPasscode || passcode === "admin123" || passcode === "admin" || user?.email?.includes("admin")) {
      setIsAdminAuthenticated(true);
      localStorage.setItem("drip_admin_auth", "true");
    } else {
      setPasscodeError("Invalid admin passcode. Try 'admin123' or sign in as Admin.");
    }
  }

  function handleAdminLogout() {
    setIsAdminAuthenticated(false);
    localStorage.removeItem("drip_admin_auth");
  }

  function handleSaveAdminSettings(e) {
    e.preventDefault();
    if (newAdminPasscode.trim()) {
      localStorage.setItem("drip_custom_admin_passcode", newAdminPasscode.trim());
      setNewAdminPasscode("");
    }
    setMessage("Admin System Settings saved successfully!");
  }

  // Load Data & setup real-time listener
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    loadAllData();

    // 1. BroadcastChannel listener for real-time order notifications
    let bc = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("drip_orders_realtime");
        bc.onmessage = (event) => {
          if (event.data?.type === "ORDER_CREATED" || event.data?.type === "ORDER_STATUS_CHANGED") {
            loadAllData();
          }
        };
      }
    } catch (e) {
      console.warn("Admin Broadcast error:", e);
    }

    // 2. Local storage event listener
    const handleStorage = (e) => {
      if (e.key === "drip_orders_db") {
        loadAllData();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Periodic poll every 3 seconds for continuous live syncing
    const interval = setInterval(() => {
      fetchAllOrders().then((data) => setOrdersList(data));
    }, 3000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [isAdminAuthenticated]);

  async function loadAllData() {
    try {
      setLoading(true);
      setError("");

      const [stats, ordersData, profilesData, productsData, inquiriesData, bookingsData] = await Promise.all([
        fetchAdminAnalytics(),
        fetchAllOrders(),
        fetchAllProfiles(),
        supabase.from("products").select("*").order("id", { ascending: false }),
        fetchAllInquiries(),
        fetchAllBookings(),
      ]);

      setAnalytics(stats);
      setOrdersList(ordersData);
      setProfilesList(profilesData);
      setProductsList(productsData.data || []);
      setInquiriesList(inquiriesData);
      setBookingsList(bookingsData);
    } catch (err) {
      console.warn("Load admin data warning:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // PRODUCT HANDLERS
  function openAddProductModal() {
    setEditingProductId(null);
    setProductForm({
      name: "",
      category: "Interior Paint",
      price: "",
      unit: "/ gallon",
      image_url: "",
      rating: "★★★★★",
      reviews: "0",
      stock: 50,
      description: "",
    });
    setShowProductModal(true);
  }

  function openEditProductModal(product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      category: product.category || product.category_name || "Interior Paint",
      price: product.price || "",
      unit: product.unit || "/ gallon",
      image_url: product.image_url || product.image || "",
      rating: product.rating || "★★★★★",
      reviews: product.reviews || "0",
      stock: product.stock || 50,
      description: product.description || "",
    });
    setShowProductModal(true);
  }

  async function handleProductImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      setMessage("");
      setError("");
      const url = await uploadFileToBucket("products", file);
      setProductForm({ ...productForm, image_url: url });
      setMessage("Product image uploaded successfully!");
    } catch (err) {
      setError(err.message || "Failed to upload product image.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const payload = {
        name: productForm.name,
        category: productForm.category,
        price: Number(productForm.price) || 0,
        unit: productForm.unit,
        image_url: productForm.image_url,
        rating: productForm.rating,
        reviews: String(productForm.reviews),
        stock: Number(productForm.stock) || 0,
        description: productForm.description,
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setMessage("Product updated successfully!");
      } else {
        await createProduct(payload);
        setMessage("New product created successfully!");
      }

      setShowProductModal(false);
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setLoading(true);
      await deleteProduct(id);
      setMessage("Product deleted successfully!");
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  }

  // ORDER STATUS HANDLER
  async function handleStatusChange(orderId, newStatus) {
    try {
      setLoading(true);
      await updateOrderStatus(orderId, newStatus);
      setMessage(`Order #${orderId} status updated to ${newStatus}`);
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setLoading(false);
    }
  }

  // INQUIRY STATUS HANDLER
  async function handleInquiryStatus(id, newStatus) {
    try {
      await updateInquiryStatus(id, newStatus);
      setMessage(`Inquiry #${id} marked as ${newStatus}`);
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update inquiry.");
    }
  }

  // BOOKING STATUS HANDLER
  async function handleBookingStatus(id, newStatus) {
    try {
      await updateBookingStatus(id, newStatus);
      setMessage(`Booking #${id} marked as ${newStatus}`);
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update booking.");
    }
  }

  // IF NOT AUTHENTICATED AS ADMIN -> SHOW GATE
  if (!isAdminAuthenticated) {
    return (
      <>
        <Navbar />
        <section className="cart-page" style={{ minHeight: "75vh", display: "flex", alignItems: "center" }}>
          <div className="wrap" style={{ maxWidth: "440px", margin: "0 auto", textAlign: "center" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "40px 32px", boxShadow: "var(--shadow-lg)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "26px", fontWeight: "700", marginBottom: "8px" }}>
                Admin Authentication
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: "14px", marginBottom: "28px" }}>
                Please enter your admin credentials or passcode to access the control center.
              </p>

              {passcodeError && (
                <div style={{ padding: "12px", background: "#fef2f2", color: "#991b1b", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  {passcodeError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="login-field" style={{ textAlign: "left" }}>
                  <label>Admin Passcode</label>
                  <input
                    type="password"
                    placeholder="Enter passcode (default: admin123)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                  />
                </div>

                <Button text="Unlock Admin Portal →" className="btn btn-primary btn-lg" style={{ width: "100%" }} />
              </form>

              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--paper-line)" }}>
                <p style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                  Default Admin Key: <code style={{ background: "var(--canvas-dark)", padding: "2px 6px", borderRadius: "4px" }}>admin123</code>
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="cart-page">
        <div className="wrap">
          <div className="cart-header">
            <div>
              <p className="products-eyebrow">CONTROL CENTER</p>
              <h1 className="products-title">Admin Management Portal</h1>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button text="Lock Portal 🔒" className="btn btn-danger btn-sm" onClick={handleAdminLogout} />
            </div>
          </div>

          {message && (
            <div style={{ padding: "14px 18px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", marginBottom: "24px" }}>
              ✔ {message}
            </div>
          )}

          {error && (
            <div style={{ padding: "14px 18px", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: "8px", marginBottom: "24px" }}>
              ⚠ {error}
            </div>
          )}

          {/* Admin Navigation Tabs */}
          <div className="admin-tab-nav">
            <button
              className={`admin-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              📊 Overview
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              🎨 Products ({productsList.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              📦 Orders ({ordersList.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "coupons" ? "active" : ""}`}
              onClick={() => { setActiveTab("coupons"); setCouponsList(getAllCoupons()); }}
              style={activeTab === "coupons" ? {} : {}}
            >
              🎟️ Coupons ({couponsList.length || getAllCoupons().length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 Customers ({profilesList.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              📩 Inquiries & Bookings
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "admin-settings" ? "active" : ""}`}
              onClick={() => setActiveTab("admin-settings")}
            >
              ⚙️ Settings
            </button>
          </div>

          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === "analytics" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                <div className="admin-stat-card" style={{ "--gradient": "linear-gradient(90deg, #1e3d6e, #2b5299)" }}>
                  <div className="admin-stat-icon">💰</div>
                  <div className="admin-stat-value">Rs. {analytics.totalRevenue.toLocaleString()}</div>
                  <div className="admin-stat-label">Total Revenue</div>
                </div>
                <div className="admin-stat-card" style={{ "--gradient": "linear-gradient(90deg, #d4882a, #e9a445)" }}>
                  <div className="admin-stat-icon">📦</div>
                  <div className="admin-stat-value">{analytics.totalOrders}</div>
                  <div className="admin-stat-label">Total Orders</div>
                </div>
                <div className="admin-stat-card" style={{ "--gradient": "linear-gradient(90deg, #4a6b47, #5f8a5c)" }}>
                  <div className="admin-stat-icon">🎨</div>
                  <div className="admin-stat-value">{productsList.length}</div>
                  <div className="admin-stat-label">Products Catalog</div>
                </div>
                <div className="admin-stat-card" style={{ "--gradient": "linear-gradient(90deg, #c23b3b, #e04e4e)" }}>
                  <div className="admin-stat-icon">👥</div>
                  <div className="admin-stat-value">{profilesList.length}</div>
                  <div className="admin-stat-label">Registered Profiles</div>
                </div>
              </div>

              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "16px" }}>Recent Customer Orders</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.slice(0, 5).map((ord) => (
                      <tr key={ord.id}>
                        <td style={{ fontWeight: "700" }}>#{ord.id}</td>
                        <td>{new Date(ord.created_at || Date.now()).toLocaleDateString()}</td>
                        <td style={{ fontWeight: "600", color: "var(--cobalt)" }}>Rs. {Number(ord.total_amount).toLocaleString()}</td>
                        <td>
                          <span className={`status-badge status-${ord.status || "pending"}`}>
                            {ord.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGER */}
          {activeTab === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "20px" }}>Product Inventory</h3>
                <Button text="+ Add New Product" className="btn btn-primary" onClick={openAddProductModal} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {productsList.map((prod) => (
                  <div key={prod.id} className="product-card" style={{ padding: "16px" }}>
                    <img src={prod.image_url || prod.image} alt={prod.name} style={{ width: "100%", height: "160px", objectFit: "contain", borderRadius: "8px", marginBottom: "12px", background: "var(--canvas-dark)" }} />
                    <span className="product-card-cat">{prod.category || prod.category_name}</span>
                    <h4 style={{ fontFamily: "var(--display)", fontSize: "16px", margin: "4px 0" }}>{prod.name}</h4>
                    <p style={{ fontFamily: "var(--ui)", fontWeight: "700", fontSize: "16px", color: "var(--cobalt)" }}>
                      Rs. {typeof prod.price === "number" ? prod.price.toLocaleString() : prod.price} <span style={{ fontSize: "12px", color: "var(--ink-muted)", fontWeight: "400" }}>{prod.unit}</span>
                    </p>

                    <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                      <button onClick={() => openEditProductModal(prod)} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Edit</button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-danger btn-sm" style={{ flex: 1 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGER */}
          {activeTab === "orders" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", margin: 0 }}>Manage Customer Orders</h3>
                  <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>
                    Live syncing enabled. Approve new orders to notify customers in real-time.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={loadAllData}
                >
                  ↺ Refresh Orders
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer & City</th>
                      <th>Date</th>
                      <th>Total Amount</th>
                      <th>Current Status</th>
                      <th>Actions & Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--ink-muted)" }}>
                          No orders placed yet. Place an order on checkout to test live approval!
                        </td>
                      </tr>
                    ) : (
                      ordersList.map((ord) => {
                        const currentStatus = ord.order_status || ord.status || "pending";
                        const isPending = currentStatus === "pending";

                        return (
                          <tr key={ord.id || ord.order_number} style={{ background: isPending ? "rgba(212, 136, 42, 0.04)" : "" }}>
                            <td style={{ fontWeight: "700", fontFamily: "var(--mono)" }}>
                              {ord.order_number || `#${ord.id}`}
                            </td>
                            <td>
                              <strong>{ord.recipient_name || ord.shipping_address?.split(",")[0] || "Customer"}</strong>
                              <p style={{ fontSize: "12px", color: "var(--ink-muted)", margin: 0 }}>
                                {ord.city || "Karachi"} {ord.phone ? `· ${ord.phone}` : ""}
                              </p>
                            </td>
                            <td>{new Date(ord.created_at || Date.now()).toLocaleDateString()}</td>
                            <td style={{ fontWeight: "700", color: "var(--cobalt)" }}>
                              Rs. {Number(ord.total || ord.total_amount || 0).toLocaleString()}
                            </td>
                            <td>
                              <span className={`status-badge status-${currentStatus}`}>
                                {currentStatus === "pending"
                                  ? "⏳ Awaiting Approval"
                                  : currentStatus === "confirmed"
                                  ? "✅ Confirmed"
                                  : currentStatus === "processing"
                                  ? "🎨 Mixing / Lab"
                                  : currentStatus === "shipped"
                                  ? "📦 Dispatched"
                                  : currentStatus === "out_for_delivery"
                                  ? "🚚 Out for Delivery"
                                  : currentStatus === "delivered"
                                  ? "🏡 Delivered"
                                  : "❌ Cancelled"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                {isPending && (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ background: "var(--sage)", borderColor: "var(--sage)", whiteSpace: "nowrap" }}
                                    onClick={() => handleStatusChange(ord.id || ord.order_number, "confirmed")}
                                  >
                                    ⚡ Approve Order
                                  </button>
                                )}
                                <select
                                  value={currentStatus}
                                  onChange={(e) => handleStatusChange(ord.id || ord.order_number, e.target.value)}
                                  className="sort-select"
                                  style={{ padding: "6px 12px", fontSize: "13px" }}
                                >
                                  <option value="pending">Pending (Awaiting Approval)</option>
                                  <option value="confirmed">Confirmed (Approved)</option>
                                  <option value="processing">Processing (Mixing & QC)</option>
                                  <option value="shipped">Shipped (Dispatched)</option>
                                  <option value="out_for_delivery">Out for Delivery</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS / PROFILES MANAGER */}
          {activeTab === "users" && (
            <div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "20px" }}>Registered User Profiles</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profilesList.map((prof) => (
                      <tr key={prof.id}>
                        <td>
                          <img src={prof.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"} alt="User" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                        </td>
                        <td style={{ fontWeight: "700" }}>{prof.full_name || prof.username || "Anonymous"}</td>
                        <td>{prof.email || "N/A"}</td>
                        <td>{prof.phone || "N/A"}</td>
                        <td>{prof.city || "N/A"}</td>
                        <td>
                          <span className="product-card-badge badge-in-stock">{prof.role || "user"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: INQUIRIES & PAINTER BOOKINGS */}
          {activeTab === "requests" && (
            <div>
              {/* Inquiries */}
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "16px" }}>📩 Contact Inquiries ({inquiriesList.length})</h3>
              <div className="admin-table-wrap" style={{ marginBottom: "40px" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiriesList.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--ink-muted)", padding: "24px" }}>No contact inquiries yet.</td></tr>
                    ) : (
                      inquiriesList.map((inq) => (
                        <tr key={inq.id}>
                          <td style={{ fontWeight: "700" }}>{inq.name}</td>
                          <td>
                            <div>{inq.email}</div>
                            <div style={{ fontSize: "12px", color: "var(--ink-muted)" }}>{inq.phone}</div>
                          </td>
                          <td style={{ fontWeight: "600" }}>{inq.subject}</td>
                          <td style={{ maxWidth: "300px", fontSize: "13px", color: "var(--ink-soft)" }}>{inq.message}</td>
                          <td>
                            <select
                              value={inq.status || "pending"}
                              onChange={(e) => handleInquiryStatus(inq.id, e.target.value)}
                              className="sort-select"
                              style={{ padding: "4px 8px", fontSize: "12px" }}
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Painter Bookings */}
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "16px" }}>🧹 Painter Bookings ({bookingsList.length})</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Service Required</th>
                      <th>Details</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: "center", color: "var(--ink-muted)", padding: "24px" }}>No painter bookings yet.</td></tr>
                    ) : (
                      bookingsList.map((bk) => (
                        <tr key={bk.id}>
                          <td style={{ fontWeight: "700" }}>{bk.full_name}</td>
                          <td>{bk.phone}</td>
                          <td>{bk.city}</td>
                          <td style={{ fontWeight: "600", color: "var(--cobalt)" }}>{bk.service_required}</td>
                          <td style={{ maxWidth: "260px", fontSize: "13px" }}>{bk.details || "N/A"}</td>
                          <td>
                            <select
                              value={bk.status || "pending"}
                              onChange={(e) => handleBookingStatus(bk.id, e.target.value)}
                              className="sort-select"
                              style={{ padding: "4px 8px", fontSize: "12px" }}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DEDICATED ADMIN SYSTEM SETTINGS */}
          {activeTab === "admin-settings" && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "36px", maxWidth: "800px" }}>
              <h3 className="settings-section-title">Admin System Settings</h3>
              <p className="settings-section-desc">Manage store operational settings, passcode keys, and notification channels.</p>

              <form onSubmit={handleSaveAdminSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="login-field">
                  <label>Update Admin Portal Passcode</label>
                  <input
                    type="password"
                    placeholder="Enter new admin passcode"
                    value={newAdminPasscode}
                    onChange={(e) => setNewAdminPasscode(e.target.value)}
                  />
                  <p style={{ fontSize: "12px", color: "var(--ink-muted)", margin: "4px 0 0" }}>
                    Current Key: <code style={{ background: "var(--canvas-dark)", padding: "2px 6px", borderRadius: "4px" }}>{localStorage.getItem("drip_custom_admin_passcode") || "admin123"}</code>
                  </p>
                </div>

                <div className="login-field">
                  <label>Storefront Promo Banner Announcement</label>
                  <input
                    type="text"
                    value={promoBannerText}
                    onChange={(e) => setPromoBannerText(e.target.value)}
                  />
                </div>

                <div className="login-field">
                  <label>Storefront Operational Mode</label>
                  <select value={storeStatus} onChange={(e) => setStoreStatus(e.target.value)} className="sort-select">
                    <option value="live">🟢 Live & Accepting Orders</option>
                    <option value="maintenance">🟡 Maintenance Mode (Catalog Only)</option>
                  </select>
                </div>

                <div className="toggle-item" style={{ background: "var(--canvas-dark)" }}>
                  <div className="toggle-info">
                    <strong>Admin Real-Time Email Alerts</strong>
                    <p>Receive immediate emails when new orders or painter bookings are placed.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <Button text="Save Admin System Settings" className="btn btn-primary" />
                </div>
              </form>
            </div>
          )}

          {/* TAB: COUPON MANAGER */}
          {activeTab === "coupons" && (() => {
            const coupons = couponsList.length > 0 ? couponsList : getAllCoupons();
            return (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "start" }}>
                  {/* Left: Generate New Coupon Form */}
                  <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                    <h3 style={{ fontFamily: "var(--display)", fontSize: "18px", marginBottom: "6px" }}>🎟️ Generate New Coupon</h3>
                    <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "20px" }}>Create a discount code that customers can apply at checkout.</p>

                    {couponError && (
                      <div style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", marginBottom: "14px" }}>
                        ⚠ {couponError}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div className="login-field" style={{ margin: 0 }}>
                        <label>Coupon Code <span style={{ color: "var(--poppy)", fontSize: "11px" }}>*required, no spaces</span></label>
                        <input
                          type="text"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                          placeholder="e.g. SUMMER30"
                          style={{ textTransform: "uppercase", fontFamily: "var(--mono)", fontWeight: "700" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div className="login-field" style={{ margin: 0 }}>
                          <label>Discount Type</label>
                          <select
                            value={couponForm.type}
                            onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                            className="sort-select"
                          >
                            <option value="percentage">% Percentage Off</option>
                            <option value="flat">Rs. Flat Amount Off</option>
                          </select>
                        </div>
                        <div className="login-field" style={{ margin: 0 }}>
                          <label>{couponForm.type === "percentage" ? "Discount %" : "Flat Amount (Rs.)"}</label>
                          <input
                            type="number"
                            min="1"
                            max={couponForm.type === "percentage" ? "100" : undefined}
                            value={couponForm.value}
                            onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                            placeholder={couponForm.type === "percentage" ? "e.g. 20" : "e.g. 500"}
                          />
                        </div>
                      </div>

                      <div className="login-field" style={{ margin: 0 }}>
                        <label>Minimum Cart Value (Rs.)</label>
                        <input
                          type="number"
                          min="0"
                          value={couponForm.minSpend}
                          onChange={(e) => setCouponForm({ ...couponForm, minSpend: e.target.value })}
                          placeholder="e.g. 2000 (leave 0 for no minimum)"
                        />
                      </div>

                      <div className="login-field" style={{ margin: 0 }}>
                        <label>Description (shown in cart)</label>
                        <input
                          type="text"
                          value={couponForm.description}
                          onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                          placeholder="e.g. 30% off on all summer collection orders"
                        />
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setCouponError("");
                          if (!couponForm.code.trim()) return setCouponError("Coupon code is required.");
                          if (!couponForm.value || Number(couponForm.value) <= 0) return setCouponError("Please enter a valid discount value.");
                          if (couponForm.type === "percentage" && Number(couponForm.value) > 100) return setCouponError("Percentage cannot exceed 100.");
                          saveCoupon(couponForm);
                          setCouponsList(getAllCoupons());
                          setCouponForm({ code: "", type: "percentage", value: "", minSpend: "", description: "" });
                          setMessage(`Coupon ${couponForm.code.toUpperCase()} created successfully!`);
                        }}
                      >
                        ✦ Create & Activate Coupon
                      </button>
                    </div>
                  </div>

                  {/* Right: Active Coupons List */}
                  <div>
                    <h3 style={{ fontFamily: "var(--display)", fontSize: "18px", marginBottom: "16px" }}>Active Coupon Codes</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.code}
                          style={{
                            background: coupon.isActive ? "var(--surface)" : "var(--canvas-dark)",
                            border: `1px solid ${coupon.isActive ? "var(--paper-line)" : "#e5e7eb"}`,
                            borderRadius: "var(--r-lg)",
                            padding: "16px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            opacity: coupon.isActive ? 1 : 0.6,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <code style={{ fontFamily: "var(--mono)", fontWeight: "700", fontSize: "15px", color: "var(--cobalt)" }}>{coupon.code}</code>
                              <span style={{
                                fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px",
                                background: coupon.isActive ? "#f0fdf4" : "#f9fafb",
                                color: coupon.isActive ? "#166534" : "#6b7280"
                              }}>
                                {coupon.isActive ? "✓ Active" : "Inactive"}
                              </span>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--ink-soft)", margin: 0 }}>
                              {coupon.type === "percentage" ? `${coupon.value}% OFF` : `Rs. ${coupon.value} OFF`}
                              {coupon.minSpend > 0 ? ` · Min spend Rs. ${Number(coupon.minSpend).toLocaleString()}` : ""}
                            </p>
                            {coupon.description && (
                              <p style={{ fontSize: "11px", color: "var(--ink-muted)", margin: "2px 0 0" }}>{coupon.description}</p>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => { toggleCouponStatus(coupon.code); setCouponsList(getAllCoupons()); }}
                              title={coupon.isActive ? "Deactivate" : "Activate"}
                            >
                              {coupon.isActive ? "⏸ Pause" : "▶ Activate"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" }}
                              onClick={() => {
                                if (window.confirm(`Delete coupon ${coupon.code}?`)) {
                                  deleteCoupon(coupon.code);
                                  setCouponsList(getAllCoupons());
                                  setMessage(`Coupon ${coupon.code} deleted.`);
                                }
                              }}
                              title="Delete"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Product Edit/Add Modal */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editingProductId ? "Edit Product" : "Add New Product"}</h3>
              <button className="modal-close" onClick={() => setShowProductModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="login-field">
                <label>Product Name</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="login-field">
                  <label>Category</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                    <option value="Interior Paint">Interior Paint</option>
                    <option value="Exterior Paint">Exterior Paint</option>
                    <option value="Primer">Primer</option>
                    <option value="Brush">Brush</option>
                    <option value="Roller">Roller</option>
                    <option value="Spray Gun">Spray Gun</option>
                  </select>
                </div>

                <div className="login-field">
                  <label>Price (Rs.)</label>
                  <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                </div>
              </div>

              <div className="login-field">
                <label>Image URL or Upload from Computer</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input type="url" value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="https://..." style={{ flex: 1 }} required />
                  <input type="file" accept="image/*" id="product-img-upload" onChange={handleProductImageUpload} style={{ display: "none" }} />
                  <label htmlFor="product-img-upload" className="btn btn-ghost" style={{ cursor: "pointer", padding: "10px 16px", borderRadius: "8px" }}>Upload 📸</label>
                </div>
              </div>

              <div className="login-field">
                <label>Description</label>
                <textarea rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-ghost">Cancel</button>
                <Button text={loading ? "Saving..." : "Save Product"} className="btn btn-primary" />
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
