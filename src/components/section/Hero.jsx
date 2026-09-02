import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import { getAllHeroBanners } from "@/services/bannerHelpers";

export default function Hero() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState(() => {
    const all = getAllHeroBanners();
    const active = all.filter((s) => s.active !== false);
    return active.length > 0 ? active : all;
  });
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const updateSlides = () => {
      const all = getAllHeroBanners();
      const active = all.filter((s) => s.active !== false);
      setSlides(active.length > 0 ? active : all);
    };

    updateSlides();

    let bc = null;
    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("drip_orders_realtime");
        bc.onmessage = (event) => {
          if (event.data?.type === "BANNERS_UPDATED") {
            const active = (event.data.payload || []).filter((s) => s.active !== false);
            setSlides(active.length > 0 ? active : getAllHeroBanners());
          }
        };
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === "drip_hero_banners_db") {
        updateSlides();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const slideIndex = current < slides.length ? current : 0;
  const slide = slides[slideIndex] || slides[0];

  if (!slide) return null;

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
          key={slide.id || slideIndex}
        />
        <div className="hero-carousel-overlay-grad" />
        <div className="hero-carousel-radial-grad" />
      </div>

      <div className="wrap hero-carousel-content-wrap">
        {/* Badge */}
        {slide.badge && (
          <div className="hero-carousel-badge">
            <span className="hero-carousel-badge-dot" />
            {slide.badge}
          </div>
        )}

        {/* Title */}
        <h1 className="hero-carousel-title" key={`title-${slideIndex}`}>
          {slide.title}
        </h1>

        {/* Subtitle */}
        <p className="hero-carousel-sub" key={`sub-${slideIndex}`}>
          {slide.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="hero-carousel-actions">
          <Button
            text={slide.ctaText || "Explore Paints →"}
            className="btn btn-primary btn-lg hero-cta-btn"
            onClick={() => navigate(slide.ctaUrl || "/shop")}
          />

          <a
            href="https://wa.me/923001234567?text=Salam%20DRIP%20Team!%20I%20want%20to%20consult%20regarding%20paint%20shades%20and%20pricing."
            target="_blank"
            rel="noopener noreferrer"
            className="hero-carousel-wa-btn"
          >
            <span className="hero-wa-pulse" />
            <span>💬 WhatsApp Concierge</span>
          </a>
        </div>

        {/* Carousel Controls matching App.css */}
        {slides.length > 1 && (
          <div className="hero-carousel-controls">
            <div className="hero-carousel-pills">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  className={`hero-carousel-pill ${idx === slideIndex ? "active" : ""}`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Slide ${idx + 1}`}
                >
                  {idx === slideIndex && (
                    <span
                      className="hero-carousel-pill-progress"
                      key={`prog-${slideIndex}-${isPaused}`}
                      style={{ animationPlayState: isPaused ? "paused" : "running" }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="hero-carousel-arrows">
              <button
                type="button"
                className="hero-carousel-arrow-btn"
                onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                aria-label="Previous Slide"
              >
                ‹
              </button>
              <button
                type="button"
                className="hero-carousel-arrow-btn"
                onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                aria-label="Next Slide"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}