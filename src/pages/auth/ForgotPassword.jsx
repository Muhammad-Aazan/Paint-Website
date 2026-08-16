import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Footer, Button } from "@/components";
import { supabase } from "@/services/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;
      setMessage("Password reset link has been sent to your email.");
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <section className="login-page">
        <div className="wrap">
          <div className="login-container" style={{ gridTemplateColumns: "1fr" }}>
            <div className="login-form-side">
              <div className="login-form-box" style={{ maxWidth: "480px", margin: "0 auto" }}>
                <p className="login-small">DRIP PAINTS</p>
                <h1>Reset Password</h1>
                <p className="login-text">Enter your registered email address and we'll send you instructions to reset your password.</p>

                <form onSubmit={handleSubmit}>
                  <div className="login-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="empty-wishlist-copy" style={{ color: "#e53e3e" }}>{error}</p>}
                  {message && <p className="empty-wishlist-copy" style={{ color: "#38a169" }}>{message}</p>}

                  <Button
                    text={loading ? "Sending link..." : "Send Reset Link"}
                    className="btn btn-primary login-btn"
                  />
                </form>

                <p className="signup-text" style={{ marginTop: "1.5rem" }}>
                  Remembered your password? <Link to="/login">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
