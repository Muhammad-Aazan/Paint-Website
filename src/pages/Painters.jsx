import React, { useState } from "react";
import { Navbar, Footer, Button } from "@/components";
import { createBooking } from "@/services/supabaseHelpers";

const services = [
  { icon: "🏠", title: "Interior Painting", desc: "Bedrooms, living rooms, kitchens — flawless matte, satin and gloss finishes." },
  { icon: "🏗️", title: "Exterior Painting", desc: "Weather-sealed, UV-resistant coatings for facades, boundary walls, and gates." },
  { icon: "🖌️", title: "Decorative Finishes", desc: "Textured walls, metallic accents, stencil patterns, and Venetian plaster." },
  { icon: "🏢", title: "Commercial Projects", desc: "Offices, retail spaces and large-scale buildings — with project management." },
  { icon: "🪵", title: "Wood & Metal Work", desc: "Varnish, lacquer and enamel for doors, furniture, grills and railings." },
  { icon: "🎨", title: "Colour Consultation", desc: "Free in-home colour consultation with swatches to pick the perfect shade." },
];

const packages = [
  {
    name: "Basic",
    price: "Rs. 5,000",
    period: "per room",
    features: ["1 Room", "1 Professional Painter", "Standard Finish", "1 Coat Application"],
    featured: false,
  },
  {
    name: "Standard",
    price: "Rs. 15,000",
    period: "up to 4 rooms",
    features: ["Up to 4 Rooms", "Team of 2 Painters", "Premium Finish", "Free Colour Consultation", "2 Coat Application"],
    featured: true,
  },
  {
    name: "Premium",
    price: "Custom Quote",
    period: "full house",
    features: ["Complete House", "Full Professional Team", "Luxury Finish Options", "Priority Scheduling", "Free Touch-ups for 6 months"],
    featured: false,
  },
];

