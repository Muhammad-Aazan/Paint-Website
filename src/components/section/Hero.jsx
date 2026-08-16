import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";

export default function Hero() {
  const navigate = useNavigate();
  const statsRef = useRef(null);

  // Animate stat counters on first visible
  useEffect(() => {
    const elements = document.querySelectorAll(".hero-stat-num[data-target]");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || "";
        let start = 0;
        const duration = 1200;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const val = Math.floor(progress * target);
          el.textContent = val + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero">
      {/* Top rainbow drip accents */}
      <div className="hero-drips" aria-hidden="true">
        <span className="drip drip-cobalt" />
        <span className="drip drip-poppy" />
        <span className="drip drip-saffron" />
        <span className="drip drip-sage" />
      </div>

      <div className="hero-inner">
        {/* Left — text */}
        <div className="hero-text">
          <p className="hero-eyebrow">✦ New season colors · In stock now</p>

          <h1 className="hero-title">
            Paint that turns<br />
            a house into<br />
            <em>your</em> home.
          </h1>

          <p className="hero-sub">
            Hand-mixed interiors, exteriors, primers and professional tools —
            crafted for perfectionists who believe every wall deserves the very best.
          </p>

          <div className="hero-actions">
            <Button
              text="Shop Collection"
              className="btn btn-primary btn-lg"
              onClick={() => navigate("/shop")}
            />
            <Button
              text="View Categories"
              className="btn btn-ghost"
              onClick={() => navigate("/categories")}
            />
          </div>

          <div className="hero-stats" ref={statsRef}>
            <div className="hero-stat">
              <span className="hero-stat-num" data-target="120" data-suffix="+">0+</span>
              <span className="hero-stat-label">Ready-mixed shades</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num" data-target="12">0</span>
              <span className="hero-stat-label">Branches nationwide</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num" data-target="48" data-suffix="k+">0k+</span>
              <span className="hero-stat-label">Happy customers</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">4.9★</span>
              <span className="hero-stat-label">Average rating</span>
            </div>
          </div>
        </div>

        {/* Right — paint swatches */}
        <div className="hero-visual">
          <div className="hero-swatch hero-swatch-1" />
          <div className="hero-swatch hero-swatch-2" />
          <div className="hero-swatch hero-swatch-3" />
          <div className="hero-swatch hero-swatch-4" />

          {/* Floating product card */}
          <div className="hero-visual-card">
            <span className="hero-visual-name">Cobalt Hour</span>
            <span className="hero-visual-price">Rs. 2,450 / gal</span>
          </div>
        </div>
      </div>
    </section>
  );
}