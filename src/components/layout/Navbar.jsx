import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const cartTotal = useSelector((state) =>
    state.cart?.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  const avatarUrl = user?.user_metadata?.avatar_url || user?.avatar_url || null;

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}`}>
        {/* Compact Promo topbar */}
        <div className="navbar-topbar">
          <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p>✦ Free Color Mixing in All Branches · Express Delivery Across Pakistan ✦</p>
            <div className="navbar-topbar-links">
              <NavLink to="/track-order" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "11px", marginRight: "12px" }}>
                Track Order
              </NavLink>
              <NavLink to="/admin" style={{ color: "var(--saffron)", textDecoration: "none", fontSize: "11px", fontWeight: "700" }}>
                🔒 Admin Portal
              </NavLink>
            </div>
          </div>
        </div>

        {/* Main Navbar Row */}
        <div className="navbar-main wrap">
          {/* Logo */}
          <div
            className="navbar-logo"
            onClick={() => {
              navigate("/");
              closeMenu();
            }}
            role="link"
            tabIndex={0}
          >
            DRIP<span className="navbar-logo-dot">.</span>
          </div>

          {/* Desktop Nav Links */}
          <nav
            className={`navbar-links${menuOpen ? " navbar-links-open" : ""}`}
            role="navigation"
            aria-label="Main navigation"
          >
            <NavLink to="/"           className={navLinkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/shop"       className={navLinkClass} onClick={closeMenu}>Shop</NavLink>
            <NavLink to="/track-order" className={navLinkClass} onClick={closeMenu}>Orders</NavLink>
            <NavLink to="/visualizer" className={navLinkClass} onClick={closeMenu}>Visualizer</NavLink>
            <NavLink to="/calculator" className={navLinkClass} onClick={closeMenu}>Calculator</NavLink>
            <NavLink to="/painters"   className={navLinkClass} onClick={closeMenu}>Painters</NavLink>
            <NavLink to="/categories" className={navLinkClass} onClick={closeMenu}>Categories</NavLink>
            <NavLink to="/about"      className={navLinkClass} onClick={closeMenu}>About</NavLink>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <button
              className="navbar-icon-btn"
              aria-label="Search products"
              title="Search"
              onClick={() => navigate("/shop")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Wishlist */}
            <button
              className="navbar-icon-btn wishlist-icon"
              aria-label={`Wishlist (${wishlistCount} items)`}
              title="Wishlist"
              onClick={() => navigate("/wishlist")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="wishlist-count" key={wishlistCount}>{wishlistCount}</span>
              )}
            </button>

            {/* Cart */}
            <button
              className="navbar-icon-btn navbar-cart"
              aria-label={`Cart (${cartTotal} items)`}
              title="Shopping Cart"
              onClick={() => navigate("/cart")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartTotal > 0 && (
                <span className="navbar-cart-badge" key={cartTotal}>{cartTotal}</span>
              )}
            </button>

            {/* Account / User Avatar */}
            {isAuthenticated ? (
              <div
                className="navbar-user-chip"
                onClick={() => navigate("/settings")}
                title="Account Settings"
              >
                <img
                  className="navbar-avatar"
                  src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                  alt={user?.user_metadata?.full_name || "Profile"}
                />
              </div>
            ) : (
              <button
                className="navbar-icon-btn"
                aria-label="Account"
                title="Sign In"
                onClick={() => navigate("/login")}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            )}


            {/* Mobile hamburger */}
            <button
              className="navbar-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span style={{ transform: menuOpen ? "rotate(45deg) translateY(6px)" : "" }} />
              <span style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "" }} />
              <span style={{ transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <div
        className={`navbar-overlay${menuOpen ? " active" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </>
  );
}