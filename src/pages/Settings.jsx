import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer, Button } from "@/components";
import {
  fetchUserProfile,
  updateUserProfile,
  changeUserPassword,
  uploadFileToBucket,
  deleteUserAccountPermanently,
  fetchAllOrders,
} from "@/services/supabaseHelpers";
import { logout, syncProfile } from "@/features/auth/authSlice";

/* ─── Avatar Presets ────────────────────────────────────── */
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
];

/* ─── Tab config ────────────────────────────────────────── */
const TABS = [
  { id: "profile",  label: "Profile",   icon: "👤" },
  { id: "security", label: "Security",  icon: "🔒" },
  { id: "danger",   label: "Danger",    icon: "⚠️" },
];

/* ─── Memoised sub-components ───────────────────────────── */
const StatusBadge = memo(({ status }) => {
  const map = {
    pending:    { bg: "#fef3c7", color: "#92400e", label: "Pending"    },
    approved:   { bg: "#d1fae5", color: "#065f46", label: "Approved"   },
    shipped:    { bg: "#dbeafe", color: "#1e40af", label: "Shipped"    },
    delivered:  { bg: "#dcfce7", color: "#166534", label: "Delivered"  },
    cancelled:  { bg: "#fee2e2", color: "#991b1b", label: "Cancelled"  },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
});

const ToggleRow = memo(({ label, desc, checked, onChange }) => (
  <div className="profile-toggle-row">
    <div>
      <p className="profile-toggle-label">{label}</p>
      <p className="profile-toggle-desc">{desc}</p>
    </div>
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-slider" />
    </label>
  </div>
));

/* ─── Main Component ─────────────────────────────────────── */
export default function Settings() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName]   = useState("");
  const [username, setUsername]   = useState("");
  const [phone, setPhone]         = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [city, setCity]           = useState("");
  const [address, setAddress]     = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifyEmail, setNotifyEmail]   = useState(true);
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(false);
  const [userOrders, setUserOrders]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [message, setMessage]           = useState("");
  const [error, setError]               = useState("");
  const [showDeleteModal, setShowDeleteModal]     = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading]         = useState(false);

  /* Load profile + orders */
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [profile, allOrders] = await Promise.all([
          fetchUserProfile(user.id),
          fetchAllOrders(),
        ]);
        if (cancelled) return;
        if (profile) {
          setFullName(profile.full_name || user.user_metadata?.full_name || "");
          setUsername(profile.username || "");
          setPhone(profile.phone    || user.user_metadata?.phone || "");
          setAvatarUrl(profile.avatar_url || "");
          setCity(profile.city    || "");
          setAddress(profile.address || "");
        } else {
          setFullName(user.user_metadata?.full_name || "");
          setPhone(user.user_metadata?.phone || "");
        }
        const mine = (allOrders || []).filter((o) => o.user_id === user.id || o.user_id === null);
        setUserOrders(mine);
      } catch (e) {
        console.warn("Profile load:", e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  /* Derived display name for sidebar */
  const displayName = useMemo(() => fullName || user?.user_metadata?.full_name || "Valued Customer", [fullName, user]);
  const displayAvatar = useMemo(() => avatarUrl || AVATAR_PRESETS[0], [avatarUrl]);

  /* Handlers */
  const handleSaveProfile = useCallback(async (e) => {
    e.preventDefault();
    if (!user?.id) { setError("Please sign in first."); return; }
    setLoading(true); setMessage(""); setError("");
    try {
      await updateUserProfile(user.id, { full_name: fullName, username, phone, avatar_url: avatarUrl, city, address, email: user.email });
      dispatch(syncProfile({ avatar_url: avatarUrl, full_name: fullName }));
      setMessage("Profile saved successfully!");
    } catch (err) { setError(err.message || "Failed to update profile."); }
    finally { setLoading(false); }
  }, [user, fullName, username, phone, avatarUrl, city, address, dispatch]);

  const handleChangePassword = useCallback(async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setMessage(""); setError("");
    try {
      await changeUserPassword(newPassword);
      setMessage("Password updated!");
      setNewPassword(""); setConfirmPassword("");
    } catch (err) { setError(err.message || "Failed to change password."); }
    finally { setLoading(false); }
  }, [newPassword, confirmPassword]);

  const handleAvatarUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setMessage(""); setError("");
    try {
      const url = await uploadFileToBucket("avatars", file);
      setAvatarUrl(url);
      setMessage("Avatar uploaded! Click Save to apply.");
    } catch (err) { setError(err.message || "Upload failed."); }
    finally { setLoading(false); }
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    localStorage.removeItem("drip_admin_auth");
    navigate("/");
  }, [dispatch, navigate]);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setError("Type DELETE to confirm.");
      return;
    }
    setDeleteLoading(true); setError("");
    try {
      // deleteUserAccountPermanently calls the delete_user() RPC which
      // removes the user from auth.users, then signs out + clears storage.
      // After this the user CAN re-register with the same email.
      await deleteUserAccountPermanently(user?.id);
      dispatch(logout());
      setShowDeleteModal(false);
      navigate("/?account_deleted=true");
    } catch (err) {
      setError(err.message || "Failed to delete account. Try again.");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteConfirmText, user, dispatch, navigate]);

  const switchTab = useCallback((id) => {
    setActiveTab(id); setMessage(""); setError("");
  }, []);

  const trackOrder = useCallback((id) => navigate(`/track-order?id=${id}`), [navigate]);

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <div className="wrap">
          {/* ── Page Header ── */}
          <div className="profile-page-header">
            <div>
              <p className="products-eyebrow">MY ACCOUNT</p>
              <h1 className="products-title">Profile &amp; Settings</h1>
            </div>
            {isAuthenticated && (
              <button className="btn btn-ghost btn-sm profile-signout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            )}
          </div>

          <div className="profile-layout">
            {/* ── Sidebar ── */}
            <aside className="profile-sidebar">
              <div className="profile-sidebar-avatar-wrap">
                <img src={displayAvatar} alt="Avatar" className="profile-sidebar-avatar" />
                <div className="profile-sidebar-avatar-edit">
                  <input type="file" accept="image/*" id="avatar-quick-upload" onChange={handleAvatarUpload} style={{ display: "none" }} />
                  <label htmlFor="avatar-quick-upload" style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }} title="Upload photo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </label>
                </div>
              </div>
              <h3 className="profile-sidebar-name">{displayName}</h3>
              <p className="profile-sidebar-email">{user?.email || "—"}</p>
              {phone && <p className="profile-sidebar-phone">📞 {phone}</p>}

              {/* Avatar presets */}
              <div className="profile-preset-section">
                <p className="profile-preset-label">Quick Avatars</p>
                <div className="profile-preset-row">
                  {AVATAR_PRESETS.map((p, i) => (
                    <button key={i} type="button" onClick={() => setAvatarUrl(p)} className={`profile-preset-img-btn ${avatarUrl === p ? "active" : ""}`}>
                      <img src={p} alt={`Avatar ${i + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Nav */}
              <nav className="profile-sidebar-nav">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`profile-nav-btn ${activeTab === t.id ? "active" : ""} ${t.id === "danger" ? "danger-tab" : ""}`}
                    onClick={() => switchTab(t.id)}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </nav>

              <button type="button" className="btn btn-primary btn-sm profile-track-btn" style={{ width: "100%", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onClick={() => navigate("/track-order")}>
                📦 My Orders &amp; Tracking →
              </button>
            </aside>

            {/* ── Main Content ── */}
            <section className="profile-main">
              {/* Alerts */}
              {message && (
                <div className="profile-alert profile-alert--success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {message}
                </div>
              )}
              {error && (
                <div className="profile-alert profile-alert--error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              {/* ── TAB: PROFILE ── */}
              {activeTab === "profile" && (
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="profile-section-head">
                    <h2 className="profile-section-title">Personal Details</h2>
                    <p className="profile-section-desc">Update your name, contact info and delivery address.</p>
                  </div>

                  <div className="profile-grid-2">
                    <div className="login-field">
                      <label>Full Name</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ali Ahmed" required />
                    </div>
                    <div className="login-field">
                      <label>Username</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="aliahmed99" />
                    </div>
                    <div className="login-field">
                      <label>Email Address <span style={{ color: "var(--ink-muted)", fontSize: "11px" }}>(cannot change)</span></label>
                      <input type="email" value={user?.email || ""} disabled style={{ opacity: 0.55, cursor: "not-allowed" }} />
                    </div>
                    <div className="login-field">
                      <label>Phone Number</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
                    </div>
                  </div>

                  <div className="login-field" style={{ marginBottom: "28px" }}>
                    <label>Avatar URL or Upload</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/photo.jpg" style={{ flex: 1 }} />
                      <input type="file" accept="image/*" id="avatar-upload" onChange={handleAvatarUpload} style={{ display: "none" }} />
                      <label htmlFor="avatar-upload" className="btn btn-ghost btn-sm" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>Upload 📸</label>
                    </div>
                  </div>

                  <div className="profile-section-head" style={{ marginTop: "8px" }}>
                    <h2 className="profile-section-title">Delivery Address</h2>
                    <p className="profile-section-desc">Pre-filled at checkout for fast 1-click orders.</p>
                  </div>

                  <div className="profile-grid-city">
                    <div className="login-field">
                      <label>City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Karachi" />
                    </div>
                    <div className="login-field">
                      <label>Street Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House 42, Street 4, DHA Phase 5" />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving…" : "Save Profile"}
                  </button>
                </form>
              )}

              {/* ── TAB: SECURITY ── */}
              {activeTab === "security" && (
                <div className="profile-form">
                  <form onSubmit={handleChangePassword}>
                    <div className="profile-section-head">
                      <h2 className="profile-section-title">Change Password</h2>
                      <p className="profile-section-desc">Use a strong password to keep your account secure.</p>
                    </div>
                    <div className="profile-grid-2">
                      <div className="login-field">
                        <label>New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" required />
                      </div>
                      <div className="login-field">
                        <label>Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Updating…" : "Update Password"}
                    </button>
                  </form>

                  <div className="profile-divider" />

                  <div className="profile-section-head">
                    <h2 className="profile-section-title">Notification Preferences</h2>
                    <p className="profile-section-desc">Choose what emails you'd like to receive.</p>
                  </div>
                  <div className="profile-toggles">
                    <ToggleRow label="Order Status Updates" desc="Get notified when your order is approved or shipped." checked={notifyOrders} onChange={(e) => setNotifyOrders(e.target.checked)} />
                    <ToggleRow label="Email Invoices" desc="Receive PDF invoices for every completed order." checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                    <ToggleRow label="Promotions &amp; Offers" desc="Seasonal discount codes and color collection previews." checked={notifyOffers} onChange={(e) => setNotifyOffers(e.target.checked)} />
                  </div>
                </div>
              )}

              {/* ── TAB: DANGER ── */}
              {activeTab === "danger" && (
                <div className="profile-form">
                  <div className="profile-danger-card">
                    <div className="profile-danger-icon">🗑️</div>
                    <div>
                      <h2 className="profile-danger-title">Delete Account Permanently</h2>
                      <p className="profile-danger-desc">
                        Once deleted, your profile, addresses, wishlist, order history and all associated data will be <strong>permanently erased</strong> from our servers. This action cannot be undone.
                      </p>
                      <ul className="profile-danger-list">
                        <li>❌ All profile information deleted</li>
                        <li>❌ Wishlist and cart items removed</li>
                        <li>❌ Order history permanently erased</li>
                        <li>❌ Account removed from Supabase</li>
                      </ul>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(""); setError(""); }}
                        style={{ marginTop: "20px" }}
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && (
        <div className="profile-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div className="profile-modal">
            <div className="profile-modal-icon">🚨</div>
            <h3 className="profile-modal-title">Permanently Delete Account?</h3>
            <p className="profile-modal-desc">
              This will permanently delete <strong>{user?.email}</strong> and all associated data from Supabase. This action is <strong>irreversible</strong>.
            </p>
            <div className="profile-modal-confirm-field">
              <label>Type <strong style={{ color: "#dc2626" }}>DELETE</strong> to confirm</label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>⚠ {error}</p>}
            <div className="profile-modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
              >
                {deleteLoading ? "Deleting…" : "Yes, Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
