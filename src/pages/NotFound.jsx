import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer, Button } from "@/components";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <section style={{
        minHeight: "72vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px",
        background: "linear-gradient(135deg, var(--canvas) 0%, var(--canvas-dark) 100%)",
      }}>
        <div>
          <div style={{
            fontSize: "clamp(80px, 16vw, 160px)",
            fontFamily: "var(--display)",
            fontWeight: "700",
            letterSpacing: "-0.04em",
            lineHeight: "1",
            color: "var(--ink)",
            marginBottom: "8px",
            position: "relative",
          }}>
            4<span style={{ color: "var(--poppy)", display: "inline-block", animation: "float 3s ease-in-out infinite" }}>🎨</span>4
          </div>

          <p style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--saffron)",
            marginBottom: "16px",
          }}>
            Page Not Found
          </p>

          <h1 style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(22px, 3.5vw, 36px)",
            fontWeight: "700",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
            color: "var(--ink)",
          }}>
            Looks like this canvas is blank.
          </h1>

          <p style={{
            fontSize: "16px",
            color: "var(--ink-soft)",
            maxWidth: "440px",
            margin: "0 auto 36px",
            lineHeight: "1.65",
          }}>
            The page you're looking for doesn't exist — but there's plenty of beautiful paint waiting for you at the shop.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Button text="← Go Back" className="btn btn-ghost" onClick={() => navigate(-1)} />
            <Button text="Shop Products" className="btn btn-primary" onClick={() => navigate("/shop")} />
          </div>

          {/* Decorative paint drips */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "56px",
            opacity: "0.6",
          }}>
            {["var(--cobalt)", "var(--poppy)", "var(--saffron)", "var(--sage)"].map((color, i) => (
              <div key={i} style={{
                width: "8px",
                height: `${40 + i * 18}px`,
                background: color,
                borderRadius: "0 0 4px 4px",
                animation: `float ${2.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
