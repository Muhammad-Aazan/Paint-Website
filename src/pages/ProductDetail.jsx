import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Navbar, Footer, Button } from "@/components";
import { useToast } from "@/components/common/useToast";
import { addToCart } from "@/features/cart/cartSlice";
import { addToWishlist as addWishlist, removeFromWishlist as removeWishlist } from "@/features/wishlist/wishlistSlice";
import { supabase } from "@/services/supabase";
import { syncWishlistToSupabase, syncCartToSupabase } from "@/services/supabaseHelpers";

import paintBucket1 from "@/assets/paint-bkt-1.png";
import paintBucket2 from "@/assets/paint-bkt-2.png";
import paintBucket3 from "@/assets/paint-bkt-3.png";
import paintBrush   from "@/assets/paint-brush-1.png";
import roller       from "@/assets/roller.png";
import spray        from "@/assets/spray.png";

const fallbackProducts = [
  {
    id: 1,
    image: paintBucket1,
    category: "Interior Paint",
    name: "Cobalt Hour — Matte",
    rating: "★★★★★",
    ratingScore: 4.9,
    reviews: 128,
    price: 2450,
    unit: "/ gallon",
    stock: 24,
    description: "A rich, velvety deep cobalt interior paint designed for statement walls and tranquil spaces. Formulated with zero VOCs and advanced micro-pigment technology for flawless one-coat hide.",
    sheen: "Ultra-Matte",
    coverage: "350 – 400 sq. ft. per gallon",
    dryTime: "30 min touch, 2 hours recoat",
    cleanup: "Soap & warm water",
    isPaint: true,
  },
  {
    id: 2,
    image: paintBucket2,
    category: "Exterior Paint",
    name: "Clay Pot — Weatherproof",
    rating: "★★★★☆",
    ratingScore: 4.7,
    reviews: 94,
    price: 2850,
    unit: "/ gallon",
    stock: 9,
    description: "An earthy, resilient exterior acrylic latex formula engineered to withstand intense sunlight, monsoon rains, and temperature swings without cracking or fading.",
    sheen: "Low-Lustre Satin",
    coverage: "300 – 350 sq. ft. per gallon",
    dryTime: "1 hour touch, 4 hours recoat",
    cleanup: "Water & detergent",
    isPaint: true,
  },
  {
    id: 3,
    image: paintBucket3,
    category: "Premium Paint",
    name: "Forest Green — Luxury Enamel",
    rating: "★★★★★",
    ratingScore: 5.0,
    reviews: 210,
    price: 3250,
    unit: "/ gallon",
    stock: 31,
    description: "Our signature luxury interior & exterior architectural coating with unmatched depth of color and superior washability for busy homes and high-traffic areas.",
    sheen: "Velvet Eggshell",
    coverage: "400 – 450 sq. ft. per gallon",
    dryTime: "45 min touch, 2 hours recoat",
    cleanup: "Warm water",
    isPaint: true,
  },
  {
    id: 4,
    image: paintBrush,
    category: "Brushes",
    name: "Premium Paint Brush (2.5\")",
    rating: "★★★★☆",
    ratingScore: 4.6,
    reviews: 85,
    price: 750,
    unit: "/ piece",
    stock: 18,
    description: "Handcrafted synthetic tapered bristles for razor-sharp cutting-in lines and zero brush strokes. Ergonomic hardwood handle with stainless steel ferrule.",
    sheen: "N/A",
    coverage: "N/A",
    dryTime: "N/A",
    cleanup: "Rinse immediately after use",
    isPaint: false,
  },
  {
    id: 5,
    image: roller,
    category: "Rollers",
    name: "Professional Roller & Frame (9\")",
    rating: "★★★★★",
    ratingScore: 4.8,
    reviews: 61,
    price: 950,
    unit: "/ piece",
    stock: 22,
    description: "Shed-resistant microfiber roller sleeve with a heavy-duty 5-wire cage frame. Delivers ultra-smooth, uniform paint release with minimal splatter.",
    sheen: "N/A",
    coverage: "N/A",
    dryTime: "N/A",
    cleanup: "Wash with warm water and spin dry",
    isPaint: false,
  },
  {
    id: 6,
    image: spray,
    category: "Spray Equipment",
    name: "Professional HVLP Spray Gun",
    rating: "★★★★★",
    ratingScore: 4.9,
    reviews: 44,
    price: 3500,
    unit: "/ piece",
    stock: 5,
    description: "High-volume low-pressure precision spray gun for glass-smooth finishes on cabinets, doors, furniture, and walls. 3 adjustable brass spray patterns.",
    sheen: "N/A",
    coverage: "N/A",
    dryTime: "N/A",
    cleanup: "Flush with solvent/water immediately",
    isPaint: false,
  },
];

