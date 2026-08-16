import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer, Button } from "@/components";

const values = [
  { icon: "🎨", title: "Crafted with Passion", desc: "Every shade is hand-tested by our paint experts to ensure perfect consistency, coverage and color accuracy." },
  { icon: "🌿", title: "Eco-Friendly Formulas", desc: "Low-VOC and zero-VOC options available — safe for your family, better for the environment." },
  { icon: "💎", title: "Premium Quality", desc: "Raw materials sourced from leading international suppliers, manufactured to the highest standards." },
  { icon: "🤝", title: "Local Expertise", desc: "Built by Pakistanis, for Pakistani homes — understanding our unique climate and architecture." },
];

const team = [
  { name: "Tariq Ahmed", role: "Co-Founder & CEO", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
  { name: "Sara Malik",  role: "Head of Product Design", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" },
  { name: "Bilal Khan",  role: "Operations Director", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="inner-hero">
        <div className="wrap">
          <p className="page-eyebrow">OUR STORY</p>
          <h1 className="inner-hero-title">Pakistan's Premier<br /> Paint Experience</h1>
          <p className="inner-hero-sub">
            Founded in 2018, Drip Paints was born from a simple idea: every Pakistani home
            deserves premium quality paint at an honest price.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="content-section" style={{ background: "var(--canvas)" }}>
        <div className="wrap">
          <div className="content-grid">
            <div>
              <p className="products-eyebrow">OUR MISSION</p>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "20px", lineHeight: "1.2" }}>
                Colour changes<br /> everything.
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: "16px", lineHeight: "1.7", marginBottom: "16px" }}>
                We believe a fresh coat of paint is one of the most powerful home transformations you can make. That's why we dedicate ourselves to producing paints that are consistent, vibrant, and long-lasting.
              </p>
              <p style={{ color: "var(--ink-soft)", fontSize: "16px", lineHeight: "1.7", marginBottom: "28px" }}>
                From our Karachi headquarters, we supply homes, contractors, and interior designers across Pakistan with world-class paint, tools, and colour expertise.
              </p>
              <Button text="Shop Our Range →" className="btn btn-primary" onClick={() => navigate("/shop")} />
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {[
                { num: "2018",  label: "Year Founded" },
                { num: "12+",   label: "Branches" },
                { num: "120+",  label: "Paint Shades" },
                { num: "48k+",  label: "Customers" },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-lg)", padding: "28px", textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--display)", fontSize: "36px", fontWeight: "700", color: "var(--cobalt)", margin: "0 0 6px" }}>{s.num}</p>
                  <p style={{ fontSize: "13px", color: "var(--ink-muted)", fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "80px 0", background: "var(--canvas-dark)", borderTop: "1px solid var(--paper-line)" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="products-eyebrow">WHAT WE STAND FOR</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: "700", letterSpacing: "-0.02em" }}>Our Core Values</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
            {values.map((v) => (
              <div key={v.title} style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-lg)", padding: "28px", transition: "all 0.24s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{v.icon}</div>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>{v.title}</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: "14px", lineHeight: "1.65" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="content-section">
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="products-eyebrow">THE PEOPLE BEHIND DRIP</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: "700", letterSpacing: "-0.02em" }}>Meet Our Team</h2>
          </div>

          <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap" }}>
            {team.map((member) => (
              <div key={member.name} style={{ textAlign: "center", maxWidth: "220px" }}>
                <img
                  src={member.img}
                  alt={member.name}
                  style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover", marginBottom: "14px", border: "4px solid var(--paper-line)" }}
                  loading="lazy"
                />
                <h3 style={{ fontFamily: "var(--display)", fontSize: "17px", fontWeight: "600", marginBottom: "4px" }}>{member.name}</h3>
                <p style={{ color: "var(--ink-muted)", fontSize: "13px", fontFamily: "var(--mono)" }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: "var(--ink)", padding: "80px 0", textAlign: "center" }}>
        <div className="wrap">
          <p style={{ fontFamily: "var(--mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--saffron)", marginBottom: "14px" }}>
            READY TO PAINT?
          </p>
          <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: "700", color: "white", letterSpacing: "-0.02em", marginBottom: "20px" }}>
            Start your transformation today.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", marginBottom: "32px" }}>
            Browse 120+ hand-mixed shades or get any colour matched free at a branch.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Button text="Shop Products" className="btn btn-primary btn-lg" onClick={() => navigate("/shop")} />
            <Button text="Contact Us" className="btn btn-ghost btn-lg" onClick={() => navigate("/contact")} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}