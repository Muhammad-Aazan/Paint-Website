import React from "react";

export default function TrustFeatures() {
  const features = [
    {
      icon: "🚚",
      title: "Nationwide Fast Delivery",
      desc: "Complimentary reinforced courier cargo to Karachi, Lahore, Islamabad & 100+ cities.",
    },
    {
      icon: "🛡️",
      title: "10-Year Anti-Fading Guarantee",
      desc: "Ultra-pure titanium dioxide and lightfast acrylic polymers that resist monsoon moisture and UV heat.",
    },
    {
      icon: "🎨",
      title: "10,000+ Computerized Shades",
      desc: "High-precision spectrophotometer tinting lab for exact shade matching and custom formulation.",
    },
    {
      icon: "🏆",
      title: "100% Genuine Certified Resin",
      desc: "Zero cheap chalking fillers, zero toxic lead. Safe for children and indoor air quality.",
    },
  ];

  return (
    <section className="trust-features-section">
      <div className="wrap">
        <div className="trust-features-grid">
          {features.map((item, idx) => (
            <div key={idx} className="trust-feature-card">
              <div className="trust-feature-icon-box">
                <span className="trust-feature-emoji">{item.icon}</span>
              </div>
              <div className="trust-feature-content">
                <h4 className="trust-feature-title">{item.title}</h4>
                <p className="trust-feature-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
