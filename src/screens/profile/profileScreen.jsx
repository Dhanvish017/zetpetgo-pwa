import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ProfileScreen.module.css";

const API_BASE = "https://vetcare-1.onrender.com";

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
      <span className={styles.rowValue}>{value}</span>
    </div>
  </div>
);

// =====================
// PROFILE SCREEN
// =====================
const ProfileScreen = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login", { replace: true }); return; }

      const res = await axios.get(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.isProfileComplete) {
        navigate("/createAccount", { replace: true });
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

  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={styles.root}>
      <div className={styles.pageCard}>

        {/* HEADER */}
        <div className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
            <Icon name="arrow-back" size={24} color="#fff" />
          </button>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>{initials}</span>
          </div>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.phone}>{user.phone}</span>
        </div>

        {/* PROFILE CARD */}
        <div className={styles.card}>
          <ProfileRow icon="person" label="Account Type" value={user.accountType === "clinic" ? "Clinic" : "Individual Doctor"} />
          {user.accountType === "clinic" && (
            <ProfileRow icon="business" label="Clinic Name" value={user.clinicName} />
          )}
          <ProfileRow icon="mail" label="Email" value={user.email || "Not added"} />
          <ProfileRow icon="location" label="Address" value={user.address || "Not added"} />
        </div>

        {/* ACTION BUTTONS */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => navigate("/createAccount")}
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
        <div className={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <span className={styles.modalTitle}>Logout</span>
            <span className={styles.modalMessage}>Are you sure you want to logout?</span>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancel} onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button type="button" className={styles.modalConfirm} onClick={handleLogout}>
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
