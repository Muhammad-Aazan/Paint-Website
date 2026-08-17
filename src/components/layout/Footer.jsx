import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <div className="footer-brand-logo">
              DRIP<span>.</span>
            </div>
            <p className="footer-brand-desc">
              Pakistan's most trusted premium paint brand. Hand-mixed colors, expert advice,
              and professional tools — all in one place since 2018.
            </p>
            <div className="footer-socials">
              <button className="footer-social-btn" aria-label="Instagram">📸</button>
              <button className="footer-social-btn" aria-label="Facebook">📘</button>
              <button className="footer-social-btn" aria-label="YouTube">▶️</button>
              <button className="footer-social-btn" aria-label="WhatsApp">💬</button>
            </div>
          </div>

          {/* Shop column */}
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/categories">Interior Paints</Link></li>
              <li><Link to="/categories">Exterior Paints</Link></li>
              <li><Link to="/categories">Primers & Sealers</Link></li>
              <li><Link to="/categories">Brushes & Rollers</Link></li>
              <li><Link to="/categories">Spray Equipment</Link></li>
            </ul>
          </div>

          {/* Company column */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Drip</Link></li>
              <li><Link to="/painters">Find a Painter</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/admin">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Help column */}
          <div className="footer-col">
            <h4>Tools & Help</h4>
            <ul>
              <li><Link to="/visualizer">🎨 Room Visualizer</Link></li>
              <li><Link to="/calculator">📐 Paint Calculator</Link></li>
              <li><Link to="/track-order">📦 Track My Order</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/settings">Account Settings</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Drip Paints. All rights reserved.
          </p>
          <nav className="footer-legal" aria-label="Legal links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}