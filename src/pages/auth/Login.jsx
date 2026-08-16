import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { Navbar, Footer, Button } from "@/components";
import loginImage from "@/assets/login.jpg";
import { clearAuthError, signInUser } from "@/features/auth/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) navigate("/shop");
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(signInUser({ email, password }));
    if (signInUser.fulfilled.match(result)) {
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
              <img src={loginImage} alt="Premium Paints" />

              <div className="login-overlay">
                <h2>Premium Paint Solutions</h2>
                <p>Bring life to your walls with premium paints, professional tools and expert painters.</p>
              </div>
            </div>

            <div className="login-form-side">
              <div className="login-form-box">
                <p className="login-small">DRIP.</p>
                <h1>Welcome Back</h1>
                <p className="login-text">Sign in to access your wishlist, shopping cart and complete your orders.</p>

                <form onSubmit={handleSubmit}>
                  <div className="login-field">
                    <label>Email Address</label>
                    <input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="login-field">
                    <label>Password</label>
                    <div className="password-box">
                      <input type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="login-options">
                    <label className="remember">
                      <input type="checkbox" />
                      Remember Me
                    </label>

                    <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                  </div>

                  {error && <p className="empty-wishlist-copy">{error}</p>}
                  <Button text={status === "loading" ? "Signing in..." : "Login"} className="btn btn-primary login-btn" />
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
                  Don't have an account?
                  <Link to="/Signup">Create Account</Link>
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