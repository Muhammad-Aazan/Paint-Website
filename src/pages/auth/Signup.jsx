import React, { useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Navbar, Footer } from "@/components";
import signupImage from "@/assets/login.jpg";
import { clearAuthError, signUpUser } from "@/features/auth/authSlice";

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

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error, isAuthenticated, requiresVerification } = useSelector((s) => s.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate("/shop");
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    dispatch(clearAuthError());
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    const result = await dispatch(signUpUser({ email, password, fullName, phone }));
    if (signUpUser.fulfilled.match(result) && !result.payload.requiresVerification) {
      navigate("/shop");
    }
  }, [dispatch, status, email, password, confirmPassword, fullName, phone, navigate]);

  const isLoading = status === "loading";

  return (
    <>
      <Navbar />
      <section className="auth-page">
        <div className="auth-container auth-container--signup">

          {/* Left visual panel */}
          <div className="auth-visual">
            <img src={signupImage} alt="Premium Paint" className="auth-visual-img" />
            <div className="auth-visual-overlay">
              <div className="auth-visual-content">
                <div className="auth-brand-badge">DRIP.</div>
                <h2 className="auth-visual-headline">Join 50,000+ Happy Customers</h2>
                <p className="auth-visual-sub">Create your free account and unlock exclusive colors, faster checkout and order tracking.</p>
                <div className="auth-perks">
                  {["Free delivery on first order", "Exclusive member discounts", "Real-time order tracking", "Save unlimited wishlists"].map((perk) => (
                    <div key={perk} className="auth-perk-item">
                      <span className="auth-perk-check">✓</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="auth-form-panel">
            <div className="auth-form-box">
              <div className="auth-form-header">
                <p className="auth-eyebrow">GET STARTED FREE</p>
                <h1 className="auth-title">Create Your Account</h1>
                <p className="auth-subtitle">It takes less than a minute to join DRIP Paints.</p>
              </div>

              {requiresVerification ? (
                <div className="auth-verify-box">
                  <div className="auth-verify-icon">📧</div>
                  <h3>Check your inbox!</h3>
                  <p>We've sent a verification link to <strong>{email}</strong>. Click the link to activate your account.</p>
                  <Link to="/login" className="auth-submit-btn" style={{ marginTop: "20px", display: "block", textAlign: "center", textDecoration: "none" }}>
                    Back to Sign In →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="auth-form auth-form--two-col" noValidate>
                  {/* Full Name */}
                  <div className={`auth-field ${focusedField === "name" ? "focused" : ""}`}>
                    <label htmlFor="su-name" className="auth-label">Full Name</label>
                    <div className="auth-input-wrap">
                      <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <input id="su-name" type="text" className="auth-input" placeholder="Ali Ahmed" value={fullName}
                        onChange={(e) => setFullName(e.target.value)} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} required autoComplete="name" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className={`auth-field ${focusedField === "email" ? "focused" : ""}`}>
                    <label htmlFor="su-email" className="auth-label">Email Address</label>
                    <div className="auth-input-wrap">
                      <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <input id="su-email" type="email" className="auth-input" placeholder="you@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} required autoComplete="email" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className={`auth-field auth-field--full ${focusedField === "phone" ? "focused" : ""}`}>
                    <label htmlFor="su-phone" className="auth-label">Phone <span className="auth-optional">(optional)</span></label>
                    <div className="auth-input-wrap">
                      <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <input id="su-phone" type="tel" className="auth-input" placeholder="+92 300 1234567" value={phone}
                        onChange={(e) => setPhone(e.target.value)} onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} autoComplete="tel" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className={`auth-field ${focusedField === "pass" ? "focused" : ""}`}>
                    <label htmlFor="su-pass" className="auth-label">Password</label>
                    <div className="auth-input-wrap">
                      <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <input id="su-pass" type={showPassword ? "text" : "password"} className="auth-input" placeholder="Min. 6 characters" value={password}
                        onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField("pass")} onBlur={() => setFocusedField(null)} required autoComplete="new-password" />
                      <button type="button" className="auth-eye-btn" onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className={`auth-field ${focusedField === "confirm" ? "focused" : ""} ${passwordMismatch ? "auth-field--error" : ""}`}>
                    <label htmlFor="su-confirm" className="auth-label">Confirm Password</label>
                    <div className="auth-input-wrap">
                      <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <input id="su-confirm" type={showConfirm ? "text" : "password"} className="auth-input" placeholder="Repeat password" value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMismatch(false); }}
                        onFocus={() => setFocusedField("confirm")} onBlur={() => setFocusedField(null)} required autoComplete="new-password" />
                      <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm((v) => !v)}>
                        {showConfirm ? <EyeOff /> : <EyeOpen />}
                      </button>
                    </div>
                    {passwordMismatch && <p className="auth-field-error">Passwords don't match</p>}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="auth-error-box auth-field--full" role="alert">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </div>
                  )}

                  {/* Terms */}
                  <label className="auth-terms auth-field--full">
                    <input type="checkbox" required className="auth-terms-checkbox" />
                    <span>I agree to the <Link to="/about" className="auth-switch-link">Terms of Service</Link> and <Link to="/about" className="auth-switch-link">Privacy Policy</Link></span>
                  </label>

                  <button type="submit" className="auth-submit-btn auth-field--full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="auth-btn-loading"><span className="auth-spinner" />Creating account…</span>
                    ) : "Create Account →"}
                  </button>
                </form>
              )}

              {!requiresVerification && (
                <>
                  <div className="auth-divider"><span>or sign up with</span></div>
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
                    Already have an account? <Link to="/login" className="auth-switch-link">Sign in</Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}