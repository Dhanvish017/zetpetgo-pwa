import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./dashboardScreen.module.css";

const API_BASE = "https://vetcare-1.onrender.com";

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    "menu-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>),
    "person-circle-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" /><circle cx="10" cy="10" r="3" /></svg>),
    "today-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
    "shield-checkmark": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>),
    "checkmark-circle": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
    leaf: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.34L5.71 21M12 12l-1.5 1.5" /><path d="M21 3c-5 0-10 2-13 8 1 2 2.5 3.5 4 4 0-4 2-6 9-12z" /></svg>),
    "checkmark-done": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 12 5 16 13 8" /><polyline points="9 12 13 16 21 8" /></svg>),
    "walk-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="1.5" /><path d="M13 7l-2 4h4l-1 8" /><path d="M9 19l2-4" /></svg>),
    "time-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>),
    paw: (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><ellipse cx="6" cy="7" rx="2" ry="3" /><ellipse cx="12" cy="5" rx="2" ry="3" /><ellipse cx="18" cy="7" rx="2" ry="3" /><ellipse cx="9" cy="12" rx="2" ry="2.5" /><path d="M12 11c1.5 0 6 3 6 7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3c0-4 4.5-7 6-7z" /></svg>),
    add: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
    today: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
    close: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
    "checkmark-done-circle-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="1 12 5 16 13 8" /><polyline points="9 12 13 16 21 8" /></svg>),
    "chevron-forward": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>),
  };
  return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// STAT CARD
// =====================
const StatCard = ({ icon, label, value, gradient, loading, onPress }) => (
  <button
    type="button"
    className={styles.statCard}
    style={{ background: gradient }}
    onClick={onPress}
    disabled={!onPress}
  >
    <div className={styles.statIconWrap}>
      <Icon name={icon} size={22} color="#fff" />
    </div>
    {loading ? (
      <div className={styles.spinnerSmall} />
    ) : (
      <span className={styles.statNum}>{value}</span>
    )}
    <span className={styles.statLabel}>{label}</span>
  </button>
);

// =====================
// VISIT CARD
// =====================
const VisitCard = ({ icon, label, value, color, bg, loading }) => (
  <div className={styles.visitCard} style={{ backgroundColor: bg }}>
    <div className={styles.visitIconWrap} style={{ backgroundColor: color }}>
      <Icon name={icon} size={20} color="#fff" />
    </div>
    <div className={styles.visitInfo}>
      <span className={styles.visitNum} style={{ color }}>{loading ? "—" : value}</span>
      <span className={styles.visitLabel}>{label}</span>
    </div>
  </div>
);

