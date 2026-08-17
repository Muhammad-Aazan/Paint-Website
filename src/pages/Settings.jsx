import React, { useState, useEffect } from "react";
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

const avatarPresets = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
];

export default function Settings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile"); // profile | orders | security | danger

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(false);

  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [profile, allOrders] = await Promise.all([
          fetchUserProfile(user.id),
          fetchAllOrders(),
        ]);

        if (profile) {
          setFullName(profile.full_name || user.user_metadata?.full_name || "");
          setUsername(profile.username || "");
          setPhone(profile.phone || user.user_metadata?.phone || "");
          setAvatarUrl(profile.avatar_url || "");
          setCity(profile.city || "");
          setAddress(profile.address || "");
        } else {
          setFullName(user.user_metadata?.full_name || "");
          setPhone(user.user_metadata?.phone || "");
        }

        // Filter orders for this user
        const myOrders = (allOrders || []).filter(
          (o) => o.user_id === user.id || o.user_id === null
        );
        setUserOrders(myOrders);
      } catch (err) {
        console.warn("Load profile error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!user?.id) {
      setError("Please sign in to save profile.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await updateUserProfile(user.id, {
        full_name: fullName,
        username,
        phone,
        avatar_url: avatarUrl,
        city,
        address,
        email: user.email,
      });

      // Instantly update Navbar avatar in Redux
      dispatch(syncProfile({ avatar_url: avatarUrl, full_name: fullName }));

      setMessage("Profile details saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await changeUserPassword(newPassword);
      setMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      setMessage("");
      setError("");
      const url = await uploadFileToBucket("avatars", file);
      setAvatarUrl(url);
      setMessage("Avatar uploaded! Click 'Save Profile' to keep changes.");
    } catch (err) {
      setError(err.message || "Failed to upload avatar.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    dispatch(logout());
    localStorage.removeItem("drip_admin_auth");
    navigate("/");
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setError("Please type DELETE in the box to confirm account deletion.");
      return;
    }

    try {
      setDeleteLoading(true);
      setError("");

      await deleteUserAccountPermanently(user?.id);
      dispatch(logout());
      setShowDeleteModal(false);
      navigate("/?account_deleted=true");
    } catch (err) {
      setError(err.message || "Failed to delete account. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="settings-page" style={{ padding: "40px 0 96px", background: "var(--canvas)" }}>
        <div className="wrap">
          {/* Header */}
          <div className="cart-header" style={{ marginBottom: "32px" }}>
            <div>
              <p className="products-eyebrow">ACCOUNT MANAGEMENT</p>
              <h1 className="products-title">Profile & Settings</h1>
            </div>
            {isAuthenticated && (
              <Button text="Sign Out 🚪" className="btn btn-ghost btn-sm" onClick={handleLogout} />
            )}
          </div>

          {/* Tab Navigation Pill Bar */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "32px", overflowX: "auto", paddingBottom: "4px" }}>
            <button
              type="button"
              className={`calc-preset-pill ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => { setActiveTab("profile"); setMessage(""); setError(""); }}
            >
              👤 Profile Details
            </button>
            <button
              type="button"
              className={`calc-preset-pill ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => { setActiveTab("orders"); setMessage(""); setError(""); }}
            >
              📦 My Orders ({userOrders.length})
            </button>
            <button
              type="button"
              className={`calc-preset-pill ${activeTab === "security" ? "active" : ""}`}
              onClick={() => { setActiveTab("security"); setMessage(""); setError(""); }}
            >
              🔒 Security & Password
            </button>
            <button
              type="button"
              className={`calc-preset-pill ${activeTab === "danger" ? "active" : ""}`}
              style={{ color: activeTab === "danger" ? "white" : "var(--poppy)", background: activeTab === "danger" ? "var(--poppy)" : "transparent", borderColor: "var(--poppy)" }}
              onClick={() => { setActiveTab("danger"); setMessage(""); setError(""); }}
            >
              ⚠️ Delete Account
            </button>
          </div>

          <div className="settings-layout">
            {/* Left Profile Sidebar */}
            <aside className="settings-sidebar">
              <div className="settings-avatar-ring">
                <img
                  src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                  alt="Avatar"
                  className="settings-avatar"
                />
              </div>

              <h3 className="settings-user-name">{fullName || "Valued Customer"}</h3>
              <p className="settings-user-email">{user?.email || "guest@drippaints.com"}</p>
              {phone && <p style={{ fontSize: "12px", color: "var(--ink-muted)", marginTop: "4px" }}>📞 {phone}</p>}

              <div style={{ textAlign: "left", marginTop: "1.5rem" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--ink-muted)", marginBottom: "0.5rem", fontFamily: "var(--mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>PRESET AVATARS</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                  {avatarPresets.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      onClick={() => setAvatarUrl(preset)}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        border: avatarUrl === preset ? "2px solid var(--cobalt)" : "2px solid transparent",
                        opacity: avatarUrl === preset ? 1 : 0.7,
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--paper-line)" }}>
                <button
                  type="button"
                  onClick={() => navigate("/track-order")}
                  className="btn btn-ghost btn-sm"
                  style={{ width: "100%", marginBottom: "8px" }}
                >
                  🚚 Track Any Order →
                </button>
                <Button text="Sign Out 🚪" className="btn btn-ghost btn-sm" style={{ width: "100%", color: "var(--poppy)" }} onClick={handleLogout} />
              </div>
            </aside>

            {/* Right Main Content */}
            <main className="settings-main">
              {message && (
                <div className="settings-alert success" style={{ marginBottom: "20px" }}>
                  ✔ {message}
                </div>
              )}

              {error && (
                <div className="settings-alert error" style={{ marginBottom: "20px" }}>
                  ⚠ {error}
                </div>
              )}

              {/* TAB 1: PROFILE DETAILS */}
              {activeTab === "profile" && (
                <form onSubmit={handleSaveProfile}>
                  <h3 className="settings-section-title">Personal Profile Details</h3>
                  <p className="settings-section-desc">Manage your public information and shipping address.</p>

                  <div className="settings-form-grid">
                    <div className="login-field">
                      <label>Full Name</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ali Ahmed" required />
                    </div>

                    <div className="login-field">
                      <label>Username</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. aliahmed99" />
                    </div>
                  </div>

                  <div className="settings-form-grid">
                    <div className="login-field">
                      <label>Email Address (Account ID)</label>
                      <input type="email" value={user?.email || "guest@drippaints.com"} disabled style={{ background: "var(--canvas-dark)", cursor: "not-allowed" }} />
                    </div>

                    <div className="login-field">
                      <label>Phone Number</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
                    </div>
                  </div>

                  <div className="login-field" style={{ marginBottom: "24px" }}>
                    <label>Avatar Picture URL or Upload File</label>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/photo.jpg" style={{ flex: 1 }} />
                      <input type="file" accept="image/*" id="avatar-upload" onChange={handleAvatarUpload} style={{ display: "none" }} />
                      <label htmlFor="avatar-upload" className="btn btn-ghost" style={{ cursor: "pointer", padding: "10px 16px", borderRadius: "8px" }}>Upload 📸</label>
                    </div>
                  </div>

                  <h3 className="settings-section-title" style={{ marginTop: "32px" }}>Default Delivery Address</h3>
                  <p className="settings-section-desc">Prefilled automatically at checkout for fast 1-click orders.</p>

                  <div className="settings-form-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
                    <div className="login-field">
                      <label>City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Karachi" />
                    </div>

                    <div className="login-field">
                      <label>Street Address</label>
                      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House 123, Street 4, DHA Phase 5" />
                    </div>
                  </div>

                  <Button text={loading ? "Saving..." : "Save Profile Details"} className="btn btn-primary" />
                </form>
              )}

              {/* TAB 2: MY ORDERS */}
              {activeTab === "orders" && (
                <div>
                  <h3 className="settings-section-title">My Placed Orders</h3>
                  <p className="settings-section-desc">View and track all your recent paint and tool orders in real-time.</p>

                  {userOrders.length === 0 ? (
                    <div className="empty-state" style={{ padding: "40px 0" }}>
                      <div className="empty-state-icon">🛍️</div>
                      <h4 style={{ fontFamily: "var(--display)", fontSize: "18px" }}>No orders placed yet</h4>
                      <p style={{ color: "var(--ink-soft)", marginBottom: "16px" }}>Explore our catalog and order premium paints.</p>
                      <Button text="Start Shopping →" className="btn btn-primary btn-sm" onClick={() => navigate("/shop")} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {userOrders.map((ord) => (
                        <div
                          key={ord.id || ord.order_number}
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--paper-line)",
                            borderRadius: "var(--r-lg)",
                            padding: "20px 24px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "14px",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <strong style={{ fontFamily: "var(--mono)", fontSize: "15px" }}>{ord.order_number || `#${ord.id}`}</strong>
                              <span className={`status-badge status-${ord.order_status || ord.status || "pending"}`}>
                                {ord.order_status || ord.status || "pending"}
                              </span>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--ink-muted)", margin: 0 }}>
                              Placed on {new Date(ord.created_at || Date.now()).toLocaleDateString()} · Total: <strong>Rs. {Number(ord.total || ord.total_amount || 0).toLocaleString()}</strong>
                            </p>
                          </div>

                          <Button
                            text="Live Track Order →"
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/track-order?id=${ord.order_number || ord.id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SECURITY & PASSWORD */}
              {activeTab === "security" && (
                <div>
                  <form onSubmit={handleChangePassword}>
                    <h3 className="settings-section-title">Change Account Password</h3>
                    <p className="settings-section-desc">Keep your Drip Paints account secure with a strong password.</p>

                    <div className="settings-form-grid">
                      <div className="login-field">
                        <label>New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" required />
                      </div>

                      <div className="login-field">
                        <label>Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required />
                      </div>
                    </div>

                    <Button text={loading ? "Updating..." : "Update Password"} className="btn btn-primary" />
                  </form>

                  {/* Notification toggles */}
                  <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--paper-line)" }}>
                    <h3 className="settings-section-title">Email & Push Preferences</h3>
                    <div className="toggle-group" style={{ marginTop: "16px" }}>
                      <div className="toggle-item">
                        <div className="toggle-info">
                          <strong>Order Status Updates</strong>
                          <p>Receive real-time alerts when your paint order is approved or shipped.</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={notifyOrders} onChange={(e) => setNotifyOrders(e.target.checked)} />
                          <span className="toggle-slider" />
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <strong>Email Invoices</strong>
                          <p>Receive PDF invoices for every completed order.</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                          <span className="toggle-slider" />
                        </label>
                      </div>

                      <div className="toggle-item">
                        <div className="toggle-info">
                          <strong>Promotions & Swatch Alerts</strong>
                          <p>Receive seasonal discount codes and color collection previews.</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={notifyOffers} onChange={(e) => setNotifyOffers(e.target.checked)} />
                          <span className="toggle-slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DANGER ZONE / DELETE ACCOUNT */}
              {activeTab === "danger" && (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: "var(--r-xl)", padding: "32px" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{ fontSize: "36px" }}>⚠️</div>
                    <div>
                      <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", color: "#991b1b", margin: 0 }}>
                        Permanently Delete Account
                      </h3>
                      <p style={{ fontSize: "14px", color: "#7f1d1d", margin: "6px 0 0", lineHeight: "1.5" }}>
                        Once you delete your account, there is no going back. All your saved profile details, addresses, wishlist items, and past cart history will be permanently erased.
                      </p>
                    </div>
                  </div>

                  <div style={{ paddingTop: "20px", borderTop: "1px solid #fecaca", display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setDeleteConfirmText("");
                        setError("");
                      }}
                    >
                      🗑️ Delete My Account Permanently
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </main>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--r-xl)",
              padding: "36px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "var(--shadow-xl)",
              border: "1px solid var(--paper-line)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚨</div>
            <h3 style={{ fontFamily: "var(--display)", fontSize: "22px", fontWeight: "700", marginBottom: "8px", color: "var(--poppy)" }}>
              Are you absolutely sure?
            </h3>
            <p style={{ fontSize: "14px", color: "var(--ink-soft)", marginBottom: "20px", lineHeight: "1.5" }}>
              This action cannot be undone. This will permanently delete your account (<strong>{user?.email || "Current Account"}</strong>) and all associated data.
            </p>

            <div style={{ background: "var(--canvas-dark)", padding: "16px", borderRadius: "8px", marginBottom: "20px", textAlign: "left" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", fontFamily: "var(--mono)", color: "var(--ink-muted)", display: "block", marginBottom: "6px" }}>
                Type <strong style={{ color: "var(--poppy)" }}>DELETE</strong> below to confirm:
              </label>
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--paper-line)",
                  fontFamily: "var(--mono)",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
              >
                {deleteLoading ? "Deleting Account..." : "Yes, Delete Account Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
