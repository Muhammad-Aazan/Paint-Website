import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/common/useToast";
import { getAllPromoDeals } from "@/services/bannerHelpers";

export default function PromoBanners() {
  const toast = useToast();
  const [copiedCode, setCopiedCode] = useState(null);
  const [offers, setOffers] = useState(() => getAllPromoDeals());

  useEffect(() => {
    const updateDeals = () => setOffers(getAllPromoDeals());
    updateDeals();

    let bc = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("drip_orders_realtime");
        bc.onmessage = (event) => {
          if (event.data?.type === "DEALS_UPDATED") {
            setOffers(event.data.payload || getAllPromoDeals());
          }
        };
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === "drip_promo_deals_db") {
        updateDeals();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

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
              key={offer.id || offer.code}
              className="promo-card"
            >
              <div>
                <div className="promo-card-top">
                  <span className="promo-badge">
                    ✦ {offer.badge}
                  </span>
                  <span className="promo-discount-num">
                    {offer.discount}
                  </span>
                </div>

                <h3 className="promo-card-title">{offer.title}</h3>
                <p className="promo-card-desc">{offer.desc}</p>
              </div>

              <div>
                <div className="promo-coupon-box">
                  <span className="promo-code-text">{offer.code}</span>
                  <button
                    type="button"
                    className="promo-copy-btn"
                    onClick={() => handleCopyCode(offer.code)}
                  >
                    {copiedCode === offer.code ? "✓ Copied" : "Copy Code"}
                  </button>
                </div>

                <Link
                  to="/shop"
                  className="promo-shop-link"
                >
                  Shop Eligible Paints →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