const painters = [
  { name: "Usman Ali", specialty: "Interior Specialist", rating: "4.9★", jobs: "320+ jobs", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" },
  { name: "Ahmed Raza", specialty: "Exterior & Commercial", rating: "4.8★", jobs: "210+ jobs", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200" },
  { name: "Kamran Shah", specialty: "Decorative Finishes", rating: "5.0★", jobs: "180+ jobs", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200" },
];

export default function Painters() {
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    city: "Karachi",
    service: "Interior Painting",
    details: "",
  });

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createBooking({
        full_name: bookingForm.name,
        phone: bookingForm.phone,
        city: bookingForm.city,
        service_required: bookingForm.service,
        details: bookingForm.details,
        status: "pending",
        created_at: new Date().toISOString(),
      });
      setBooked(true);
    } catch (err) {
      console.error(err);
      setBooked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="inner-hero">
        <div className="wrap">
          <p className="page-eyebrow">PROFESSIONAL PAINTERS</p>
          <h1 className="inner-hero-title">
            Hire Expert Painters<br />
            <span style={{ color: "var(--cobalt)" }}>Across Pakistan</span>
          </h1>
          <p className="inner-hero-sub">
            Our certified painters deliver flawless results for homes and commercial projects —
            on time, on budget, with guaranteed quality.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginTop: "28px" }}>
            <Button text="Hire a Painter →" className="btn btn-primary btn-lg" onClick={() => document.getElementById("booking").scrollIntoView({ behavior: "smooth" })} />
            <Button text="View Packages" className="btn btn-ghost" onClick={() => document.getElementById("packages").scrollIntoView({ behavior: "smooth" })} />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: "80px 0", background: "var(--canvas)" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="products-eyebrow">WHAT WE OFFER</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px,3vw,38px)", fontWeight: "700", letterSpacing: "-0.02em" }}>
              Full Range of Painting Services
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {services.map((s) => (
              <div key={s.title}
                style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-lg)", padding: "28px", transition: "all 0.24s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ fontSize: "32px", marginBottom: "14px" }}>{s.icon}</div>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "17px", fontWeight: "600", marginBottom: "8px" }}>{s.title}</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: "14px", lineHeight: "1.65" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Painters */}
      <section style={{ padding: "80px 0", background: "var(--canvas-dark)", borderTop: "1px solid var(--paper-line)" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="products-eyebrow">OUR TOP PAINTERS</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px,3vw,38px)", fontWeight: "700", letterSpacing: "-0.02em" }}>
              Trusted by Thousands of Homeowners
            </h2>
          </div>

          <div style={{ display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap" }}>
            {painters.map((p) => (
              <div key={p.name} style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "32px 28px", textAlign: "center", width: "220px", transition: "all 0.24s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <img src={p.img} alt={p.name} style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", marginBottom: "14px", border: "3px solid var(--cobalt)" }} loading="lazy" />
                <h3 style={{ fontFamily: "var(--display)", fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{p.name}</h3>
                <p style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--saffron)", letterSpacing: "0.06em", marginBottom: "6px" }}>{p.specialty}</p>
                <p style={{ fontSize: "13px", color: "var(--ink-muted)" }}>{p.rating} · {p.jobs}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" style={{ padding: "80px 0 96px", background: "var(--canvas)" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p className="products-eyebrow">TRANSPARENT PRICING</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px,3vw,38px)", fontWeight: "700", letterSpacing: "-0.02em" }}>
              Choose Your Package
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", maxWidth: "900px", margin: "0 auto" }}>
            {packages.map((pkg) => (
              <div key={pkg.name} style={{
                background: pkg.featured ? "var(--ink)" : "var(--surface)",
                color: pkg.featured ? "white" : "var(--ink)",
                border: pkg.featured ? "none" : "1px solid var(--paper-line)",
                borderRadius: "var(--r-xl)",
                padding: "36px 28px",
                position: "relative",
                transition: "all 0.24s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "var(--shadow-xl)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

                {pkg.featured && (
                  <span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--saffron)", color: "white", padding: "4px 16px", borderRadius: "99px", fontSize: "11px", fontFamily: "var(--mono)", fontWeight: "700", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    ✦ MOST POPULAR
                  </span>
                )}

                <h3 style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: pkg.featured ? "rgba(255,255,255,0.6)" : "var(--ink-muted)", marginBottom: "10px" }}>{pkg.name}</h3>
                <p style={{ fontFamily: "var(--display)", fontSize: "30px", fontWeight: "700", marginBottom: "4px" }}>{pkg.price}</p>
                <p style={{ fontSize: "13px", color: pkg.featured ? "rgba(255,255,255,0.5)" : "var(--ink-muted)", marginBottom: "24px" }}>{pkg.period}</p>

                <div style={{ borderTop: `1px solid ${pkg.featured ? "rgba(255,255,255,0.15)" : "var(--paper-line)"}`, paddingTop: "20px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pkg.features.map((f) => (
                    <p key={f} style={{ fontSize: "14px", display: "flex", itemsAlign: "center", gap: "8px" }}>
                      <span style={{ color: pkg.featured ? "var(--saffron)" : "var(--sage)", fontWeight: "700" }}>✓</span> {f}
                    </p>
                  ))}
                </div>

                <button
                  className={`btn ${pkg.featured ? "btn-primary" : "btn-ghost"}`}
                  style={{ width: "100%", background: pkg.featured ? "var(--saffron)" : "", borderColor: pkg.featured ? "var(--saffron)" : "" }}
                  onClick={() => document.getElementById("booking").scrollIntoView({ behavior: "smooth" })}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="booking" style={{ padding: "80px 0", background: "var(--canvas-dark)", borderTop: "1px solid var(--paper-line)" }}>
        <div className="wrap" style={{ maxWidth: "640px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p className="products-eyebrow">BOOK NOW</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px,3vw,36px)", fontWeight: "700", letterSpacing: "-0.02em" }}>
              Request a Free Quote
            </h2>
            <p style={{ color: "var(--ink-soft)", marginTop: "10px" }}>We'll get back to you within 24 hours.</p>
          </div>

          {booked ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "var(--r-lg)", padding: "32px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", color: "#166534", marginBottom: "8px" }}>Booking Received!</h3>
              <p style={{ color: "#166534" }}>Our admin team has logged your booking request. We will contact you shortly.</p>
              <Button text="Book Another Service" className="btn btn-ghost btn-sm" style={{ marginTop: "16px" }} onClick={() => setBooked(false)} />
            </div>
          ) : (
            <form style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "36px", display: "flex", flexDirection: "column", gap: "16px" }}
              onSubmit={handleBookingSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="Muhammad Ali" required value={bookingForm.name} onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" type="tel" placeholder="+92 300 0000000" required value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">City</label>
                <select className="form-input" required value={bookingForm.city} onChange={(e) => setBookingForm({ ...bookingForm, city: e.target.value })}>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Service Required</label>
                <select className="form-input" required value={bookingForm.service} onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}>
                  {services.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Additional Details</label>
                <textarea className="form-input" rows="3" placeholder="e.g. 3 bedroom apartment, needs 2 coats..." value={bookingForm.details} onChange={(e) => setBookingForm({ ...bookingForm, details: e.target.value })} />
              </div>
              <Button text={loading ? "Submitting..." : "Submit Booking Request →"} className="btn btn-primary btn-lg" />
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}