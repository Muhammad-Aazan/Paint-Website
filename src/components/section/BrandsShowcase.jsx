import React from "react";

export default function BrandsShowcase() {
  const brands = [
    { name: "Dulux", origin: "AkzoNobel", highlight: "Architectural Emulsions" },
    { name: "Brighto", origin: "Pakistan", highlight: "Super Emulsions & Weathercoat" },
    { name: "Berger", origin: "Robbialac", highlight: "VIP Weathercoat & Enamels" },
    { name: "Nippon", origin: "Japan", highlight: "Anti-Bacterial & Odourless" },
    { name: "Master", origin: "Pakistan", highlight: "Super Emulsion & Synthetic" },
    { name: "Jotun", origin: "Norway", highlight: "Fenomastic & Majestic" },
    { name: "Diamond", origin: "Pakistan", highlight: "Ace All-Weather & WoodCoat" },
    { name: "Dadex", origin: "Building Systems", highlight: "Pipes & Wall Protection" },
  ];

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
            <div key={i} className="brand-chip-card">
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
