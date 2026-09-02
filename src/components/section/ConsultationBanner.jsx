import React from "react";
import { Link } from "react-router-dom";

export default function ConsultationBanner() {
  const whatsappNumber = "923001234567";
  const whatsappText = encodeURIComponent(
    "Salam DRIP Team! I am renovating a house/villa and need a custom paint volume calculation, shade card, and quotation."
  );

  return (
    <section className="consultation-section">
      <div className="wrap">
        <div className="consultation-card">
          <div className="consultation-content">
            <span className="consultation-badge">
              ✦ ARCHITECTURAL &amp; CONTRACTOR CONSULTATION
            </span>
            <h2 className="consultation-title">
              Painting or Renovating Your Villa or Commercial Project in Pakistan?
            </h2>
            <p className="consultation-desc">
              Send your room square footage, CAD floorplan, or photos directly to our paint engineers.
              We calculate exact primer and coat volumes, formulate custom computerized shades, and deliver
              bulk contractor-discounted pallets directly to your construction site.
            </p>

            <div className="consultation-buttons">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg consultation-wa-btn"
              >
                💬 WhatsApp Blueprint &amp; Get Quote
              </a>

              <Link to="/calculator" className="btn btn-ghost btn-lg consultation-calc-btn">
                📐 Use Paint Calculator →
              </Link>
            </div>

            <div className="consultation-perks">
              <span className="consultation-perk">✓ Free Color Mixing</span>
              <span className="consultation-perk">✓ 10-Year Weatherproof Guarantee</span>
              <span className="consultation-perk">✓ Direct Factory Dispatch</span>
            </div>
          </div>

          <div className="consultation-visual">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
              alt="Architectural Villa Paint Consultation"
              className="consultation-img"
              loading="lazy"
            />
            <div className="consultation-caption">
              <span>Modern Luxury Residence — DHA Phase 8 Lahore</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