// =====================
// DASHBOARD SCREEN
// =====================
const dashboardScreen = ({ onOpenDrawer }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ vaccine: {}, deworming: {}, visits: {} });
  const [todayData, setTodayData] = useState({ vaccine: [], deworming: [], total: 0 });
  const [todayModalVisible, setTodayModal] = useState(false);
  const [modalTab, setModalTab] = useState("all");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        vaccine: res.data.vaccine || {},
        deworming: res.data.deworming || {},
        visits: res.data.visits || {},
      });
      setTodayData({
        vaccine: res.data.today?.vaccine || [],
        deworming: res.data.today?.deworming || [],
        total: res.data.today?.total || 0,
      });
    } catch (err) {
      console.log("Dashboard error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const todayCombined = [
    ...todayData.vaccine.map(a => ({ ...a, type: "vaccine" })),
    ...todayData.deworming.map(a => ({ ...a, type: "deworming" })),
  ];

  const filteredModal =
    modalTab === "pending" ? todayCombined.filter(i => i.status === "pending") :
      modalTab === "done" ? todayCombined.filter(i => i.status === "completed") :
        todayCombined;

  const todayPending = (stats.vaccine.pending || 0) + (stats.deworming.pending || 0);
  const todayCompleted = (stats.vaccine.completed || 0) + (stats.deworming.completed || 0);

  return (
    <div className={styles.root}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerRow}>

          <div className={styles.headerText}>
            <span className={styles.headerTitle}>ZetPetGo</span>
            <span className={styles.headerSub}>
              {loading ? "Loading..." : `${todayPending} pending • ${todayCompleted} done today`}
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <button type="button" className={styles.heroCard} onClick={() => setTodayModal(true)}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIconWrap}>
              <Icon name="today-outline" size={28} color="#1565C0" />
            </div>
            <div className={styles.heroInfo}>
              <span className={styles.heroTitle}>Today's Schedule</span>
              <span className={styles.heroSub}>
                {loading ? "Loading..." : todayData.total === 0 ? "No visits today 🎉" : `${todayData.total} animal${todayData.total > 1 ? "s" : ""} due`}
              </span>
            </div>
          </div>
          <div className={styles.heroBadge}>
            {loading ? <div className={styles.spinnerSmall} /> : <span className={styles.heroBadgeText}>{todayData.total}</span>}
          </div>
        </button>
      </div>

      {/* BODY */}
      <div className={styles.body}>

        {/* Stats Grid */}
        <span className={styles.sectionTitle}>📊 Today's Overview</span>
        <div className={styles.statGrid}>
          <StatCard icon="shield-checkmark" label="Vaccine Pending" value={stats.vaccine.pending || 0} gradient="linear-gradient(135deg,#1565C0,#1976D2)" loading={loading} />
          <StatCard icon="checkmark-circle" label="Vaccine Done" value={stats.vaccine.completed || 0} gradient="linear-gradient(135deg,#0097A7,#00BCD4)" loading={loading} />
          <StatCard icon="leaf" label="Deworming Pending" value={stats.deworming.pending || 0} gradient="linear-gradient(135deg,#6A1B9A,#9C27B0)" loading={loading} />
          <StatCard icon="checkmark-done" label="Deworming Done" value={stats.deworming.completed || 0} gradient="linear-gradient(135deg,#2E7D32,#43A047)" loading={loading} />
        </div>

        {/* Visits */}
        <span className={styles.sectionTitle}>🏥 Today's Visits</span>
        <div className={styles.visitRow}>
          <VisitCard icon="walk-outline" label="Visited Today" value={stats.visits.visited || 0} color="#1976D2" bg="#E3F2FD" loading={loading} />
          <VisitCard icon="time-outline" label="Yet to Visit" value={stats.visits.notVisited || 0} color="#F57C00" bg="#FFF3E0" loading={loading} />
        </div>

        {/* Total Banner */}
        <div className={styles.totalBanner}>
          <Icon name="paw" size={18} color="#1565C0" />
          <span className={styles.totalBannerText}>
            {loading ? "Loading..." : `${stats.visits.total || 0} total animal${(stats.visits.total || 0) !== 1 ? "s" : ""} scheduled today`}
          </span>
        </div>

        <div style={{ height: 100 }} />
      </div>

      {/* FAB */}
      <button type="button" className={styles.fab} onClick={() => navigate("/addanimal")} aria-label="Add animal">
        <Icon name="add" size={32} color="#fff" />
      </button>

      {/* TODAY MODAL */}
      {todayModalVisible && (
        <div className={styles.modalOverlay} onClick={() => setTodayModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <Icon name="today" size={20} color="#1976D2" />
                <span className={styles.modalTitle}>Today's Schedule</span>
              </div>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setTodayModal(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className={styles.modalTabs}>
              {[
                { key: "all", label: `All (${todayCombined.length})` },
                { key: "pending", label: `Pending (${todayCombined.filter(i => i.status === "pending").length})` },
                { key: "done", label: `Done (${todayCombined.filter(i => i.status === "completed").length})` },
              ].map(t => (
                <button
                  key={t.key}
                  type="button"
                  className={`${styles.modalTab} ${modalTab === t.key ? styles.modalTabActive : ""}`}
                  onClick={() => setModalTab(t.key)}
                >
                  <span className={`${styles.modalTabText} ${modalTab === t.key ? styles.modalTabTextActive : ""}`}>{t.label}</span>
                </button>
              ))}
            </div>

            {/* List */}
            <div className={styles.modalList}>
              {filteredModal.length === 0 ? (
                <div className={styles.modalEmpty}>
                  <Icon name="checkmark-done-circle-outline" size={52} color="#c7d2fe" />
                  <span className={styles.modalEmptyText}>Nothing here</span>
                </div>
              ) : (
                filteredModal.map((item, i) => {
                  const isDone = item.status === "completed";
                  return (
                    <button
                      key={`${item.animalId}-${item.type}-${i}`}
                      type="button"
                      className={`${styles.listItem} ${isDone ? styles.listItemDone : ""}`}
                      onClick={() => { setTodayModal(false); navigate(`/animal/${item.animalId}`); }}
                    >
                      <div
                        className={styles.listAvatar}
                        style={{ backgroundColor: item.type === "vaccine" ? "#E3F2FD" : "#F3E5F5" }}
                      >
                        <span className={styles.listEmoji}>
                          {item.species === "dog" ? "🐶" : item.species === "cat" ? "🐱" : "🐾"}
                        </span>
                      </div>
                      <div className={styles.listInfo}>
                        <div className={styles.listNameRow}>
                          <span className={styles.listName}>{item.animalName}</span>
                          {isDone && <Icon name="checkmark-circle" size={14} color="#43A047" />}
                        </div>
                        <span className={styles.listOwner}>👤 {item.ownerName}</span>
                        <span className={styles.listDetail}>
                          {item.type === "vaccine"
                            ? `💉 ${item.vaccineName}${item.stage ? ` · ${item.stage}` : ""}`
                            : `🪱 ${item.dewormingName}`}
                        </span>
                      </div>
                      <div className={styles.listRight}>
                        <span
                          className={styles.typeBadge}
                          style={{
                            backgroundColor: item.type === "vaccine" ? "#E3F2FD" : "#F3E5F5",
                            color: item.type === "vaccine" ? "#1565C0" : "#6A1B9A",
                          }}
                        >
                          {item.type === "vaccine" ? "Vaccine" : "Deworming"}
                        </span>
                        <Icon name="chevron-forward" size={16} color="#94a3b8" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default dashboardScreen;