import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import styles from "./AnalyticScreen.module.css";

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    "arrow-back": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    notifications: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} fill="none" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    people: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    "mail-open": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
    "information-circle-outline": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  };
  return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// ANALYTIC SCREEN
// =====================
const AnalyticScreen = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    vaccineCount: 0,
    dewormingCount: 0,
    totalSent: 0,
    vaccineVisited: 0,
    dewormingVisited: 0,
    totalVisited: 0,
    thankyouCount: 0,
    missedCount: 0,
    conversionRate: "0.0",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("vaccine");

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get("/api/analytics/today");
      setData(res.data);
    } catch (err) {
      console.log("Analytics Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const currentSent = activeTab === "vaccine" ? data.vaccineCount : data.dewormingCount;
  const currentVisited = activeTab === "vaccine" ? data.vaccineVisited : data.dewormingVisited;
  const conversionRate = currentSent > 0 ? ((currentVisited / currentSent) * 100).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button type="button" className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
            <Icon name="arrow-back" size={24} color="#fff" />
          </button>
          <span className={styles.headerTitle}>Analytics Dashboard</span>
          <button
            type="button"
            className={`${styles.refreshButton} ${refreshing ? styles.refreshing : ""}`}
            onClick={onRefresh}
            aria-label="Refresh"
            disabled={refreshing}
          >
            <Icon name="refresh" size={20} color="#fff" />
          </button>
        </div>

        <div className={styles.scoreContainer}>
          <span className={styles.scoreLabel}>Conversion Rate</span>
          <span className={styles.scoreValue}>{conversionRate}%</span>
          <span className={styles.scoreSubLabel}>
            {currentVisited} visited out of {currentSent} sent today
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className={styles.scrollView}>
        <div className={styles.contentContainer}>

          {/* TAB SWITCHER */}
          <div className={styles.tabContainer}>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "vaccine" ? styles.activeTabButton : ""}`}
              onClick={() => setActiveTab("vaccine")}
            >
              <span className={`${styles.tabText} ${activeTab === "vaccine" ? styles.activeTabText : ""}`}>
                Vaccine
              </span>
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "deworming" ? styles.activeTabButton : ""}`}
              onClick={() => setActiveTab("deworming")}
            >
              <span className={`${styles.tabText} ${activeTab === "deworming" ? styles.activeTabText : ""}`}>
                Deworming
              </span>
            </button>
          </div>

          {/* CARDS ROW (desktop: 2-col grid, mobile: stack) */}
          <div className={styles.cardsGrid}>

            {/* REMINDERS SENT CARD */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconContainer} style={{ backgroundColor: "#e3f2fd" }}>
                  <Icon name="notifications" size={22} color="#1976d2" />
                </div>
                <span className={styles.cardTitle}>
                  {activeTab === "vaccine" ? "Vaccine" : "Deworming"} Reminders Sent
                </span>
              </div>
              <div className={styles.singleStatContainer}>
                <span className={styles.bigStatValue}>{currentSent}</span>
                <span className={styles.statLabel}>Total Sent Today</span>
              </div>
            </div>

            {/* VISITED CARD */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconContainer} style={{ backgroundColor: "#e8f5e9" }}>
                  <Icon name="people" size={22} color="#388e3c" />
                </div>
                <span className={styles.cardTitle}>
                  {activeTab === "vaccine" ? "Vaccine" : "Deworming"} Visits
                </span>
              </div>
              <div className={styles.singleStatContainer}>
                <span className={styles.bigStatValue} style={{ color: "#388e3c" }}>{currentVisited}</span>
                <span className={styles.statLabel}>Number of Visits Today</span>
              </div>
              <div className={styles.infoRow}>
                <Icon name="information-circle-outline" size={14} color="#94a3b8" />
                <span className={styles.infoText}>
                  Counted when doctor marks a schedule row as done
                </span>
              </div>
            </div>

            {/* OTHER MESSAGES CARD */}
            <div className={`${styles.card} ${styles.cardWide}`}>
              <div className={styles.cardHeader}>
                <div className={styles.iconContainer} style={{ backgroundColor: "#fff3e0" }}>
                  <Icon name="mail-open" size={22} color="#f57c00" />
                </div>
                <span className={styles.cardTitle}>Other Messages</span>
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{data.thankyouCount}</span>
                  <span className={styles.statLabel}>Thank You</span>
                </div>
                <div className={styles.verticalDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{data.missedCount}</span>
                  <span className={styles.statLabel}>Follow-up</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticScreen;