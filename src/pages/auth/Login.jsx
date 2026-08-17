import React, { useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Navbar, Footer } from "@/components";
import loginImage from "@/assets/login.jpg";
import { clearAuthError, signInUser } from "@/features/auth/authSlice";

// Eye SVG icons — memoized so they never re-render
const EyeOpen = memo(() => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
));
const EyeOff = memo(() => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
));

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error, isAuthenticated } = useSelector((s) => s.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate("/shop");
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(signInUser({ email, password }));
    if (signInUser.fulfilled.match(result)) navigate("/shop");
  }, [dispatch, email, password, navigate]);

  const isLoading = status === "loading";

  return (
    <>
      <Navbar />
      <section className="auth-page">
        <div className="auth-container">

          {/* Left visual panel */}
          <div className="auth-visual">
            <img src={loginImage} alt="Premium Paint" className="auth-visual-img" />
            <div className="auth-visual-overlay">
              <div className="auth-visual-content">
                <div className="auth-brand-badge">DRIP.</div>
                <h2 className="auth-visual-headline">Transform Every Wall Into Art</h2>
                <p className="auth-visual-sub">Pakistan's finest premium paints — trusted by architects, designers and 50,000+ homeowners.</p>
                <div className="auth-visual-stats">
                  <div className="auth-stat"><span className="auth-stat-num">50K+</span><span className="auth-stat-label">Customers</span></div>
                  <div className="auth-stat-divider" />
                  <div className="auth-stat"><span className="auth-stat-num">200+</span><span className="auth-stat-label">Paint Colors</span></div>
                  <div className="auth-stat-divider" />
                  <div className="auth-stat"><span className="auth-stat-num">4.9★</span><span className="auth-stat-label">Rating</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="auth-form-panel">
            <div className="auth-form-box">
              <div className="auth-form-header">
                <p className="auth-eyebrow">WELCOME BACK</p>
                <h1 className="auth-title">Sign in to DRIP</h1>
                <p className="auth-subtitle">Access your wishlist, orders and personalized shopping experience.</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {/* Email */}
                <div className={`auth-field ${focusedField === "email" ? "focused" : ""} ${email ? "has-value" : ""}`}>
                  <label htmlFor="login-email" className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input
                      id="login-email"
                      type="email"
                      className="auth-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className={`auth-field ${focusedField === "password" ? "focused" : ""} ${password ? "has-value" : ""}`}>
                  <div className="auth-label-row">
                    <label htmlFor="login-password" className="auth-label">Password</label>
                    <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
                  </div>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff /> : <EyeOpen />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="auth-error-box" role="alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <span className="auth-btn-loading">
                      <span className="auth-spinner" />
                      Signing in…
                    </span>
                  ) : "Sign In →"}
                </button>
              </form>

              <div className="auth-divider"><span>or continue with</span></div>

              <button className="auth-google-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.8 1.1 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 18.9 12 24 12c3 0 5.8 1.1 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2c-2.1 1.6-4.7 2.4-7.3 2.4-5.3 0-9.7-3.3-11.3-8H6.5C9.8 39.5 16.3 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.4-6.3 6.8l.1.1 6.3 5.2C35 39.8 44 33 44 24c0-1.3-.1-2.3-.4-3.5z" />
                </svg>
                Continue with Google
              </button>

              <p className="auth-switch-text">
                Don't have an account? <Link to="/signup" className="auth-switch-link">Create one free</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}