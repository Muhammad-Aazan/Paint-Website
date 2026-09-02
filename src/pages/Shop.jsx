import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navbar, Footer, ProductsSection } from "@/components";
import { getAllCategories } from "@/services/categoryHelpers";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  const [categories, setCategories] = useState(() => getAllCategories());

  useEffect(() => {
    setCategories(getAllCategories());
    const handleStorage = () => setCategories(getAllCategories());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const categoryList = [
    { id: "All", label: "All Products", icon: "✨" },
    ...categories.map((c) => ({
      id: c.title,
      label: c.title,
      icon: c.title.toLowerCase().includes("interior")
        ? "🏠"
        : c.title.toLowerCase().includes("exterior")
        ? "🏗️"
        : c.title.toLowerCase().includes("brush")
        ? "🖌️"
        : c.title.toLowerCase().includes("roller")
        ? "🪄"
        : c.title.toLowerCase().includes("spray")
        ? "⚡"
        : "🎨",
    })),
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("Newest");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Sync category param from URL if changed
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("Newest");
    setMaxPrice(50000);
    setInStockOnly(false);
    setMinRating(0);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "All" ||
    sortBy !== "Newest" ||
    maxPrice < 50000 ||
    inStockOnly ||
    minRating > 0;

  return (
    <>
      <Navbar />

      <main className="shop-page-wrapper">
        {/* Shop Hero */}
        <section className="shop-hero">
          <div className="wrap">
            <p className="shop-eyebrow">PREMIUM COATINGS & TOOLS</p>
            <h1 className="shop-title">Architectural Paint Collection</h1>
            <p className="shop-desc">
              Discover Pakistan's finest eco-friendly paints, luxury velvet enamels, and professional application gear.
            </p>

            {/* Quick Navigation Cards */}
            <div className="shop-quick-tools">
              <Link to="/calculator" className="shop-tool-pill">
                <span>📐</span> Paint Calculator
              </Link>
              <Link to="/visualizer" className="shop-tool-pill">
                <span>🎨</span> Room Visualizer
              </Link>
              <Link to="/painters" className="shop-tool-pill">
                <span>👷</span> Hire a Painter
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="shop-category-bar">
          <div className="wrap">
            <div className="shop-cat-pills">
              {categoryList.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`shop-cat-pill ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Toolbar & Filter Controls */}
        <section className="shop-toolbar-section">
          <div className="wrap">
            <div className="shop-toolbar-card">
              {/* Search Box */}
              <div className="shop-search-box">
                <span className="shop-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search paints, rollers, brushes, shades..."
                  className="shop-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="shop-clear-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Controls Row */}
              <div className="shop-filters-row">
                {/* Price Slider */}
                <div className="shop-filter-group">
                  <div className="shop-filter-label">
                    <span>Max Price:</span>
                    <strong>Rs. {maxPrice.toLocaleString()}</strong>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={maxPrice}
                    className="shop-range-slider"
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                </div>

                {/* Rating Filter */}
                <div className="shop-filter-group">
                  <span className="shop-filter-label">Rating:</span>
                  <select
                    className="sort-select"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                  >
                    <option value={0}>All Ratings</option>
                    <option value={4}>4★ & above</option>
                    <option value={5}>5★ only</option>
                  </select>
                </div>

                {/* In Stock Toggle */}
                <div className="shop-filter-group">
                  <label className="shop-stock-toggle">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    <span>In-Stock Only</span>
                  </label>
                </div>

                {/* Sort Dropdown */}
                <div className="shop-filter-group">
                  <span className="shop-filter-label">Sort by:</span>
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Newest">Newest Arrivals</option>
                    <option value="Price Low to High">Price: Low to High</option>
                    <option value="Price High to Low">Price: High to Low</option>
                    <option value="Best Selling">Best Selling</option>
                    <option value="Highest Rated">Highest Rated</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="shop-reset-btn"
                    onClick={handleResetFilters}
                  >
                    Reset Filters ↺
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <ProductsSection
          limit={false}
          searchQuery={searchQuery}
          sortBy={sortBy}
          categoryFilter={selectedCategory}
          maxPrice={maxPrice}
          inStockOnly={inStockOnly}
          minRating={minRating}
        />
      </main>

      <Footer />
    </>
  );
}