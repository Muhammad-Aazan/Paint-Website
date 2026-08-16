import React, { useState } from "react";
import { Navbar, Footer, ProductsSection } from "@/components";

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest");

  return (
    <>
      <Navbar />

      <section className="shop-hero">
        <div className="wrap">
          <p className="shop-eyebrow">
            Premium Paint Collection
          </p>

          <h1 className="shop-title">
            Shop Products
          </h1>

          <p className="shop-desc">
            Browse our complete collection of premium paints,
            brushes and accessories for every project.
          </p>
        </div>
      </section>

      <section className="shop-toolbar">
        <div className="wrap toolbar">
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Newest">Newest</option>
            <option value="Price Low to High">Price Low to High</option>
            <option value="Price High to Low">Price High to Low</option>
            <option value="Best Selling">Best Selling</option>
          </select>
        </div>
      </section>

      <ProductsSection limit={false} searchQuery={searchQuery} sortBy={sortBy} />

      <Footer />
    </>
  );
}