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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  const closeMenu = () => setMenuOpen(false);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  // Avatar url — checks both auth metadata and profile data
  const avatarUrl = user?.user_metadata?.avatar_url || user?.avatar_url || null;

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}`}>
        {/* Promo bar */}
        <div className="navbar-topbar">
          <p>✦ Free color matching in every branch &nbsp;·&nbsp; New arrivals every week ✦</p>
        </div>

        <div className="navbar-main wrap">
          {/* Logo */}
          <div className="navbar-logo" onClick={() => { navigate("/"); closeMenu(); }} role="link" tabIndex={0}>
            DRIP<span className="navbar-logo-dot">.</span>
          </div>

          {/* Desktop Nav */}
          <nav
            className={`navbar-links${menuOpen ? " navbar-links-open" : ""}`}
            role="navigation"
            aria-label="Main navigation"
          >
            <NavLink to="/"           className={navLinkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/shop"       className={navLinkClass} onClick={closeMenu}>Shop</NavLink>
            <NavLink to="/categories" className={navLinkClass} onClick={closeMenu}>Categories</NavLink>
            <NavLink to="/about"      className={navLinkClass} onClick={closeMenu}>About</NavLink>
            <NavLink to="/contact"    className={navLinkClass} onClick={closeMenu}>Contact</NavLink>
            <NavLink to="/painters"   className={navLinkClass} onClick={closeMenu}>Painters</NavLink>
            <NavLink
              to="/admin"
              className={navLinkClass}
              onClick={closeMenu}
              style={{ color: "#b45309", fontWeight: "700" }}
            >
              🔒 Admin
            </NavLink>
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
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Cart */}
            <button
              className="navbar-icon-btn navbar-cart"
              aria-label={`Cart (${cartTotal} items)`}
              title="Shopping Cart"
              onClick={() => navigate("/cart")}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartTotal > 0 && (
                <span className="navbar-cart-badge" key={cartTotal}>{cartTotal}</span>
              )}
            </button>

            {/* Wishlist */}
            <button
              className="navbar-icon-btn wishlist-icon"
              aria-label={`Wishlist (${wishlistCount} items)`}
              title="Wishlist"
              onClick={() => navigate("/wishlist")}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="wishlist-count" key={wishlistCount}>{wishlistCount}</span>
              )}
            </button>

            {/* Settings Icon (⚙️) */}
            <button
              className="navbar-icon-btn"
              aria-label="Settings"
              title="Settings"
              onClick={() => navigate(isAuthenticated ? "/settings" : "/login")}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Account / User Avatar */}
            {isAuthenticated ? (
              <img
                className="navbar-avatar"
                src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                alt={user?.user_metadata?.full_name || "Profile"}
                title="View Profile / Settings"
                onClick={() => navigate("/settings")}
              />
            ) : (
              <button
                className="navbar-icon-btn"
                aria-label="Account"
                title="Sign In"
                onClick={() => navigate("/login")}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
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
              <span style={{ transform: menuOpen ? "rotate(45deg) translateY(7px)" : "" }} />
              <span style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "" }} />
              <span style={{ transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "" }} />
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