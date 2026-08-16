import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer, Button } from "@/components";
import { fetchUserProfile, updateUserProfile, changeUserPassword, uploadFileToBucket } from "@/services/supabaseHelpers";
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const profile = await fetchUserProfile(user.id);
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
      setError("Please sign in to save settings.");
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

      // Instantly update Navbar avatar in Redux (no reload needed)
      dispatch(syncProfile({ avatar_url: avatarUrl, full_name: fullName }));

      setMessage("Profile settings updated successfully!");
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
      setMessage("Avatar uploaded! Click 'Save Profile Details' to keep changes.");
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

  return (
    <>
      <Navbar />

      <section className="cart-page">
        <div className="wrap">
          <div className="cart-header">
            <div>
              <p className="products-eyebrow">ACCOUNT & PREFERENCES</p>
              <h1 className="products-title">User Profile Settings</h1>
            </div>
            {isAuthenticated && (
              <Button text="Sign Out 🚪" className="btn btn-danger btn-sm" onClick={handleLogout} />
            )}
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
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        border: avatarUrl === preset ? "2px solid var(--cobalt)" : "2px solid transparent",
                        opacity: avatarUrl === preset ? 1 : 0.7,
                        transition: "all 0.2s ease"
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--paper-line)" }}>
                <Button text="Sign Out 🚪" className="btn btn-danger" style={{ width: "100%" }} onClick={handleLogout} />
              </div>
            </aside>

            {/* Right Settings Form */}
            <main className="settings-main">
              {message && (
                <div className="settings-alert success">
                  ✔ {message}
                </div>
              )}

              {error && (
                <div className="settings-alert error">
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <h3 className="settings-section-title">Personal Information</h3>
                <p className="settings-section-desc">Update your profile details and personal info.</p>

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
                    <label>Email Address (Account)</label>
                    <input type="email" value={user?.email || ""} disabled style={{ background: "var(--canvas-dark)", cursor: "not-allowed" }} />
                  </div>

                  <div className="login-field">
                    <label>Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
                  </div>
                </div>

                <div className="login-field" style={{ marginBottom: "24px" }}>
                  <label>Avatar Picture URL or Upload Custom</label>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/my-photo.jpg" style={{ flex: 1 }} />
                    <input type="file" accept="image/*" id="avatar-upload" onChange={handleAvatarUpload} style={{ display: "none" }} />
                    <label htmlFor="avatar-upload" className="btn btn-ghost" style={{ cursor: "pointer", padding: "10px 16px", borderRadius: "8px" }}>Upload 📸</label>
                  </div>
                </div>

                <h3 className="settings-section-title" style={{ marginTop: "32px" }}>Default Shipping Address</h3>
                <p className="settings-section-desc">Used for quick order checkout.</p>

                <div className="settings-form-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
                  <div className="login-field">
                    <label>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Karachi" />
                  </div>

                  <div className="login-field">
                    <label>Street Address</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House 123, Street 4, Phase 5, DHA" />
                  </div>
                </div>

                <Button text={loading ? "Saving..." : "Save Profile Details"} className="btn btn-primary" />
              </form>

              {/* Password Section */}
              <form onSubmit={handleChangePassword} style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--paper-line)" }}>
                <h3 className="settings-section-title">Security & Password</h3>
                <p className="settings-section-desc">Change your password to keep your account safe.</p>

                <div className="settings-form-grid">
                  <div className="login-field">
                    <label>New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required />
                  </div>

                  <div className="login-field">
                    <label>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                  </div>
                </div>

                <Button text="Update Password" className="btn btn-ghost" />
              </form>

              {/* Notification Preferences */}
              <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--paper-line)" }}>
                <h3 className="settings-section-title">Notification Preferences</h3>
                <p className="settings-section-desc">Choose what updates you want to receive.</p>

                <div className="toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <strong>Email Order Receipts</strong>
                      <p>Receive detailed order confirmation emails.</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <strong>Order Status Alerts</strong>
                      <p>Get real-time status notifications for your purchases.</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={notifyOrders} onChange={(e) => setNotifyOrders(e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <strong>Promotions & Seasonal Discounts</strong>
                      <p>Receive exclusive offers and paint swatch discounts.</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={notifyOffers} onChange={(e) => setNotifyOffers(e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
