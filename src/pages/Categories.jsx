import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer } from "@/components";

import interiorImg from "@/assets/cat-interior.png";
import exteriorImg from "@/assets/cat-exterior.png";
import primerImg   from "@/assets/cat-primer.png";
import brushesImg  from "@/assets/cat-brushes.png";
import rollersImg  from "@/assets/cat-rollers.png";
import sprayImg    from "@/assets/cat-spray.png";

const categories = [
  {
    image: interiorImg,
    title: "Interior Paint",
    description: "Transform your living spaces with rich, washable matte and eggshell finishes.",
    count: "42 products",
    tag: "Most Popular",
    color: "var(--cobalt)",
  },
  {
    image: exteriorImg,
    title: "Exterior Paint",
    description: "Weatherproof formulas that resist UV, heat, and Pakistan's harsh monsoons.",
    count: "28 products",
    tag: "All-Weather",
    color: "var(--sage)",
  },
  {
    image: primerImg,
    title: "Primers & Sealers",
    description: "Professional-grade adhesion primers for walls, wood, metal and concrete.",
    count: "18 products",
    tag: "Pro Series",
    color: "var(--saffron)",
  },
  {
    image: brushesImg,
    title: "Brushes",
    description: "Hand-selected bristle and synthetic brushes for flawless cut-in work.",
    count: "24 products",
    tag: "Precision",
    color: "var(--poppy)",
  },
  {
    image: rollersImg,
    title: "Rollers & Frames",
    description: "Low-splatter rollers for smooth, professional coverage on any surface.",
    count: "15 products",
    tag: "Smooth Finish",
    color: "var(--cobalt-light)",
  },
  {
    image: sprayImg,
    title: "Spray Equipment",
    description: "Electric HVLP and airless sprayers for large-scale professional projects.",
    count: "9 products",
    tag: "Professional",
    color: "var(--sage-light)",
  },
];

export default function Categories() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="categories-hero">
        <div className="wrap">
          <p className="shop-eyebrow">BROWSE BY CATEGORY</p>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Shop Every Product Category
          </h1>
          <p className="shop-desc">
            From premium interior finishes to professional spray equipment —<br />
            explore our complete range of paints and tools.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ padding: "64px 0 96px", background: "var(--canvas)" }}>
        <div className="wrap">
          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="category-card"
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.title)}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/shop?category=${encodeURIComponent(cat.title)}`)}
              >
                <img src={cat.image} alt={cat.title} loading="lazy" />

                {/* Tag badge */}
                <div style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  padding: "4px 12px",
                  background: cat.color,
                  color: "white",
                  borderRadius: "99px",
                  fontSize: "11px",
                  fontFamily: "var(--mono)",
                  fontWeight: "700",
                  letterSpacing: "0.06em",
                  zIndex: 2,
                }}>
                  {cat.tag}
                </div>

                {/* Overlay info */}
                <div className="category-card-overlay">
                  <div>
                    <p className="category-card-title">{cat.title}</p>
                    <p className="category-card-count">{cat.description}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginTop: "6px", fontFamily: "var(--mono)" }}>
                      {cat.count} →
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: "center", marginTop: "16px", padding: "56px 0 0", borderTop: "1px solid var(--paper-line)" }}>
            <p className="products-eyebrow" style={{ marginBottom: "12px" }}>Can't find what you need?</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(24px, 3vw, 36px)", marginBottom: "20px" }}>
              Visit a Drip branch near you
            </h2>
            <p style={{ color: "var(--ink-soft)", marginBottom: "28px", fontSize: "16px" }}>
              Our color experts will mix any shade you want — for free.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/contact")}
            >
              Find a Branch →
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}