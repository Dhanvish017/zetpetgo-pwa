import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import api from "../../lib/api";
import styles from "./ProfileScreen.module.css";

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    "arrow-back": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>),
    person: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>),
    business: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>),
    mail: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>),
    location: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>),
    "create-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>),
    "log-out-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>),
    google: (<svg width={size} height={size} viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>),
  };
  return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// PROFILE ROW
// =====================
const ProfileRow = ({ icon, label, value }) => (
  <div className={styles.row}>
    <div className={styles.rowIcon}>
      <Icon name={icon} size={22} color="#4a6cf7" />
    </div>
    <div className={styles.rowText}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value || "Not added"}</span>
    </div>
  </div>
);

// =====================
// PROFILE SCREEN
// =====================
const ProfileScreen = () => {
  const navigate = useNavigate();

  const [user, setUser]                       = useState(null);
  const [supabaseUser, setSupabaseUser]       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ---- LOGOUT ----
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // ---- FETCH ----
  const fetchProfile = async () => {
    try {
      // Get Supabase session for login method info
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      setSupabaseUser(sbUser);

      // Get profile from backend
      const res = await api.get("/api/profile");

      if (!res.data.isProfileComplete) {
        navigate("/create-account", { replace: true });
        return;
      }

      setUser(res.data);
    } catch (err) {
      console.log("Profile fetch error:", err.response?.data || err.message);
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  // ---- LOADING ----
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>Loading profile...</span>
      </div>
    );
  }

  if (!user) return null;

  // Generate initials from name or email
  const displayName = user.name || supabaseUser?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Detect login method
  const loginProvider = supabaseUser?.app_metadata?.provider || "email";
  const isGoogleLogin = loginProvider === "google";

  return (
    <div className={styles.root}>
      <div className={styles.pageCard}>

        {/* HEADER */}
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </button>

          <div className={styles.avatar}>
            <span className={styles.avatarText}>{initials}</span>
          </div>

          <span className={styles.name}>{displayName}</span>

          {/* Show email under name */}
          <span className={styles.email}>{user.email || supabaseUser?.email}</span>

          {/* Show login method badge */}
          <div className={styles.loginBadge}>
            {isGoogleLogin ? (
              <>
                <Icon name="google" size={14} />
                <span>Signed in with Google</span>
              </>
            ) : (
              <>
                <Icon name="mail" size={14} color="rgba(255,255,255,0.8)" />
                <span>Signed in with Email</span>
              </>
            )}
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className={styles.card}>
          <ProfileRow
            icon="person"
            label="Account Type"
            value={user.accountType === "clinic" ? "Clinic" : "Individual Doctor"}
          />
          {user.accountType === "clinic" && (
            <ProfileRow
              icon="business"
              label="Clinic Name"
              value={user.clinicName}
            />
          )}
          <ProfileRow
            icon="mail"
            label="Email"
            value={user.email || supabaseUser?.email}
          />
          <ProfileRow
            icon="location"
            label="Address"
            value={user.address}
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => navigate("/create-account")}
          >
            <Icon name="create-outline" size={20} color="#fff" />
            <span className={styles.btnText}>Edit Profile</span>
          </button>

          <button
            type="button"
            className={styles.logoutBtn}
            onClick={() => setShowLogoutConfirm(true)}
          >
            <Icon name="log-out-outline" size={20} color="#fff" />
            <span className={styles.btnText}>Logout</span>
          </button>
        </div>

      </div>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.modalTitle}>Logout</span>
            <span className={styles.modalMessage}>
              Are you sure you want to logout?
            </span>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;