import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer, Button } from "@/components";

const values = [
  {
    icon: "🎨",
    title: "Master-Crafted Formulations",
    desc: "Every batch is formulated with high-solids acrylic resins, lightfast pigments, and tested for Pakistan's heat and moisture.",
  },
  {
    icon: "🌿",
    title: "Zero-VOC & Odorless",
    desc: "100% eco-friendly, odorless indoor formulas that ensure safe, breathable air quality for families, children, and pets.",
  },
  {
    icon: "💎",
    title: "Architectural Precision",
    desc: "Raw materials sourced from leading certified suppliers to deliver washable scrub durability and flawless single-coat hide.",
  },
  {
    icon: "🤝",
    title: "National Craftsmanship",
    desc: "Engineered in Pakistan with dedicated color consultation labs across Karachi, Lahore, Islamabad, and nationwide delivery.",
  },
];

const team = [
  {
    name: "Tariq Ahmed",
    role: "Co-Founder & CEO",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Sara Malik",
    role: "Head of Color & Formulation",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Bilal Khan",
    role: "Director of Architectural Supply",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page-root">
      <Navbar />

      {/* 1. Refined Inner Hero */}
      <section className="about-hero-section">
        <div className="wrap">
          <span className="page-eyebrow">OUR HERITAGE &amp; MISSION</span>
          <h1 className="about-hero-title">
            Architectural Color &amp; Premium Paint Formulation
          </h1>
          <p className="about-hero-sub">
            Founded with a vision to redefine surface finishes across Pakistan — combining pure acrylic chemistry, zero-VOC safety, and 10,000+ custom computerized shades.
          </p>
        </div>
      </section>

      {/* 2. Mission & Story */}
      <section className="about-mission-section">
        <div className="wrap">
          <div className="about-mission-grid">
            <div className="about-mission-text">
              <span className="page-eyebrow">PHILOSOPHY</span>
              <h2 className="about-section-heading">
                Color transforms the soul of every space.
              </h2>
              <p className="about-body-p">
                We believe paint should never be an afterthought. A truly exceptional architectural coating provides more than just color — it protects structures against harsh UV heat and monsoons while enhancing natural light with velvety low-sheen finishes.
              </p>
              <p className="about-body-p">
                From our centralized formulation facility and authorized partner distribution network, we supply residential villas, commercial high-rises, and master painters with verified batch consistency.
              </p>
              <div className="about-cta-row">
                <Button
                  text="Explore Color Catalog →"
                  className="btn btn-primary"
                  onClick={() => navigate("/shop")}
                />
                <Button
                  text="Calculate Paint Volume"
                  className="btn btn-ghost"
                  onClick={() => navigate("/calculator")}
                />
              </div>
            </div>

            {/* Key Milestones / Stats */}
            <div className="about-stats-grid">
              <div className="about-stat-card">
                <span className="about-stat-num">2018</span>
                <span className="about-stat-label">Year Founded</span>
              </div>
              <div className="about-stat-card">
                <span className="about-stat-num">10,000+</span>
                <span className="about-stat-label">Computerized Tints</span>
              </div>
              <div className="about-stat-card">
                <span className="about-stat-num">100+</span>
                <span className="about-stat-label">Cities Delivered</span>
              </div>
              <div className="about-stat-card">
                <span className="about-stat-num">50k+</span>
                <span className="about-stat-label">Villas &amp; Homes Painted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="about-values-section">
        <div className="wrap">
          <div className="about-section-header">
            <span className="page-eyebrow">STANDARDS OF EXCELLENCE</span>
            <h2 className="about-section-heading">What We Stand For</h2>
            <p className="about-section-sub">
              Uncompromising dedication to quality resin, environmental responsibility, and long-term surface durability.
            </p>
          </div>

          <div className="about-values-grid">
            {values.map((v, i) => (
              <div key={i} className="about-value-card">
                <span className="about-value-icon">{v.icon}</span>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Leadership & Expertise */}
      <section className="about-team-section">
        <div className="wrap">
          <div className="about-section-header">
            <span className="page-eyebrow">THE TEAM BEHIND DRIP</span>
            <h2 className="about-section-heading">Formulation &amp; Design Leadership</h2>
          </div>

          <div className="about-team-grid">
            {team.map((member, i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-img-wrap">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="about-team-img"
                    loading="lazy"
                  />
                </div>
                <h3 className="about-team-name">{member.name}</h3>
                <span className="about-team-role">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Minimalist Light CTA */}
      <section className="about-bottom-cta">
        <div className="wrap">
          <div className="about-bottom-cta-inner">
            <span className="page-eyebrow">START YOUR TRANSFORMATION</span>
            <h2 className="about-bottom-cta-title">
              Ready to create your dream space?
            </h2>
            <p className="about-bottom-cta-sub">
              Browse 120+ curated architectural shades, test with our room visualizer, or order verified contractor gallons with nationwide shipping.
            </p>
            <div className="about-cta-row">
              <Button
                text="Shop Paint Collection →"
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/shop")}
              />
              <Button
                text="Book Professional Painter"
                className="btn btn-ghost btn-lg"
                onClick={() => navigate("/painters")}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}