const colorSwatches = [
  { name: "Cobalt Hour", hex: "#1e3d6e", code: "DP-01" },
  { name: "Clay Warmth", hex: "#9d5b3d", code: "DP-02" },
  { name: "Forest Velvet", hex: "#2d5a3f", code: "DP-03" },
  { name: "Saffron Sun", hex: "#d4882a", code: "DP-04" },
  { name: "Ivory Cream", hex: "#f4ebd9", code: "DP-05" },
  { name: "Crimson Bloom", hex: "#992834", code: "DP-06" },
  { name: "Sage Mist", hex: "#7a9a7a", code: "DP-07" },
  { name: "Charcoal Slate", hex: "#33363b", code: "DP-08" },
];

const finishOptions = [
  { id: "matte", label: "Matte", desc: "Non-reflective, hides wall imperfections" },
  { id: "eggshell", label: "Eggshell", desc: "Subtle soft sheen, easy to clean" },
  { id: "satin", label: "Satin", desc: "Silky finish, great for kitchens & baths" },
  { id: "gloss", label: "Semi-Gloss", desc: "Durable, moisture-resistant shine" },
];

const sizeOptions = [
  { id: "1L", label: "1 Liter (Quarter)", multiplier: 0.35, desc: "Touch-ups & accent nooks (~100 sq ft)" },
  { id: "4L", label: "4 Liters (1 Gallon)", multiplier: 1.0, desc: "Standard room (~350-400 sq ft)" },
  { id: "16L", label: "16 Liters (Drum)", multiplier: 3.6, desc: "Full house projects (~1,500 sq ft)" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { user } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(colorSwatches[0]);
  const [selectedFinish, setSelectedFinish] = useState(finishOptions[0].id);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[1].id);
  const [activeTab, setActiveTab] = useState("overview");

  // Reviews state
  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      author: "Farhan Siddiqui",
      rating: 5,
      date: "2 days ago",
      comment: "Incredible paint coverage! The color matched the digital preview exactly. One gallon easily covered our 14x14 master bedroom with rich, deep color.",
      verified: true,
    },
    {
      id: 2,
      author: "Zainab Malik",
      rating: 5,
      date: "1 week ago",
      comment: "Completely odorless and dried super fast. We were able to sleep in the newly painted room on the very same night. Highly recommended!",
      verified: true,
    },
    {
      id: 3,
      author: "Tariq Mahmood",
      rating: 4,
      date: "2 weeks ago",
      comment: "Very smooth finish with the microfiber roller. Arrived in Lahore within 2 days with safe packaging.",
      verified: true,
    },
  ]);

  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (data && !error) {
          setProduct({
            ...data,
            ratingScore: data.rating || 5,
            reviews: data.reviews_count || 12,
            isPaint: (data.category || "").toLowerCase().includes("paint"),
            coverage: "350 – 400 sq. ft. per gallon",
            dryTime: "30 min touch, 2 hours recoat",
            cleanup: "Warm water & soap",
          });
        } else {
          const found = fallbackProducts.find((p) => String(p.id) === String(id)) || fallbackProducts[0];
          setProduct(found);
        }
      } catch {
        const found = fallbackProducts.find((p) => String(p.id) === String(id)) || fallbackProducts[0];
        setProduct(found);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "36px", animation: "dot-pulse 1s infinite" }}>🎨</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="wrap" style={{ padding: "80px 0", textAlign: "center" }}>
          <h2>Product Not Found</h2>
          <Button text="Return to Shop" className="btn btn-primary" style={{ marginTop: "20px" }} onClick={() => navigate("/shop")} />
        </div>
        <Footer />
      </>
    );
  }

  const isPaint = product.isPaint ?? (product.category || "").toLowerCase().includes("paint");
  const sizeMultiplier = sizeOptions.find((s) => s.id === selectedSize)?.multiplier || 1.0;
  const basePrice = typeof product.price === "number" ? product.price : Number(String(product.price).replace(/[^0-9.-]+/g, "")) || 2450;
  const calculatedUnitPrice = Math.round(basePrice * (isPaint ? sizeMultiplier : 1));
  const totalPrice = calculatedUnitPrice * quantity;

  const isWishlist = wishlistItems.some((i) => String(i.id) === String(product.id));

  const handleWishlistToggle = async () => {
    if (isWishlist) {
      dispatch(removeWishlist(product.id));
      toast?.show(`Removed from wishlist`, "info");
      const updated = wishlistItems.filter((i) => String(i.id) !== String(product.id));
      await syncWishlistToSupabase(user, updated);
    } else {
      const item = {
        id: product.id,
        name: product.name,
        image: product.image_url || product.image,
        category: product.category || "Product",
        price: `Rs. ${calculatedUnitPrice.toLocaleString()}`,
        unit: product.unit || "/ piece",
        rating: product.rating || "★★★★★",
        reviews: String(product.reviews || "10"),
      };
      dispatch(addWishlist(item));
      toast?.show(`Added to wishlist ❤️`, "success");
      const updated = [...wishlistItems, item];
      await syncWishlistToSupabase(user, updated);
    }
  };

  const handleAddCart = () => {
    const itemToAdd = {
      ...product,
      id: `${product.id}-${isPaint ? selectedSize : "standard"}-${isPaint ? selectedColor.name.replace(/\s+/g, "") : ""}`,
      name: isPaint ? `${product.name} (${selectedColor.name} · ${selectedSize})` : product.name,
      image: product.image_url || product.image,
      price: calculatedUnitPrice,
      unit: product.unit || "/ piece",
      quantity,
      selectedColor: isPaint ? selectedColor : null,
      selectedFinish: isPaint ? selectedFinish : null,
      selectedSize: isPaint ? selectedSize : null,
    };

    dispatch(addToCart(itemToAdd));
    toast?.show(`Added ${quantity}x "${itemToAdd.name}" to cart 🛒`, "success");

    if (user?.id) {
      const updatedCart = [
        ...cartItems.filter((i) => String(i.id) !== String(itemToAdd.id)),
        { ...itemToAdd, quantity: (cartItems.find((i) => String(i.id) === String(itemToAdd.id))?.quantity || 0) + quantity },
      ];
      syncCartToSupabase(user.id, updatedCart).catch(() => {});
    }
  };

  const handleBuyNow = () => {
    handleAddCart();
    navigate("/cart");
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const added = {
      id: Date.now(),
      author: newReview.name,
      rating: newReview.rating,
      date: "Just now",
      comment: newReview.comment,
      verified: true,
    };

    setReviewsList([added, ...reviewsList]);
    setNewReview({ name: "", rating: 5, comment: "" });
    setShowReviewForm(false);
    toast?.show("Thank you for your review! ⭐", "success");
  };

  return (
    <>
      <Navbar />

      <main className="product-detail-page">
        <div className="wrap">
          {/* Breadcrumb Navigation */}
          <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/shop">Shop</Link>
            <span>/</span>
            <Link to={`/shop?category=${encodeURIComponent(product.category || "All")}`}>{product.category || "Paints"}</Link>
            <span>/</span>
            <span className="current">{product.name}</span>
          </nav>

          {/* Product Hero Grid */}
          <div className="pdp-grid">
            {/* Left: Gallery & Color Swatch Visualizer Preview */}
            <div className="pdp-gallery-col">
              <div className="pdp-main-image-wrap">
                <img
                  src={product.image_url || product.image}
                  alt={product.name}
                  className="pdp-main-image"
                />

                {isPaint && (
                  <div
                    className="pdp-swatch-badge"
                    style={{ backgroundColor: selectedColor.hex }}
                    title={`Active Color: ${selectedColor.name}`}
                  >
                    <span className="pdp-swatch-badge-tag">{selectedColor.name}</span>
                  </div>
                )}

                <button
                  className={`pdp-wishlist-btn ${isWishlist ? "active" : ""}`}
                  onClick={handleWishlistToggle}
                  aria-label={isWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlist ? "❤️" : "🤍"}
                </button>
              </div>

              {/* Visualizer & Calculator Quick Banners */}
              <div className="pdp-feature-cards">
                <Link to="/visualizer" className="pdp-quick-card">
                  <span className="pdp-quick-icon">🖌️</span>
                  <div>
                    <strong>Test in Room Visualizer</strong>
                    <p>Preview this shade in a 3D simulated room</p>
                  </div>
                  <span className="pdp-quick-arrow">→</span>
                </Link>

                <Link to="/calculator" className="pdp-quick-card">
                  <span className="pdp-quick-icon">📐</span>
                  <div>
                    <strong>Paint Coverage Calculator</strong>
                    <p>Calculate exact gallons required for your walls</p>
                  </div>
                  <span className="pdp-quick-arrow">→</span>
                </Link>
              </div>
            </div>

            {/* Right: Product Purchase Controls */}
            <div className="pdp-details-col">
              <div className="pdp-category-tag">{product.category || "Paint & Supplies"}</div>
              <h1 className="pdp-title">{product.name}</h1>

              {/* Rating & Reviews */}
              <div className="pdp-rating-row">
                <div className="pdp-stars">{product.rating || "★★★★★"}</div>
                <span className="pdp-rating-number">{product.ratingScore || 4.9} / 5.0</span>
                <span className="pdp-review-count">({reviewsList.length + 40} verified reviews)</span>
                <span className="pdp-stock-status">
                  <span className="pdp-stock-dot" /> In Stock & Ready to Ship
                </span>
              </div>

              {/* Price Row */}
              <div className="pdp-price-box">
                <div className="pdp-price-amount">
                  Rs. {calculatedUnitPrice.toLocaleString()}
                  <span className="pdp-unit-label"> {isPaint ? `per ${selectedSize}` : product.unit || ""}</span>
                </div>
                <span className="pdp-tax-tag">Inclusive of all taxes · Free delivery</span>
              </div>

              <p className="pdp-short-desc">{product.description}</p>

              {/* COLOR SWATCH SELECTION (For paints) */}
              {isPaint && (
                <div className="pdp-option-section">
                  <div className="pdp-option-header">
                    <span className="pdp-option-title">1. Select Color Shade:</span>
                    <strong className="pdp-option-selected">{selectedColor.name} ({selectedColor.code})</strong>
                  </div>

                  <div className="pdp-swatch-grid">
                    {colorSwatches.map((color) => (
                      <button
                        key={color.code}
                        type="button"
                        className={`pdp-swatch-item ${selectedColor.code === color.code ? "selected" : ""}`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setSelectedColor(color)}
                        title={`${color.name} (${color.code})`}
                      >
                        {selectedColor.code === color.code && <span className="pdp-swatch-check">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FINISH / SHEEN SELECTION */}
              {isPaint && (
                <div className="pdp-option-section">
                  <div className="pdp-option-header">
                    <span className="pdp-option-title">2. Select Finish:</span>
                    <strong className="pdp-option-selected">{finishOptions.find((f) => f.id === selectedFinish)?.label}</strong>
                  </div>

                  <div className="pdp-finish-grid">
                    {finishOptions.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`pdp-finish-pill ${selectedFinish === f.id ? "active" : ""}`}
                        onClick={() => setSelectedFinish(f.id)}
                      >
                        <div className="pdp-finish-name">{f.label}</div>
                        <div className="pdp-finish-sub">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CAN SIZE / VOLUME SELECTION */}
              {isPaint && (
                <div className="pdp-option-section">
                  <div className="pdp-option-header">
                    <span className="pdp-option-title">3. Select Container Size:</span>
                    <strong className="pdp-option-selected">{sizeOptions.find((s) => s.id === selectedSize)?.label}</strong>
                  </div>

                  <div className="pdp-size-grid">
                    {sizeOptions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`pdp-size-pill ${selectedSize === s.id ? "active" : ""}`}
                        onClick={() => setSelectedSize(s.id)}
                      >
                        <div className="pdp-size-name">{s.label}</div>
                        <div className="pdp-size-sub">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="pdp-actions-row">
                <div className="pdp-quantity-control">
                  <button
                    type="button"
                    className="pdp-qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="pdp-qty-display">{quantity}</span>
                  <button
                    type="button"
                    className="pdp-qty-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <Button
                  text={`Add to Cart • Rs. ${totalPrice.toLocaleString()}`}
                  className="btn btn-primary btn-lg pdp-add-btn"
                  onClick={handleAddCart}
                />

                <Button
                  text="Buy Now"
                  className="btn btn-secondary btn-lg pdp-buynow-btn"
                  onClick={handleBuyNow}
                />
              </div>

              {/* Assurance Trust Badges */}
              <div className="pdp-trust-grid">
                <div className="pdp-trust-item">
                  <span>🚚</span>
                  <div>
                    <strong>Express Delivery</strong>
                    <p>2-3 Business Days Across Pakistan</p>
                  </div>
                </div>
                <div className="pdp-trust-item">
                  <span>🛡️</span>
                  <div>
                    <strong>100% Color Match</strong>
                    <p>Guaranteed authentic batch mixing</p>
                  </div>
                </div>
                <div className="pdp-trust-item">
                  <span>🌿</span>
                  <div>
                    <strong>Zero-VOC & Odorless</strong>
                    <p>Safe for children and pets</p>
                  </div>
                </div>
                <div className="pdp-trust-item">
                  <span>💬</span>
                  <div>
                    <strong>Free Color Advice</strong>
                    <p>Consult with our in-house master painters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABBED DETAILS & SPECIFICATIONS & REVIEWS */}
          <div className="pdp-tabs-container">
            <div className="pdp-tab-nav" role="tablist">
              <button
                className={`pdp-tab-btn ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview & Features
              </button>
              <button
                className={`pdp-tab-btn ${activeTab === "specs" ? "active" : ""}`}
                onClick={() => setActiveTab("specs")}
              >
                Technical Specifications
              </button>
              <button
                className={`pdp-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Customer Reviews ({reviewsList.length})
              </button>
            </div>

            <div className="pdp-tab-content">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="pdp-overview-pane">
                  <div className="pdp-features-list">
                    <div className="pdp-feature-box">
                      <div className="pdp-feature-icon">✨</div>
                      <h3>Flawless 1-Coat Coverage</h3>
                      <p>Ultra-dense titanium dioxide formula provides high opacity to conceal dark wall stains in a single application.</p>
                    </div>
                    <div className="pdp-feature-box">
                      <div className="pdp-feature-icon">🧽</div>
                      <h3>Scrub & Wash Resistant</h3>
                      <p>Advanced ceramic microsphere technology creates a washable barrier against food splatters, crayons, and scuffs.</p>
                    </div>
                    <div className="pdp-feature-box">
                      <div className="pdp-feature-icon">☀️</div>
                      <h3>UV & Moisture Guard</h3>
                      <p>Resistant to high humidity, mold, mildew, and solar radiation, preventing chalking and discoloration over years.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECS */}
              {activeTab === "specs" && (
                <div className="pdp-specs-pane">
                  <table className="pdp-specs-table">
                    <tbody>
                      <tr>
                        <th>Product Category</th>
                        <td>{product.category || "Premium Coating"}</td>
                      </tr>
                      <tr>
                        <th>Recommended Application</th>
                        <td>Interior / Exterior Walls, Trim, Drywall, Masonry, Plaster</td>
                      </tr>
                      <tr>
                        <th>Coverage Area</th>
                        <td>{product.coverage || "350 - 400 sq. ft. per gallon"}</td>
                      </tr>
                      <tr>
                        <th>Drying Time</th>
                        <td>{product.dryTime || "Touch: 30-45 min · Recoat: 2 hours"}</td>
                      </tr>
                      <tr>
                        <th>Recommended Coats</th>
                        <td>2 coats recommended for optimal depth and longevity</td>
                      </tr>
                      <tr>
                        <th>Clean-up Method</th>
                        <td>{product.cleanup || "Warm soapy water"}</td>
                      </tr>
                      <tr>
                        <th>VOC Rating</th>
                        <td>&lt; 5 g/L (Ultra-low VOC compliant)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: REVIEWS */}
              {activeTab === "reviews" && (
                <div className="pdp-reviews-pane">
                  <div className="pdp-reviews-header">
                    <div>
                      <h3 style={{ fontSize: "22px", fontFamily: "var(--display)", marginBottom: "4px" }}>
                        Customer Feedback
                      </h3>
                      <p style={{ color: "var(--ink-soft)", fontSize: "14px" }}>
                        Based on verified purchases from homeowners and contractors
                      </p>
                    </div>

                    <Button
                      text={showReviewForm ? "Cancel Review" : "Write a Review ✍️"}
                      className="btn btn-ghost"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    />
                  </div>

                  {/* Write Review Form */}
                  {showReviewForm && (
                    <form className="pdp-review-form" onSubmit={handleReviewSubmit}>
                      <h4 style={{ marginBottom: "12px", fontFamily: "var(--ui)" }}>Share your experience:</h4>
                      <div className="form-group">
                        <label className="form-label">Your Name</label>
                        <input
                          type="text"
                          className="form-input"
                          required
                          placeholder="e.g. Asad Khan"
                          value={newReview.name}
                          onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Rating</label>
                        <select
                          className="form-input"
                          value={newReview.rating}
                          onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        >
                          <option value={5}>★★★★★ (5 - Excellent)</option>
                          <option value={4}>★★★★☆ (4 - Very Good)</option>
                          <option value={3}>★★★☆☆ (3 - Average)</option>
                          <option value={2}>★★☆☆☆ (2 - Below Average)</option>
                          <option value={1}>★☆☆☆☆ (1 - Poor)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Review Details</label>
                        <textarea
                          className="form-input"
                          rows="3"
                          required
                          placeholder="Tell us about the coverage, shade accuracy, and finish quality..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        />
                      </div>
                      <Button text="Submit Review →" className="btn btn-primary" />
                    </form>
                  )}

                  {/* Reviews List */}
                  <div className="pdp-reviews-list">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="pdp-review-card">
                        <div className="pdp-review-top">
                          <div>
                            <strong>{rev.author}</strong>
                            {rev.verified && <span className="pdp-verified-badge">✓ Verified Buyer</span>}
                          </div>
                          <span className="pdp-review-date">{rev.date}</span>
                        </div>
                        <div className="pdp-review-stars">
                          {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                        </div>
                        <p className="pdp-review-body">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Grid */}
          <section className="pdp-related-section">
            <h2 className="pdp-related-title">Recommended Accessories & Paints</h2>
            <div className="products-grid">
              {fallbackProducts
                .filter((p) => String(p.id) !== String(product.id))
                .slice(0, 3)
                .map((rel) => (
                  <div
                    key={rel.id}
                    className="product-card"
                    onClick={() => navigate(`/product/${rel.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="product-card-img-wrap">
                      <img src={rel.image} alt={rel.name} className="product-card-img" />
                    </div>
                    <div className="product-card-body">
                      <span className="product-card-cat">{rel.category}</span>
                      <h3 className="product-card-name">{rel.name}</h3>
                      <div className="product-card-footer">
                        <span className="product-card-price">Rs. {rel.price.toLocaleString()}</span>
                        <Button text="View Details →" className="btn btn-ghost btn-sm" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
