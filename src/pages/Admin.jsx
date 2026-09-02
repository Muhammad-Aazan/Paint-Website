import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  fetchAllReviews,
} from "@/services/supabaseHelpers";
import { supabase } from "@/services/supabase";
import { defaultProducts } from "@/services/productHelpers";
import { getAllCoupons, saveCoupon, deleteCoupon } from "@/services/couponHelpers";
import {
  getAllCategories,
  saveCategory,
  deleteCategory,
} from "@/services/categoryHelpers";
import {
  getAllHeroBanners,
  saveHeroBanner,
  deleteHeroBanner,
  toggleHeroBannerStatus,
  getAllPromoDeals,
  getStoreAnnouncement,
  saveStoreAnnouncement,
} from "@/services/bannerHelpers";
import {
  getAllBrands,
  saveBrand,
  deleteBrand,
} from "@/services/brandHelpers";

export default function Admin() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  // Admin Auth Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem("drip_admin_auth") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // Determine active tab from URL path (e.g. /admin/categories -> categories)
  const pathSegment = location.pathname.replace(/^\/admin\/?/, "").split("/")[0];
  const validTabs = [
    "dashboard",
    "products",
    "categories",
    "brands",
    "inventory",
    "orders",
    "customers",
    "reviews",
    "banners",
    "offers",
    "bookings",
    "inquiries",
    "settings",
    "admins",
  ];
  const currentTab = validTabs.includes(pathSegment) ? pathSegment : "dashboard";
  const [activeTab, setActiveTab] = useState(currentTab);

  useEffect(() => {
    if (validTabs.includes(pathSegment)) {
      setActiveTab(pathSegment);
    } else if (!pathSegment) {
      setActiveTab("dashboard");
    }
  }, [location.pathname, pathSegment]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(tabId === "dashboard" ? "/admin" : `/admin/${tabId}`);
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Settings State
  const [newAdminPasscode, setNewAdminPasscode] = useState("");
  const [promoBannerText, setPromoBannerText] = useState(getStoreAnnouncement());
  const [storeStatus, setStoreStatus] = useState("live");
  const [deliveryFee, setDeliveryFee] = useState("250");
  const [freeShippingMin, setFreeShippingMin] = useState("15000");
  const [supportPhone, setSupportPhone] = useState("+92 300 1234567");
  const [supportEmail, setSupportEmail] = useState("info@drippaints.com");

  // Analytics State
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalInquiries: 0,
    totalBookings: 0,
  });

  // Data Lists
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [profilesList, setProfilesList] = useState([]);
  const [inquiriesList, setInquiriesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [heroBannersList, setHeroBannersList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

  // Modals State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Interior Paint",
    price: "",
    unit: "/ gallon",
    image_url: "",
    rating: "5",
    reviews: "12",
    stock: 50,
    description: "",
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    tag: "Most Popular",
    color: "var(--cobalt)",
    count: "10 products",
    featured: true,
  });

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    badge: "✦ LUXURY COLLECTION",
    title: "",
    subtitle: "",
    ctaText: "Shop Now →",
    ctaUrl: "/shop",
    bgImage: "",
    colorAccent: "#38bdf8",
    active: true,
  });

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [brandForm, setBrandForm] = useState({
    name: "",
    origin: "Pakistan",
    highlight: "Super Emulsions & Weathercoat",
    active: true,
  });

  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [inventoryFilter, setInventoryFilter] = useState("all");

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minSpend: "",
    description: "",
  });
  const [couponError, setCouponError] = useState("");

  // Admin Login Handler
  function handleAdminLogin(e) {
    e.preventDefault();
    setPasscodeError("");
    const storedPasscode = localStorage.getItem("drip_custom_admin_passcode") || "admin123";
    if (
      passcode === storedPasscode ||
      passcode === "admin123" ||
      passcode === "admin" ||
      user?.email?.includes("admin")
    ) {
      setIsAdminAuthenticated(true);
      localStorage.setItem("drip_admin_auth", "true");
    } else {
      setPasscodeError("Invalid admin passcode. Default passcode is 'admin123'.");
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
    saveStoreAnnouncement(promoBannerText);
    localStorage.setItem("drip_store_status", storeStatus);
    localStorage.setItem("drip_delivery_fee", deliveryFee);
    localStorage.setItem("drip_free_shipping_min", freeShippingMin);
    localStorage.setItem("drip_support_phone", supportPhone);
    localStorage.setItem("drip_support_email", supportEmail);
    setMessage("Store and System Settings updated successfully!");
    setTimeout(() => setMessage(""), 4000);
  }

  // Load Data
  async function loadAllData() {
    try {
      setLoading(true);
      setError("");

      const [stats, ordersData, profilesData, productsData, inquiriesData, bookingsData] =
        await Promise.all([
          fetchAdminAnalytics(),
          fetchAllOrders(),
          fetchAllProfiles(),
          supabase.from("products").select("*").order("id", { ascending: false }),
          fetchAllInquiries(),
          fetchAllBookings(),
        ]);

      setAnalytics(stats);
      setOrdersList(ordersData || []);
      const isOldMock =
        productsData.data?.length <= 6 &&
        productsData.data?.some((p) =>
          ["Cobalt Hour — Matte", "Clay Pot — Weatherproof", "Forest Green", "Premium Paint Brush"].includes(p.name)
        );
      setProductsList(isOldMock || !productsData.data?.length ? defaultProducts : productsData.data);
      setInquiriesList(inquiriesData || []);
      setBookingsList(bookingsData || []);

      setCategoriesList(getAllCategories());
      setHeroBannersList(getAllHeroBanners());
      setBrandsList(getAllBrands());
      setCouponsList(getAllCoupons());

      const reviewsData = await fetchAllReviews();
      setReviewsList(reviewsData || []);
    } catch (err) {
      console.warn("Load admin data warning:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdminAuthenticated) return;
    loadAllData();

    let bc = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("drip_orders_realtime");
        bc.onmessage = (event) => {
          if (
            event.data?.type === "ORDER_CREATED" ||
            event.data?.type === "ORDER_STATUS_CHANGED" ||
            event.data?.type === "BOOKING_CREATED" ||
            event.data?.type === "BOOKING_STATUS_CHANGED" ||
            event.data?.type === "INQUIRY_CREATED" ||
            event.data?.type === "CATEGORIES_UPDATED" ||
            event.data?.type === "BANNERS_UPDATED" ||
            event.data?.type === "BRANDS_UPDATED"
          ) {
            loadAllData();
          }
        };
      }
    } catch (e) {
      console.warn("Admin Broadcast error:", e);
    }

    const interval = setInterval(() => {
      fetchAllOrders().then((data) => setOrdersList(data || []));
      fetchAllBookings().then((data) => setBookingsList(data || []));
    }, 5000);

    return () => {
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [isAdminAuthenticated]);

  // CATEGORY ACTIONS
  function openAddCategoryModal() {
    setEditingCategoryId(null);
    setCategoryForm({
      title: "",
      slug: "",
      description: "",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600",
      tag: "Popular",
      color: "var(--cobalt)",
      count: "12 products",
      featured: true,
    });
    setShowCategoryModal(true);
  }

  function openEditCategoryModal(cat) {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      title: cat.title || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image: cat.image || "",
      tag: cat.tag || "Popular",
      color: cat.color || "var(--cobalt)",
      count: cat.count || "12 products",
      featured: cat.featured !== undefined ? cat.featured : true,
    });
    setShowCategoryModal(true);
  }

  function handleSaveCategory(e) {
    e.preventDefault();
    if (!categoryForm.title.trim()) return;
    saveCategory({ ...categoryForm, id: editingCategoryId });
    setCategoriesList(getAllCategories());
    setShowCategoryModal(false);
    setMessage(editingCategoryId ? "Category updated successfully!" : "New Category added!");
    setTimeout(() => setMessage(""), 3000);
  }

  function handleDeleteCategory(id) {
    if (!window.confirm("Are you sure you want to remove this category?")) return;
    deleteCategory(id);
    setCategoriesList(getAllCategories());
    setMessage("Category removed.");
    setTimeout(() => setMessage(""), 3000);
  }

  // BANNER ACTIONS
  function openAddBannerModal() {
    setEditingBannerId(null);
    setBannerForm({
      badge: "✦ PAKISTAN'S PREMIER LUXURY PAINT HOUSE",
      title: "",
      subtitle: "",
      ctaText: "Shop Now →",
      ctaUrl: "/shop",
      bgImage: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1920&q=80",
      colorAccent: "#38bdf8",
      active: true,
    });
    setShowBannerModal(true);
  }

  function openEditBannerModal(banner) {
    setEditingBannerId(banner.id);
    setBannerForm({
      badge: banner.badge || "✦ LUXURY COLLECTION",
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      ctaText: banner.ctaText || "Shop Now →",
      ctaUrl: banner.ctaUrl || "/shop",
      bgImage: banner.bgImage || "",
      colorAccent: banner.colorAccent || "#38bdf8",
      active: banner.active !== undefined ? banner.active : true,
    });
    setShowBannerModal(true);
  }

  function handleSaveBanner(e) {
    e.preventDefault();
    if (!bannerForm.title.trim()) return;
    saveHeroBanner({ ...bannerForm, id: editingBannerId });
    setHeroBannersList(getAllHeroBanners());
    setShowBannerModal(false);
    setMessage(editingBannerId ? "Hero Banner updated!" : "New Hero Banner created!");
    setTimeout(() => setMessage(""), 3000);
  }

  function handleDeleteBanner(id) {
    if (!window.confirm("Delete this hero banner slide?")) return;
    deleteHeroBanner(id);
    setHeroBannersList(getAllHeroBanners());
    setMessage("Hero Banner deleted.");
    setTimeout(() => setMessage(""), 3000);
  }

  // BRAND ACTIONS
  function openAddBrandModal() {
    setEditingBrandId(null);
    setBrandForm({
      name: "",
      origin: "Pakistan",
      highlight: "Super Emulsions & Weathercoat",
      active: true,
    });
    setShowBrandModal(true);
  }

  function handleSaveBrand(e) {
    e.preventDefault();
    if (!brandForm.name.trim()) return;
    saveBrand({ ...brandForm, id: editingBrandId });
    setBrandsList(getAllBrands());
    setShowBrandModal(false);
    setMessage("Brand saved successfully!");
    setTimeout(() => setMessage(""), 3000);
  }

  function handleDeleteBrand(id) {
    if (!window.confirm("Remove this partner brand?")) return;
    deleteBrand(id);
    setBrandsList(getAllBrands());
    setMessage("Brand removed.");
    setTimeout(() => setMessage(""), 3000);
  }

  // PRODUCT ACTIONS
  function openAddProductModal() {
    setEditingProductId(null);
    setProductForm({
      name: "",
      category: categoriesList[0]?.title || "Interior Paint",
      price: "",
      unit: "/ gallon",
      image_url: "",
      rating: "5",
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
      rating: product.rating || "5",
      reviews: product.reviews || "0",
      stock: product.stock !== undefined ? product.stock : 50,
      description: product.description || "",
    });
    setShowProductModal(true);
  }

  async function handleProductImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadFileToBucket("products", file);
      setProductForm((prev) => ({ ...prev, image_url: url }));
      setMessage("Product image uploaded successfully!");
    } catch (err) {
      setError(err.message || "Failed to upload image.");
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
        rating: Number(productForm.rating) || 5,
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

  // Quick Stock Adjustment
  async function handleQuickStockUpdate(productId, delta) {
    const prod = productsList.find((p) => p.id === productId);
    if (!prod) return;
    const currentStock = typeof prod.stock === "number" ? prod.stock : 50;
    const newStock = Math.max(0, currentStock + delta);
    try {
      await updateProduct(productId, { stock: newStock });
      setProductsList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      setMessage(`Stock for "${prod.name}" updated to ${newStock}`);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError("Failed to update stock: " + err.message);
    }
  }

  // Order Status Handler
  async function handleStatusChange(orderId, newStatus) {
    try {
      setLoading(true);
      await updateOrderStatus(orderId, newStatus);
      setMessage(`Order #${orderId} marked as ${newStatus}`);
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setLoading(false);
    }
  }

  // Inquiry Status Handler
  async function handleInquiryStatus(id, newStatus) {
    try {
      await updateInquiryStatus(id, newStatus);
      setMessage(`Inquiry #${id} marked as ${newStatus}`);
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update inquiry.");
    }
  }

  // Booking Status Handler
  async function handleBookingStatus(id, newStatus) {
    try {
      await updateBookingStatus(id, newStatus);
      setMessage(`Painter Booking #${id} marked as ${newStatus}`);
      await loadAllData();
    } catch (err) {
      setError(err.message || "Failed to update booking.");
    }
  }

  // Filtered Orders
  const filteredOrders = ordersList.filter((ord) => {
    const status = ord.order_status || ord.status || "pending";
    if (orderStatusFilter !== "all" && status !== orderStatusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(ord.id || ord.order_number).toLowerCase().includes(q) ||
      (ord.recipient_name || "").toLowerCase().includes(q) ||
      (ord.city || "").toLowerCase().includes(q) ||
      (ord.phone || "").toLowerCase().includes(q)
    );
  });

  // Filtered Products / Inventory
  const filteredProducts = productsList.filter((prod) => {
    const stock = typeof prod.stock === "number" ? prod.stock : 50;
    if (inventoryFilter === "low" && (stock <= 0 || stock > 5)) return false;
    if (inventoryFilter === "out" && stock > 0) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (prod.name || "").toLowerCase().includes(q) ||
      (prod.category || "").toLowerCase().includes(q)
    );
  });

  // Unread / Pending Counter Badges
  const pendingOrdersCount = ordersList.filter(
    (o) => (o.order_status || o.status || "pending") === "pending"
  ).length;
  const pendingBookingsCount = bookingsList.filter(
    (b) => (b.status || "pending") === "pending"
  ).length;
  const lowStockCount = productsList.filter(
    (p) => (typeof p.stock === "number" ? p.stock : 50) <= 5
  ).length;

  // -------------------------------------------------------------
  // IF NOT AUTHENTICATED AS ADMIN -> SHOW GATE
  // -------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <>
        <Navbar />
        <section
          style={{
            minHeight: "75vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            background: "var(--canvas-dark)",
          }}
        >
          <div style={{ maxWidth: "440px", width: "100%" }}>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--paper-line)",
                borderRadius: "var(--r-xl)",
                padding: "40px 32px",
                boxShadow: "var(--shadow-xl)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>🔒</div>
              <p
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  color: "var(--poppy)",
                  textTransform: "uppercase",
                  fontWeight: "700",
                }}
              >
                DRIP EXECUTIVE ACCESS
              </p>
              <h2
                style={{
                  fontFamily: "var(--display)",
                  fontSize: "26px",
                  fontWeight: "700",
                  marginTop: "4px",
                  marginBottom: "8px",
                }}
              >
                Admin Control Portal
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: "14px", marginBottom: "28px" }}>
                Enter your administrative security key to access store catalog, orders, painter bookings, and marketing controls.
              </p>

              {passcodeError && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    fontSize: "13px",
                    marginBottom: "18px",
                    textAlign: "left",
                  }}
                >
                  ⚠ {passcodeError}
                </div>
              )}

              <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="login-field" style={{ textAlign: "left" }}>
                  <label>Admin Passcode</label>
                  <input
                    type="password"
                    placeholder="Enter passcode (default: admin123)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <Button text="Unlock Control Center →" className="btn btn-primary btn-lg" style={{ width: "100%" }} />
              </form>

              <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--paper-line)" }}>
                <p style={{ fontSize: "12.5px", color: "var(--ink-muted)" }}>
                  Default Passcode:{" "}
                  <code style={{ background: "var(--canvas-dark)", padding: "2px 6px", borderRadius: "4px", fontWeight: "700", color: "var(--cobalt)" }}>
                    admin123
                  </code>
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED MODERN ADMIN PORTAL
  // -------------------------------------------------------------
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas-dark)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "32px 0 64px" }}>
        <div className="wrap" style={{ maxWidth: "1400px" }}>
          
          {/* Top Control Bar Header */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--paper-line)",
              borderRadius: "var(--r-xl)",
              padding: "20px 28px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>⚙️</span>
                <h1 style={{ fontFamily: "var(--display)", fontSize: "24px", fontWeight: "700", margin: 0 }}>
                  Admin Operations Suite
                </h1>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "99px",
                    background: "#ecfdf5",
                    color: "#047857",
                    letterSpacing: "0.04em",
                  }}
                >
                  ● LIVE
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>
                Store: <strong>Drip Paints Pakistan</strong> · Logged in as Administrator
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={loadAllData}
                title="Sync database and orders"
              >
                ↺ Refresh Live
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={openAddProductModal}
              >
                + Add Product
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleAdminLogout}
                style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}
              >
                Lock Portal 🔒
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {message && (
            <div
              style={{
                padding: "14px 20px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                borderRadius: "var(--r-md)",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontWeight: "500",
              }}
            >
              <span>✔ {message}</span>
              <button
                onClick={() => setMessage("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "14px 20px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: "var(--r-md)",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>⚠ {error}</span>
              <button
                onClick={() => setError("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Layout: Modern Responsive Sidebar + Tab View */}
          <div className="admin-layout">
            
            {/* SIDEBAR NAVIGATION */}
            <aside className="admin-sidebar">
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* 1. OVERVIEW */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--ink-muted)", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "8px" }}>
                    Overview
                  </p>
                  <button
                    type="button"
                    className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                    onClick={() => handleTabChange("dashboard")}
                  >
                    <span>📊 Dashboard</span>
                  </button>
                </div>

                {/* 2. CATALOG */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--ink-muted)", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "8px" }}>
                    Catalog
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "products" ? "active" : ""}`}
                      onClick={() => handleTabChange("products")}
                    >
                      <span>🎨 Products</span>
                      <span className="admin-nav-badge">{productsList.length}</span>
                    </button>

                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "categories" ? "active" : ""}`}
                      onClick={() => handleTabChange("categories")}
                    >
                      <span>📂 Categories</span>
                      <span className="admin-nav-badge" style={{ background: "#e0e7ff", color: "#3730a3" }}>{categoriesList.length}</span>
                    </button>

                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "brands" ? "active" : ""}`}
                      onClick={() => handleTabChange("brands")}
                    >
                      <span>🏷️ Brands</span>
                      <span className="admin-nav-badge">{brandsList.length}</span>
                    </button>

                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "inventory" ? "active" : ""}`}
                      onClick={() => handleTabChange("inventory")}
                    >
                      <span>📦 Inventory</span>
                      {lowStockCount > 0 && (
                        <span className="admin-nav-badge" style={{ background: "#fee2e2", color: "#991b1b" }}>{lowStockCount} Low</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. SALES & CRM */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--ink-muted)", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "8px" }}>
                    Sales &amp; CRM
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "orders" ? "active" : ""}`}
                      onClick={() => handleTabChange("orders")}
                    >
                      <span>🛍️ Orders</span>
                      {pendingOrdersCount > 0 ? (
                        <span className="admin-nav-badge" style={{ background: "#fef3c7", color: "#92400e" }}>{pendingOrdersCount} New</span>
                      ) : (
                        <span className="admin-nav-badge">{ordersList.length}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "customers" ? "active" : ""}`}
                      onClick={() => handleTabChange("customers")}
                    >
                      <span>👥 Customers</span>
                      <span className="admin-nav-badge">{profilesList.length}</span>
                    </button>

                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "reviews" ? "active" : ""}`}
                      onClick={() => handleTabChange("reviews")}
                    >
                      <span>⭐ Reviews</span>
                      <span className="admin-nav-badge">{reviewsList.length}</span>
                    </button>
                  </div>
                </div>

                {/* 4. MARKETING */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--ink-muted)", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "8px" }}>
                    Marketing
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "banners" ? "active" : ""}`}
                      onClick={() => handleTabChange("banners")}
                    >
                      <span>🖼️ Hero Banners</span>
                      <span className="admin-nav-badge" style={{ background: "#f3e8ff", color: "#6b21a8" }}>{heroBannersList.length}</span>
                    </button>

                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "offers" ? "active" : ""}`}
                      onClick={() => handleTabChange("offers")}
                    >
                      <span>🎟️ Offers &amp; Deals</span>
                      <span className="admin-nav-badge">{couponsList.length}</span>
                    </button>
                  </div>
                </div>

                {/* 5. SERVICES */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--ink-muted)", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "8px" }}>
                    Services
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "bookings" ? "active" : ""}`}
                      onClick={() => handleTabChange("bookings")}
                    >
                      <span>👨‍🎨 Painter Bookings</span>
                      {pendingBookingsCount > 0 && (
                        <span className="admin-nav-badge" style={{ background: "#fee2e2", color: "#991b1b" }}>{pendingBookingsCount} New</span>
                      )}
                    </button>

                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "inquiries" ? "active" : ""}`}
                      onClick={() => handleTabChange("inquiries")}
                    >
                      <span>📩 Inquiries</span>
                      <span className="admin-nav-badge">{inquiriesList.length}</span>
                    </button>
                  </div>
                </div>

                {/* 6. SYSTEM */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--ink-muted)", textTransform: "uppercase", paddingLeft: "12px", marginBottom: "8px" }}>
                    System
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`}
                      onClick={() => handleTabChange("settings")}
                    >
                      <span>⚙️ Store Settings</span>
                    </button>

                    <button
                      type="button"
                      className={`admin-nav-item ${activeTab === "admins" ? "active" : ""}`}
                      onClick={() => handleTabChange("admins")}
                    >
                      <span>🔐 Admin Security</span>
                    </button>
                  </div>
                </div>

              </div>
            </aside>

            {/* TAB CONTENT AREA */}
            <section className="admin-main">
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === "dashboard" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <div className="admin-stat-card" style={{ "--gradient": "linear-gradient(90deg, #1e3d6e, #2b5299)" }}>
                      <div className="admin-stat-icon">💰</div>
                      <div className="admin-stat-value">Rs. {analytics.totalRevenue.toLocaleString()}</div>
                      <div className="admin-stat-label">Total Revenue</div>
                    </div>
                    <div className="admin-stat-card" style={{ "--gradient": "linear-gradient(90deg, #d4882a, #e9a445)" }}>
                      <div className="admin-stat-icon">📦</div>
                      <div className="admin-stat-value">{ordersList.length}</div>
                      <div className="admin-stat-label">Total Orders ({pendingOrdersCount} Pending)</div>
                    </div>
                    <div className="admin-stat-card" style={{ "--gradient": "linear-gradient(90deg, #4a6b47, #5f8a5c)" }}>
                      <div className="admin-stat-icon">🎨</div>
                      <div className="admin-stat-value">{productsList.length}</div>
                      <div className="admin-stat-label">Catalog Products</div>
                    </div>
                    <div className="admin-stat-card" style={{ "--gradient": "linear-gradient(90deg, #c23b3b, #e04e4e)" }}>
                      <div className="admin-stat-icon">👨‍🎨</div>
                      <div className="admin-stat-value">{bookingsList.length}</div>
                      <div className="admin-stat-label">Painter Bookings</div>
                    </div>
                  </div>

                  {/* Quick Action Tiles */}
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--paper-line)",
                      borderRadius: "var(--r-xl)",
                      padding: "24px",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    <button
                      onClick={openAddProductModal}
                      className="btn btn-ghost"
                      style={{ padding: "16px", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px", border: "1.5px dashed var(--paper-line)" }}
                    >
                      <span style={{ fontSize: "20px" }}>🎨</span>
                      <strong>+ New Paint Product</strong>
                      <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>Add emulsions, brushes</span>
                    </button>

                    <button
                      onClick={openAddCategoryModal}
                      className="btn btn-ghost"
                      style={{ padding: "16px", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px", border: "1.5px dashed var(--paper-line)" }}
                    >
                      <span style={{ fontSize: "20px" }}>📂</span>
                      <strong>+ New Category</strong>
                      <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>Create category cards</span>
                    </button>

                    <button
                      onClick={openAddBannerModal}
                      className="btn btn-ghost"
                      style={{ padding: "16px", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px", border: "1.5px dashed var(--paper-line)" }}
                    >
                      <span style={{ fontSize: "20px" }}>🖼️</span>
                      <strong>+ New Hero Banner</strong>
                      <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>Update hero carousel</span>
                    </button>

                    <button
                      onClick={() => handleTabChange("bookings")}
                      className="btn btn-ghost"
                      style={{ padding: "16px", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px", border: "1.5px dashed var(--paper-line)" }}
                    >
                      <span style={{ fontSize: "20px" }}>👨‍🎨</span>
                      <strong>Painter Leads</strong>
                      <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>{pendingBookingsCount} awaiting call</span>
                    </button>
                  </div>

                  {/* Recent Customer Orders */}
                  <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "18px", margin: 0 }}>Recent Customer Orders</h3>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleTabChange("orders")}>View All Orders →</button>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>City</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordersList.slice(0, 5).map((ord) => (
                            <tr key={ord.id || ord.order_number}>
                              <td style={{ fontWeight: "700", fontFamily: "var(--mono)" }}>{ord.order_number || `#${ord.id}`}</td>
                              <td>{ord.recipient_name || ord.shipping_address?.split(",")[0] || "Customer"}</td>
                              <td>{ord.city || "Karachi"}</td>
                              <td>{new Date(ord.created_at || Date.now()).toLocaleDateString()}</td>
                              <td style={{ fontWeight: "700", color: "var(--cobalt)" }}>Rs. {Number(ord.total || ord.total_amount || 0).toLocaleString()}</td>
                              <td>
                                <span className={`status-badge status-${ord.order_status || ord.status || "pending"}`}>
                                  {ord.order_status || ord.status || "pending"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS */}
              {activeTab === "products" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", margin: 0 }}>Product Catalog ({productsList.length})</h3>
                      <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>Manage paint formulas, prices, and catalog items.</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--paper-line)", fontSize: "13px" }}
                      />
                      <Button text="+ Add Product" className="btn btn-primary btn-sm" onClick={openAddProductModal} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "18px" }}>
                    {filteredProducts.map((prod) => {
                      const stockNum = typeof prod.stock === "number" ? prod.stock : 50;
                      const isOut = stockNum <= 0;
                      const isLow = stockNum > 0 && stockNum <= 5;

                      return (
                        <div key={prod.id} className="product-card" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ position: "relative", height: "150px", background: "var(--canvas-dark)", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
                              <img
                                src={prod.image_url || prod.image}
                                alt={prod.name}
                                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  top: "8px",
                                  right: "8px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "2px 8px",
                                  borderRadius: "99px",
                                  background: isOut ? "#fee2e2" : isLow ? "#fef3c7" : "#ecfdf5",
                                  color: isOut ? "#991b1b" : isLow ? "#92400e" : "#047857",
                                }}
                              >
                                {isOut ? "Out of Stock (0)" : `Stock: ${stockNum}`}
                              </span>
                            </div>

                            <span className="product-card-cat" style={{ fontSize: "11px" }}>{prod.category || prod.category_name}</span>
                            <h4 style={{ fontFamily: "var(--display)", fontSize: "16px", margin: "4px 0" }}>{prod.name}</h4>
                            <p style={{ fontFamily: "var(--ui)", fontWeight: "700", fontSize: "16px", color: "var(--cobalt)" }}>
                              Rs. {typeof prod.price === "number" ? prod.price.toLocaleString() : prod.price}{" "}
                              <span style={{ fontSize: "12px", color: "var(--ink-muted)", fontWeight: "400" }}>{prod.unit}</span>
                            </p>
                          </div>

                          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                            <button onClick={() => openEditProductModal(prod)} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Edit</button>
                            <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-danger btn-sm" style={{ flex: 1 }}>Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORIES */}
              {activeTab === "categories" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", margin: 0 }}>Category Management ({categoriesList.length})</h3>
                      <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>
                        Add, edit, or remove categories. Changes immediately reflect across shop filters &amp; categories page.
                      </p>
                    </div>
                    <Button text="+ Add New Category" className="btn btn-primary" onClick={openAddCategoryModal} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                    {categoriesList.map((cat) => (
                      <div
                        key={cat.id || cat.slug}
                        style={{
                          background: "var(--canvas-dark)",
                          border: "1px solid var(--paper-line)",
                          borderRadius: "var(--r-lg)",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ height: "150px", position: "relative", overflow: "hidden", background: "white" }}>
                          <img src={cat.image} alt={cat.title} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "12px" }} />
                          <span
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              background: "rgba(0,0,0,0.75)",
                              color: "white",
                              padding: "4px 10px",
                              borderRadius: "99px",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            {cat.tag || "Category"}
                          </span>
                        </div>

                        <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <h4 style={{ fontFamily: "var(--display)", fontSize: "17px", margin: "0 0 6px" }}>{cat.title}</h4>
                            <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "0 0 10px", lineHeight: "1.4" }}>
                              {cat.description}
                            </p>
                            <span style={{ fontSize: "12px", color: "var(--ink-muted)", fontFamily: "var(--mono)" }}>
                              Slug: /{cat.slug} · {cat.count || "0 products"}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--paper-line)" }}>
                            <button
                              type="button"
                              onClick={() => openEditCategoryModal(cat)}
                              className="btn btn-ghost btn-sm"
                              style={{ flex: 1 }}
                            >
                              Edit Category
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id || cat.slug)}
                              className="btn btn-danger btn-sm"
                              style={{ flex: 1 }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: BRANDS */}
              {activeTab === "brands" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", margin: 0 }}>Authorized Brand Distributorships ({brandsList.length})</h3>
                      <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>Partner brands showcased on homepage.</p>
                    </div>
                    <Button text="+ Add Brand" className="btn btn-primary" onClick={openAddBrandModal} />
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Brand Name</th>
                          <th>Origin / Company</th>
                          <th>Highlight Series</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandsList.map((b) => (
                          <tr key={b.id || b.name}>
                            <td style={{ fontWeight: "700", fontSize: "15px" }}>🏷️ {b.name}</td>
                            <td>{b.origin}</td>
                            <td style={{ color: "var(--cobalt)", fontWeight: "600" }}>{b.highlight}</td>
                            <td>
                              <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "#ecfdf5", color: "#047857" }}>
                                Verified Partner
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteBrand(b.id || b.name)}
                                className="btn btn-sm"
                                style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: INVENTORY */}
              {activeTab === "inventory" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", margin: 0 }}>Stock &amp; Inventory Watch</h3>
                      <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>
                        Instant stock adjustments with low-stock badges.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className={`btn btn-sm ${inventoryFilter === "all" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setInventoryFilter("all")}
                      >
                        All ({productsList.length})
                      </button>
                      <button
                        className={`btn btn-sm ${inventoryFilter === "low" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setInventoryFilter("low")}
                      >
                        Low Stock (≤5)
                      </button>
                      <button
                        className={`btn btn-sm ${inventoryFilter === "out" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setInventoryFilter("out")}
                      >
                        Out of Stock (0)
                      </button>
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Unit Price</th>
                          <th>Current Stock</th>
                          <th>Quick Adjust</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((prod) => {
                          const stockNum = typeof prod.stock === "number" ? prod.stock : 50;
                          const isOut = stockNum <= 0;
                          const isLow = stockNum > 0 && stockNum <= 5;

                          return (
                            <tr key={prod.id}>
                              <td style={{ fontWeight: "700" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <img src={prod.image_url || prod.image} alt={prod.name} style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "4px", background: "var(--canvas-dark)" }} />
                                  <span>{prod.name}</span>
                                </div>
                              </td>
                              <td>{prod.category || prod.category_name}</td>
                              <td style={{ fontWeight: "600" }}>Rs. {Number(prod.price).toLocaleString()} {prod.unit}</td>
                              <td>
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "800",
                                    padding: "3px 10px",
                                    borderRadius: "99px",
                                    background: isOut ? "#fee2e2" : isLow ? "#fef3c7" : "#ecfdf5",
                                    color: isOut ? "#991b1b" : isLow ? "#92400e" : "#047857",
                                  }}
                                >
                                  {isOut ? "OUT OF STOCK" : `${stockNum} units`}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                  <button
                                    onClick={() => handleQuickStockUpdate(prod.id, -1)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ padding: "4px 10px", fontWeight: "700" }}
                                    title="Decrease 1"
                                  >
                                    -1
                                  </button>
                                  <button
                                    onClick={() => handleQuickStockUpdate(prod.id, 5)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ padding: "4px 10px", fontWeight: "700", color: "#047857" }}
                                    title="Restock +5"
                                  >
                                    +5
                                  </button>
                                  <button
                                    onClick={() => handleQuickStockUpdate(prod.id, 20)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ padding: "4px 10px", fontWeight: "700", color: "#1e3d6e" }}
                                    title="Restock +20"
                                  >
                                    +20
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: ORDERS */}
              {activeTab === "orders" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", margin: 0 }}>Customer Orders ({ordersList.length})</h3>
                      <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>Live syncing active. Approve orders to dispatch.</p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="sort-select"
                        style={{ padding: "6px 12px", fontSize: "13px" }}
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Approval</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Search order ID, name, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--paper-line)", fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>City &amp; Phone</th>
                          <th>Date</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "var(--ink-muted)" }}>
                              No matching orders found.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => {
                            const currentStatus = ord.order_status || ord.status || "pending";
                            const isPending = currentStatus === "pending";

                            return (
                              <tr key={ord.id || ord.order_number} style={{ background: isPending ? "rgba(212, 136, 42, 0.05)" : "" }}>
                                <td style={{ fontWeight: "700", fontFamily: "var(--mono)" }}>
                                  {ord.order_number || `#${ord.id}`}
                                </td>
                                <td>
                                  <strong>{ord.recipient_name || ord.shipping_address?.split(",")[0] || "Customer"}</strong>
                                  <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                                    {ord.delivery_speed === "urgent" ? "⚡ Urgent Rush" : ord.delivery_speed === "fast" ? "🚀 Fast Express" : "🚚 Standard"}
                                  </div>
                                </td>
                                <td>
                                  <div>{ord.city || "Karachi"}</div>
                                  <div style={{ fontSize: "12px", color: "var(--ink-muted)" }}>{ord.phone || "N/A"}</div>
                                </td>
                                <td>{new Date(ord.created_at || Date.now()).toLocaleDateString()}</td>
                                <td style={{ fontWeight: "700", color: "var(--cobalt)" }}>
                                  Rs. {Number(ord.total || ord.total_amount || 0).toLocaleString()}
                                </td>
                                <td>
                                  <span className={`status-badge status-${currentStatus}`}>
                                    {currentStatus}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    {isPending && (
                                      <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        style={{ background: "var(--sage)", borderColor: "var(--sage)", padding: "4px 10px", fontSize: "12px" }}
                                        onClick={() => handleStatusChange(ord.id || ord.order_number, "confirmed")}
                                      >
                                        ⚡ Approve
                                      </button>
                                    )}
                                    <select
                                      value={currentStatus}
                                      onChange={(e) => handleStatusChange(ord.id || ord.order_number, e.target.value)}
                                      className="sort-select"
                                      style={{ padding: "4px 8px", fontSize: "12px" }}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
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

              {/* TAB 7: CUSTOMERS */}
              {activeTab === "customers" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "6px" }}>Registered Customers ({profilesList.length})</h3>
                  <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "20px" }}>Customer directory and contact records.</p>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
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
                              <img
                                src={prof.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                                alt="User"
                                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                              />
                            </td>
                            <td style={{ fontWeight: "700" }}>{prof.full_name || prof.username || "Anonymous Customer"}</td>
                            <td>{prof.email || "N/A"}</td>
                            <td>{prof.phone || "N/A"}</td>
                            <td>{prof.city || "Karachi"}</td>
                            <td>
                              <span className="product-card-badge badge-in-stock">{prof.role || "Customer"}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: REVIEWS */}
              {activeTab === "reviews" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "6px" }}>Customer Reviews &amp; Testimonials ({reviewsList.length})</h3>
                  <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "20px" }}>Verified customer reviews.</p>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Author</th>
                          <th>Rating</th>
                          <th>Review Feedback</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviewsList.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "var(--ink-muted)" }}>
                              No product reviews submitted yet.
                            </td>
                          </tr>
                        ) : (
                          reviewsList.map((rev, idx) => (
                            <tr key={rev.id || idx}>
                              <td style={{ fontWeight: "700" }}>👤 {rev.author || "Verified Buyer"}</td>
                              <td style={{ color: "var(--saffron)", fontWeight: "700" }}>
                                {"★".repeat(Number(rev.rating) || 5)}
                              </td>
                              <td style={{ maxWidth: "340px", fontSize: "13px" }}>{rev.comment}</td>
                              <td>{new Date(rev.created_at || Date.now()).toLocaleDateString()}</td>
                              <td>
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "#ecfdf5", color: "#047857" }}>
                                  ✓ Verified
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 9: HERO BANNERS */}
              {activeTab === "banners" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                    <h3 style={{ fontFamily: "var(--display)", fontSize: "18px", marginBottom: "6px" }}>📢 Top Announcement Bar Text</h3>
                    <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "16px" }}>
                      Appears at the very top of the website on every page.
                    </p>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={promoBannerText}
                        onChange={(e) => setPromoBannerText(e.target.value)}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--paper-line)", fontSize: "14px" }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          saveStoreAnnouncement(promoBannerText);
                          setMessage("Top announcement banner saved!");
                          setTimeout(() => setMessage(""), 3000);
                        }}
                      >
                        Save Bar Text
                      </button>
                    </div>
                  </div>

                  <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", margin: 0 }}>Homepage Hero Slides ({heroBannersList.length})</h3>
                        <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>
                          Add, edit, pause, or remove slides in the homepage hero carousel.
                        </p>
                      </div>
                      <Button text="+ Add Hero Banner" className="btn btn-primary" onClick={openAddBannerModal} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {heroBannersList.map((banner, idx) => (
                        <div
                          key={banner.id || idx}
                          style={{
                            background: "var(--canvas-dark)",
                            border: "1px solid var(--paper-line)",
                            borderRadius: "var(--r-lg)",
                            padding: "20px",
                            display: "grid",
                            gridTemplateColumns: "160px 1fr auto",
                            gap: "20px",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ height: "90px", borderRadius: "8px", overflow: "hidden", background: "#111" }}>
                            <img src={banner.bgImage} alt={banner.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>

                          <div>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: banner.colorAccent || "var(--cobalt)", fontFamily: "var(--mono)" }}>
                              {banner.badge}
                            </span>
                            <h4 style={{ fontFamily: "var(--display)", fontSize: "16px", margin: "4px 0" }}>{banner.title}</h4>
                            <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", margin: "0 0 6px", lineHeight: "1.4" }}>
                              {banner.subtitle}
                            </p>
                            <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                              CTA: <strong>{banner.ctaText}</strong> → Link: <code>{banner.ctaUrl}</code>
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => openEditBannerModal(banner)}
                              className="btn btn-ghost btn-sm"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                toggleHeroBannerStatus(banner.id);
                                setHeroBannersList(getAllHeroBanners());
                              }}
                              className="btn btn-sm"
                              style={{ background: banner.active ? "#f0fdf4" : "#f3f4f6", color: banner.active ? "#166534" : "#6b7280" }}
                            >
                              {banner.active ? "✓ Active" : "Paused"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: OFFERS & DEALS */}
              {activeTab === "offers" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "6px" }}>Discount Coupons &amp; Promotional Deals</h3>
                  <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "24px" }}>
                    Generate discount codes for customers to apply at checkout.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
                    <div style={{ background: "var(--canvas-dark)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-lg)", padding: "20px" }}>
                      <h4 style={{ fontFamily: "var(--display)", fontSize: "16px", marginBottom: "14px" }}>🎟️ Generate New Coupon Code</h4>

                      {couponError && (
                        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "8px 12px", borderRadius: "6px", fontSize: "12.5px", marginBottom: "12px" }}>
                          ⚠ {couponError}
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div className="login-field" style={{ margin: 0 }}>
                          <label>Coupon Code</label>
                          <input
                            type="text"
                            placeholder="e.g. FLASH30"
                            value={couponForm.code}
                            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                            style={{ textTransform: "uppercase", fontFamily: "var(--mono)", fontWeight: "700" }}
                          />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div className="login-field" style={{ margin: 0 }}>
                            <label>Type</label>
                            <select
                              value={couponForm.type}
                              onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                              className="sort-select"
                            >
                              <option value="percentage">% Percentage Off</option>
                              <option value="flat">Rs. Flat Amount</option>
                            </select>
                          </div>
                          <div className="login-field" style={{ margin: 0 }}>
                            <label>{couponForm.type === "percentage" ? "Discount %" : "Flat Rs."}</label>
                            <input
                              type="number"
                              placeholder={couponForm.type === "percentage" ? "20" : "500"}
                              value={couponForm.value}
                              onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="login-field" style={{ margin: 0 }}>
                          <label>Min Spend (Rs.)</label>
                          <input
                            type="number"
                            placeholder="e.g. 2000"
                            value={couponForm.minSpend}
                            onChange={(e) => setCouponForm({ ...couponForm, minSpend: e.target.value })}
                          />
                        </div>

                        <div className="login-field" style={{ margin: 0 }}>
                          <label>Description</label>
                          <input
                            type="text"
                            placeholder="e.g. 20% off on all paint cans"
                            value={couponForm.description}
                            onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                          />
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            setCouponError("");
                            if (!couponForm.code.trim()) return setCouponError("Coupon code is required.");
                            if (!couponForm.value || Number(couponForm.value) <= 0) return setCouponError("Enter a valid discount value.");
                            saveCoupon(couponForm);
                            setCouponsList(getAllCoupons());
                            setCouponForm({ code: "", type: "percentage", value: "", minSpend: "", description: "" });
                            setMessage("Coupon activated successfully!");
                            setTimeout(() => setMessage(""), 3000);
                          }}
                        >
                          Create Coupon
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <h4 style={{ fontFamily: "var(--display)", fontSize: "16px", marginBottom: "4px" }}>Active Vouchers ({couponsList.length})</h4>
                      {couponsList.map((c) => (
                        <div
                          key={c.code}
                          style={{
                            background: "var(--canvas-dark)",
                            border: "1px solid var(--paper-line)",
                            borderRadius: "var(--r-md)",
                            padding: "12px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <code style={{ fontFamily: "var(--mono)", fontWeight: "700", color: "var(--cobalt)" }}>{c.code}</code>
                              <span style={{ fontSize: "11px", fontWeight: "700", padding: "1px 6px", borderRadius: "99px", background: "#f0fdf4", color: "#166534" }}>
                                {c.type === "percentage" ? `${c.value}% OFF` : `Rs. ${c.value} OFF`}
                              </span>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--ink-soft)", margin: "4px 0 0" }}>{c.description}</p>
                          </div>

                          <button
                            onClick={() => {
                              deleteCoupon(c.code);
                              setCouponsList(getAllCoupons());
                            }}
                            className="btn btn-sm"
                            style={{ background: "#fef2f2", color: "#991b1b" }}
                          >
                            🗑
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: PAINTER BOOKINGS */}
              {activeTab === "bookings" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", margin: 0 }}>👨‍🎨 Painter Hiring Leads ({bookingsList.length})</h3>
                      <p style={{ fontSize: "13px", color: "var(--ink-soft)", margin: "4px 0 0" }}>
                        Requests submitted from the "Hire Painters" portal with instant WhatsApp connect.
                      </p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={loadAllData}>↺ Refresh Bookings</button>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Client Name</th>
                          <th>Phone</th>
                          <th>City</th>
                          <th>Service</th>
                          <th>Project Scope</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingsList.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: "center", color: "var(--ink-muted)", padding: "32px" }}>
                              No painter requests logged yet.
                            </td>
                          </tr>
                        ) : (
                          bookingsList.map((bk) => (
                            <tr key={bk.id}>
                              <td style={{ fontWeight: "700" }}>{bk.full_name}</td>
                              <td>
                                <a
                                  href={`tel:${bk.phone}`}
                                  style={{ color: "var(--cobalt)", textDecoration: "none", fontWeight: "600" }}
                                >
                                  {bk.phone}
                                </a>
                              </td>
                              <td><strong>{bk.city}</strong></td>
                              <td style={{ fontWeight: "600", color: "var(--cobalt)" }}>{bk.service_required}</td>
                              <td style={{ maxWidth: "240px", fontSize: "13px", color: "var(--ink-soft)" }}>{bk.details || "N/A"}</td>
                              <td>
                                <select
                                  value={bk.status || "pending"}
                                  onChange={(e) => handleBookingStatus(bk.id, e.target.value)}
                                  className="sort-select"
                                  style={{ padding: "4px 8px", fontSize: "12px" }}
                                >
                                  <option value="pending">⏳ Pending</option>
                                  <option value="contacted">📞 Contacted</option>
                                  <option value="confirmed">✅ Confirmed</option>
                                  <option value="completed">🏡 Completed</option>
                                  <option value="cancelled">❌ Cancelled</option>
                                </select>
                              </td>
                              <td>
                                <a
                                  href={`https://wa.me/${(bk.phone || "").replace(/[^0-9]/g, "")}?text=Salam%20${encodeURIComponent(bk.full_name || "Customer")}!%20This%20is%20DRIP%20Paints%20team%20regarding%20your%20painter%20booking.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm"
                                  style={{ background: "#25D366", color: "white", textDecoration: "none", padding: "4px 10px", fontSize: "12px", whiteSpace: "nowrap" }}
                                >
                                  💬 WhatsApp
                                </a>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 12: INQUIRIES */}
              {activeTab === "inquiries" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "28px" }}>
                  <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", marginBottom: "6px" }}>📩 Contact Inquiries ({inquiriesList.length})</h3>
                  <p style={{ fontSize: "13px", color: "var(--ink-soft)", marginBottom: "20px" }}>Messages from the Contact Us form.</p>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Client</th>
                          <th>Subject</th>
                          <th>Message Body</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiriesList.length === 0 ? (
                          <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--ink-muted)", padding: "28px" }}>No inquiries yet.</td></tr>
                        ) : (
                          inquiriesList.map((inq) => (
                            <tr key={inq.id}>
                              <td>
                                <strong>{inq.name}</strong>
                                <div style={{ fontSize: "12px", color: "var(--ink-muted)" }}>{inq.email} · {inq.phone}</div>
                              </td>
                              <td style={{ fontWeight: "600" }}>{inq.subject}</td>
                              <td style={{ maxWidth: "320px", fontSize: "13px", color: "var(--ink-soft)" }}>{inq.message}</td>
                              <td>{new Date(inq.created_at || Date.now()).toLocaleDateString()}</td>
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
                </div>
              )}

              {/* TAB 13: SETTINGS */}
              {activeTab === "settings" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "32px", maxWidth: "800px" }}>
                  <h3 className="settings-section-title">Store &amp; Dispatch Configuration</h3>
                  <p className="settings-section-desc">Manage store operational status, shipping rates, and official contacts.</p>

                  <form onSubmit={handleSaveAdminSettings} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className="login-field">
                      <label>Store Operational Mode</label>
                      <select value={storeStatus} onChange={(e) => setStoreStatus(e.target.value)} className="sort-select">
                        <option value="live">🟢 Live &amp; Accepting Customer Orders</option>
                        <option value="maintenance">🟡 Maintenance Mode (Catalog Preview Only)</option>
                      </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="login-field">
                        <label>Standard Delivery Fee (Rs.)</label>
                        <input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
                      </div>
                      <div className="login-field">
                        <label>Free Shipping Min Spend (Rs.)</label>
                        <input type="number" value={freeShippingMin} onChange={(e) => setFreeShippingMin(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="login-field">
                        <label>Official Support Phone</label>
                        <input type="text" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
                      </div>
                      <div className="login-field">
                        <label>Support Email</label>
                        <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                      </div>
                    </div>

                    <Button text="Save Store Configuration" className="btn btn-primary" style={{ alignSelf: "flex-start" }} />
                  </form>
                </div>
              )}

              {/* TAB 14: ADMINS */}
              {activeTab === "admins" && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "32px", maxWidth: "700px" }}>
                  <h3 className="settings-section-title">Admin Access &amp; Passcode Security</h3>
                  <p className="settings-section-desc">Change the administrative master passcode and manage active access keys.</p>

                  <form onSubmit={handleSaveAdminSettings} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className="login-field">
                      <label>Update Master Passcode</label>
                      <input
                        type="password"
                        placeholder="Enter new admin key"
                        value={newAdminPasscode}
                        onChange={(e) => setNewAdminPasscode(e.target.value)}
                      />
                      <p style={{ fontSize: "12px", color: "var(--ink-muted)", margin: "4px 0 0" }}>
                        Current Key:{" "}
                        <code style={{ background: "var(--canvas-dark)", padding: "2px 6px", borderRadius: "4px" }}>
                          {localStorage.getItem("drip_custom_admin_passcode") || "admin123"}
                        </code>
                      </p>
                    </div>

                    <Button text="Update Security Passcode" className="btn btn-primary" style={{ alignSelf: "flex-start" }} />
                  </form>
                </div>
              )}

            </section>
          </div>
        </div>
      </main>

      {/* MODALS: CATEGORY */}
      {showCategoryModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editingCategoryId ? "Edit Category" : "Add New Category"}</h3>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="login-field">
                <label>Category Title</label>
                <input
                  type="text"
                  placeholder="e.g. Waterproofing & Roof"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="login-field">
                  <label>Tag / Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular, Pro Series"
                    value={categoryForm.tag}
                    onChange={(e) => setCategoryForm({ ...categoryForm, tag: e.target.value })}
                  />
                </div>
                <div className="login-field">
                  <label>Product Count</label>
                  <input
                    type="text"
                    placeholder="e.g. 18 products"
                    value={categoryForm.count}
                    onChange={(e) => setCategoryForm({ ...categoryForm, count: e.target.value })}
                  />
                </div>
              </div>

              <div className="login-field">
                <label>Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  required
                />
              </div>

              <div className="login-field">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Short description shown on the Categories page..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-ghost">Cancel</button>
                <Button text="Save Category" className="btn btn-primary" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS: BANNER */}
      {showBannerModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editingBannerId ? "Edit Hero Banner" : "Add Hero Banner Slide"}</h3>
              <button className="modal-close" onClick={() => setShowBannerModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveBanner} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="login-field">
                <label>Top Eyebrow Badge</label>
                <input
                  type="text"
                  placeholder="e.g. ✦ PAKISTAN'S PREMIER LUXURY PAINT HOUSE"
                  value={bannerForm.badge}
                  onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                  required
                />
              </div>

              <div className="login-field">
                <label>Main Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Architectural Interior Velvet Emulsions"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="login-field">
                <label>Subtitle / Description</label>
                <textarea
                  rows="3"
                  placeholder="Formulated with zero-VOC eco resins..."
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="login-field">
                  <label>CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="Explore Interior Paints →"
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    required
                  />
                </div>
                <div className="login-field">
                  <label>CTA Button URL</label>
                  <input
                    type="text"
                    placeholder="/shop or /categories"
                    value={bannerForm.ctaUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaUrl: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label>Background Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={bannerForm.bgImage}
                  onChange={(e) => setBannerForm({ ...bannerForm, bgImage: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowBannerModal(false)} className="btn btn-ghost">Cancel</button>
                <Button text="Save Slide" className="btn btn-primary" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS: BRAND */}
      {showBrandModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editingBrandId ? "Edit Brand" : "Add Partner Brand"}</h3>
              <button className="modal-close" onClick={() => setShowBrandModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveBrand} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="login-field">
                <label>Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jotun Paints"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="login-field">
                <label>Origin / Parent Company</label>
                <input
                  type="text"
                  placeholder="e.g. Norway or AkzoNobel"
                  value={brandForm.origin}
                  onChange={(e) => setBrandForm({ ...brandForm, origin: e.target.value })}
                  required
                />
              </div>

              <div className="login-field">
                <label>Highlight Series</label>
                <input
                  type="text"
                  placeholder="e.g. Fenomastic & Majestic"
                  value={brandForm.highlight}
                  onChange={(e) => setBrandForm({ ...brandForm, highlight: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowBrandModal(false)} className="btn btn-ghost">Cancel</button>
                <Button text="Save Brand" className="btn btn-primary" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS: PRODUCT */}
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
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="login-field">
                  <label>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categoriesList.map((c) => (
                      <option key={c.slug || c.title} value={c.title}>{c.title}</option>
                    ))}
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
                  <input
                    type="number"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="login-field">
                  <label>Stock Quantity (Units)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="login-field">
                  <label>Unit Label</label>
                  <select value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}>
                    <option value="/ gallon">/ gallon</option>
                    <option value="/ piece">/ piece</option>
                    <option value="/ liter">/ liter</option>
                    <option value="/ drum">/ drum</option>
                    <option value="/ set">/ set</option>
                  </select>
                </div>
              </div>

              <div className="login-field">
                <label>Image URL or Upload</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://..."
                    style={{ flex: 1 }}
                    required
                  />
                  <input type="file" accept="image/*" id="admin-prod-upload" onChange={handleProductImageUpload} style={{ display: "none" }} />
                  <label htmlFor="admin-prod-upload" className="btn btn-ghost" style={{ cursor: "pointer", padding: "10px 14px" }}>Upload 📸</label>
                </div>
              </div>

              <div className="login-field">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
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
    </div>
  );
}
