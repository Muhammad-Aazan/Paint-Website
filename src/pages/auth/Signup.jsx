import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Navbar, Footer, Button } from "@/components";
import signupImage from "@/assets/login.jpg";
import { clearAuthError, signUpUser } from "@/features/auth/authSlice";

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error, isAuthenticated, requiresVerification } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) navigate("/shop");
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;

    dispatch(clearAuthError());

    if (password !== confirmPassword) {
      return;
    }

    const result = await dispatch(signUpUser({ email, password, fullName, phone }));
    if (signUpUser.fulfilled.match(result) && !result.payload.requiresVerification) {
      navigate("/shop");
    }
  }

  return (
    <>
      <Navbar />

      <section className="login-page">
        <div className="wrap">
          <div className="login-container">
            <div className="login-image">
              <img src={signupImage} alt="Premium Paint" />
              <div className="login-overlay">
                <h2>Premium Paint Solutions</h2>
                <p>Create your account and enjoy premium paints, trusted painters, exclusive offers and a faster shopping experience.</p>
              </div>
            </div>

            <div className="login-form-side">
              <div className="login-form-box">
                <p className="login-small">DRIP.</p>
                <h1>Create Your Account</h1>
                <p className="login-text">Join DRIP today to save your wishlist, manage your cart and enjoy a faster checkout experience.</p>

                <form onSubmit={handleSubmit}>
                  <div className="login-field">
                    <label>Full Name</label>
                    <input type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>

                  <div className="login-field">
                    <label>Email Address</label>
                    <input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="login-field">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+92 300 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div className="login-field">
                    <label>Password</label>
                    <div className="password-box">
                      <input type={showPassword ? "text" : "password"} placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="login-field">
                    <label>Confirm Password</label>
                    <div className="password-box">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      <button type="button" className="show-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <label className="remember">
                    <input type="checkbox" />
                    I agree to the Terms & Privacy Policy
                  </label>

                  {error && <p className="empty-wishlist-copy">{error}</p>}
                  {requiresVerification && <p className="empty-wishlist-copy">A verification email has been sent. Please check your inbox.</p>}
                  <Button
                    text={status === "loading" ? "Creating account..." : "Create Account"}
                    className="btn btn-primary login-btn"
                    disabled={status === "loading"}
                  />
                </form>

                <div className="login-divider">
                  <span>OR</span>
                </div>

                <button className="google-btn">
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.8 1.1 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 18.9 12 24 12c3 0 5.8 1.1 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2c-2.1 1.6-4.7 2.4-7.3 2.4-5.3 0-9.7-3.3-11.3-8H6.5C9.8 39.5 16.3 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.4-6.3 6.8l.1.1 6.3 5.2C35 39.8 44 33 44 24c0-1.3-.1-2.3-.4-3.5z" />
                  </svg>
                  Continue with Google
                </button>

                <p className="signup-text">
                  Already have an account?
                  <Link to="/login">Sign In</Link>
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