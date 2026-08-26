import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";

const slides = [
  {
    id: "slide-1",
    badge: "✦ PAKISTAN'S PREMIER LUXURY PAINT HOUSE",
    title: "Architectural Interior Velvet & Silk Emulsions",
    subtitle: "Formulated with zero-VOC eco resins, washable scrub durability, and ultra-deep pigments for luxury residences, apartments, and villas.",
    ctaText: "Explore Interior Paints →",
    ctaUrl: "/shop",
    bgImage: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1920&q=80",
    colorAccent: "#38bdf8",
  },
  {
    id: "slide-2",
    badge: "🛡️ 10-YEAR ALL-WEATHER MONSOON SHIELD",
    title: "Exterior Weatherproof Acrylic & Anti-Algae Finishes",
    subtitle: "Heavy-duty 100% pure acrylic formulation engineered to withstand Pakistan's intense summer UV heat, monsoon moisture, and exterior micro-cracking.",
    ctaText: "Discover Weather Shields →",
    ctaUrl: "/shop",
    bgImage: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1920&q=80",
    colorAccent: "#34d399",
  },
  {
    id: "slide-3",
    badge: "🎨 10,000+ COMPUTERIZED SHADE MATCHING",
    title: "Precision Tinting, Primers & Professional Spray Gear",
    subtitle: "Spectrophotometer accuracy custom color formulation with high-flow dual-angle rollers, precision sash brushes, and contractor airless sprayers.",
    ctaText: "Browse Supplies & Tools →",
    ctaUrl: "/shop",
    bgImage: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=1920&q=80",
    colorAccent: "#fbbf24",
  },
];

export default function Hero() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = slides[current];

  return (
    <section
      className="hero-carousel-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Gradient Overlays */}
      <div className="hero-carousel-bg-wrap">
        <img
          src={slide.bgImage}
          alt={slide.title}
          className="hero-carousel-bg-img"
          key={slide.id}
        />
        <div className="hero-carousel-overlay-grad" />
        <div className="hero-carousel-radial-grad" />
      </div>

      <div className="wrap hero-carousel-content-wrap">
        {/* Badge */}
        <div className="hero-carousel-badge">
          <span className="hero-carousel-badge-dot" />
          {slide.badge}
        </div>

        {/* Title */}
        <h1 className="hero-carousel-title" key={`title-${current}`}>
          {slide.title}
        </h1>

        {/* Subtitle */}
        <p className="hero-carousel-sub" key={`sub-${current}`}>
          {slide.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="hero-carousel-actions">
          <Button
            text={slide.ctaText}
            className="btn btn-primary btn-lg hero-cta-btn"
            onClick={() => navigate(slide.ctaUrl)}
          />

          <a
            href="https://wa.me/923001234567?text=Salam%20DRIP%20Team!%20I%20want%20to%20consult%20regarding%20paint%20shades%20and%20pricing."
            target="_blank"
            rel="noopener noreferrer"
            className="hero-carousel-wa-btn"
          >
            💬 WhatsApp Showroom Helpdesk
          </a>

          <button
            type="button"
            className="hero-carousel-tool-btn"
            onClick={() => navigate("/visualizer")}
          >
            🎨 Room Visualizer
          </button>
        </div>

        {/* Slide Controls & Progress Bar */}
        <div className="hero-carousel-controls">
          <div className="hero-carousel-pills">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={`hero-carousel-pill ${idx === current ? "active" : ""}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {idx === current && <span className="hero-carousel-pill-progress" />}
              </button>
            ))}
          </div>

          <div className="hero-carousel-arrows">
            <button
              type="button"
              className="hero-carousel-arrow-btn"
              onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
              aria-label="Previous Slide"
            >
              ‹
            </button>
            <button
              type="button"
              className="hero-carousel-arrow-btn"
              onClick={() => setCurrent((c) => (c + 1) % slides.length)}
              aria-label="Next Slide"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}