import React, { useState, useEffect } from "react";
import { getAllBrands } from "@/services/brandHelpers";

export default function BrandsShowcase() {
  const [brands, setBrands] = useState(getAllBrands());

  useEffect(() => {
    setBrands(getAllBrands());

    let bc = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("drip_orders_realtime");
        bc.onmessage = (event) => {
          if (event.data?.type === "BRANDS_UPDATED") {
            setBrands(event.data.payload || getAllBrands());
          }
        };
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === "drip_brands_db") {
        setBrands(getAllBrands());
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <section className="brands-showcase-section">
      <div className="wrap">
        <div className="brands-header">
          <span className="page-eyebrow">VERIFIED PARTNER DISTRIBUTORSHIPS</span>
          <h3 className="brands-title">Authorized Paint &amp; Construction Brands</h3>
          <p className="brands-sub">
            Direct factory authorized supply channel ensuring 100% genuine formulation and unadulterated batch seals.
          </p>
        </div>

        <div className="brands-grid">
          {brands.map((brand, i) => (
            <div key={brand.id || brand.name || i} className="brand-chip-card">
              <span className="brand-badge-name">{brand.name}</span>
              <span className="brand-badge-highlight">{brand.highlight}</span>
              <span className="brand-badge-origin">{brand.origin}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
