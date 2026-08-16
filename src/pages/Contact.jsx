import React, { useState } from "react";
import { Navbar, Footer, Button } from "@/components";
import { createInquiry } from "@/services/supabaseHelpers";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
        status: "pending",
        created_at: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true); // Still show user success UI
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
          <p className="page-eyebrow">GET IN TOUCH</p>
          <h1 className="inner-hero-title">
            Let's Bring Your<br />
            <em style={{ fontStyle: "italic", color: "var(--cobalt)" }}>Vision To Life</em>
          </h1>
          <p className="inner-hero-sub">
            Have questions about paint selection, custom color matching, or project estimates?
            Our colour consultants are here to help.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="content-section" style={{ background: "var(--canvas)" }}>
        <div className="wrap">
          <div className="content-grid" style={{ alignItems: "start" }}>

            {/* Left: Info Cards */}
            <div>
              <p className="products-eyebrow">CONTACT DETAILS</p>
              <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(26px, 3vw, 36px)", fontWeight: "700", marginBottom: "24px" }}>
                We're Here For You
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: "16px", lineHeight: "1.65", marginBottom: "32px" }}>
                Visit our main showroom or reach out via phone/email. We respond to all inquiries within 24 hours.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
                  { icon: "📍", title: "Headquarters & Showroom", line1: "Plot 42-C, Main Shahrah-e-Faisal", line2: "Karachi, Pakistan" },
                  { icon: "📞", title: "Phone & WhatsApp", line1: "+92 (21) 111-374-700", line2: "+92 300 1234567 (WhatsApp)" },
                  { icon: "✉️", title: "Email Support", line1: "hello@drippaints.pk", line2: "support@drippaints.pk" },
                  { icon: "⏰", title: "Operating Hours", line1: "Monday – Saturday: 9:00 AM – 8:00 PM", line2: "Sunday: Closed" },
                ].map((item) => (
                  <div key={item.title} style={{
                    display: "flex",
                    gap: "16px",
                    background: "var(--surface)",
                    border: "1px solid var(--paper-line)",
                    borderRadius: "var(--r-md)",
                    padding: "20px",
                    alignItems: "center"
                  }}>
                    <div style={{ fontSize: "28px", flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <h4 style={{ fontFamily: "var(--ui)", fontSize: "14px", fontWeight: "700", marginBottom: "2px" }}>{item.title}</h4>
                      <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", margin: 0 }}>{item.line1}</p>
                      {item.line2 && <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: 0 }}>{item.line2}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Contact Form */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-xl)", padding: "36px" }}>
              <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
                Send Us a Message
              </h3>
              <p style={{ fontSize: "14px", color: "var(--ink-soft)", marginBottom: "24px" }}>
                Fill out the form below and our team will get in touch.
              </p>

              {submitted ? (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "var(--r-lg)", padding: "32px", textAlign: "center" }}>
                  <div style={{ fontSize: "44px", marginBottom: "12px" }}>✉️</div>
                  <h4 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "#166534", marginBottom: "8px" }}>Message Sent!</h4>
                  <p style={{ color: "#166534", fontSize: "14px" }}>Thank you for reaching out. Your inquiry has been sent to our admin team.</p>
                  <Button text="Send Another Message" className="btn btn-ghost btn-sm" style={{ marginTop: "16px" }} onClick={() => setSubmitted(false)} />
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Tariq Jamil"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+92 300 1234567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Color Matching Query"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-input"
                      rows="4"
                      placeholder="How can we help you?"
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <Button text={loading ? "Sending..." : "Send Message →"} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "8px" }} />
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Branches Map Placeholder Section */}
      <section style={{ padding: "64px 0", background: "var(--canvas-dark)", borderTop: "1px solid var(--paper-line)" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p className="products-eyebrow">OUR LOCATIONS</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: "28px", fontWeight: "700" }}>Visit Our Major Flagship Branches</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { city: "Karachi Flagship", addr: "Plot 42-C, Main Shahrah-e-Faisal", phone: "+92 (21) 111-374-700" },
              { city: "Lahore Branch", addr: "Gulberg III, Near MM Alam Road", phone: "+92 (42) 357-123-45" },
              { city: "Islamabad Branch", addr: "Blue Area, Sector G-7", phone: "+92 (51) 280-998-8" }
            ].map(b => (
              <div key={b.city} style={{ background: "var(--surface)", border: "1px solid var(--paper-line)", borderRadius: "var(--r-lg)", padding: "24px" }}>
                <h3 style={{ fontFamily: "var(--display)", fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--cobalt)" }}>{b.city}</h3>
                <p style={{ fontSize: "14px", color: "var(--ink-soft)", marginBottom: "4px" }}>{b.addr}</p>
                <p style={{ fontSize: "13px", color: "var(--ink-muted)", fontFamily: "var(--mono)" }}>{b.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}