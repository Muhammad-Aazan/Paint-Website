import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/common/useToast";

export default function PromoBanners() {
  const toast = useToast();
  const [copiedCode, setCopiedCode] = useState(null);

  const offers = [
    {
      id: "opt-1",
      badge: "SEASONAL SAVINGS",
      discount: "20% OFF",
      title: "Architectural Interior Matte & Velvet Emulsions",
      desc: "Apply discount code on all interior gallons and quarter cans for living rooms and master suites.",
      code: "WELCOME20",
      bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
      accent: "#a5b4fc",
    },
    {
      id: "opt-2",
      badge: "MONSOON SHIELD",
      discount: "Rs. 500 OFF",
      title: "Exterior Weatherproof Acrylic & Elastomeric Paints",
      desc: "Heavy-duty UV and dampness protection for house exteriors, boundary walls, and rooftops.",
      code: "DRIP500",
      bgGradient: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
      accent: "#6ee7b7",
    },
    {
      id: "opt-3",
      badge: "BULK CONTRACTOR",
      discount: "FREE SHIPPING",
      title: "Full House & Commercial Villa Orders (Above Rs. 15k)",
      desc: "Direct factory freight dispatch across Pakistan with zero shipping charges and priority tinting.",
      code: "FREESHIP",
      bgGradient: "linear-gradient(135deg, #78350f 0%, #92400e 100%)",
      accent: "#fde68a",
    },
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast?.show(`Coupon code "${code}" copied to clipboard!`, "success");
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <section className="promo-banners-section">
      <div className="wrap">
        <div className="promo-section-header">
          <span className="page-eyebrow">EXCLUSIVE DIRECT DISCOUNTS</span>
          <h2 className="promo-section-title">Active Promotional Vouchers &amp; Offers</h2>
          <p className="promo-section-sub">
            Copy any active discount coupon and paste it directly at checkout for instant savings.
          </p>
        </div>

        <div className="promo-banners-grid">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="promo-card"
              style={{ background: offer.bgGradient }}
            >
              <div className="promo-card-top">
                <span className="promo-badge" style={{ color: offer.accent, borderColor: `${offer.accent}40` }}>
                  {offer.badge}
                </span>
                <span className="promo-discount-num" style={{ color: offer.accent }}>
                  {offer.discount}
                </span>
              </div>

              <h3 className="promo-card-title">{offer.title}</h3>
              <p className="promo-card-desc">{offer.desc}</p>

              <div className="promo-coupon-box">
                <span className="promo-code-text">{offer.code}</span>
                <button
                  type="button"
                  className="promo-copy-btn"
                  onClick={() => handleCopyCode(offer.code)}
                >
                  {copiedCode === offer.code ? "✓ Copied!" : "📋 Copy Code"}
                </button>
              </div>

              <div className="promo-card-footer">
                <Link to="/shop" className="promo-shop-link" style={{ color: offer.accent }}>
                  Claim in Paint Shop →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
