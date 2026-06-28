import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./NotificationScreen.module.css";

const API_BASE = "https://vetcare-1.onrender.com";
const SENT_KEY = "notif_sent_ids";

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    "arrow-back": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>),
    "shield-checkmark": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>),
    leaf: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.34L5.71 21M12 12l-1.5 1.5" /><path d="M21 3c-5 0-10 2-13 8 1 2 2.5 3.5 4 4 0-4 2-6 9-12z" /></svg>),
    "notifications-off-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M18.63 13A17.89 17.89 0 0 1 18 8" /><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" /><path d="M18 8a6 6 0 0 0-9.33-5" /><line x1="1" y1="1" x2="23" y2="23" /></svg>),
    "checkmark-circle": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
    "logo-whatsapp": (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>),
  };
  return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// HELPERS
// =====================
const getSentIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SENT_KEY) || "[]")); }
  catch { return new Set(); }
};
const saveSentId = (id) => {
  const ids = getSentIds();
  ids.add(id);
  localStorage.setItem(SENT_KEY, JSON.stringify([...ids]));
};
const applyCompleted = (list, ids) =>
  list.map(item => ids.has(item._id) ? { ...item, completed: true } : item);

// =====================
// TAB BUTTON
// =====================
const TabButton = ({ label, value, activeTab, setActiveTab }) => (
  <button
    type="button"
    className={`${styles.tabBtn} ${activeTab === value ? styles.tabBtnActive : ""}`}
    onClick={() => setActiveTab(value)}
  >
    <span className={`${styles.tabText} ${activeTab === value ? styles.tabTextActive : ""}`}>{label}</span>
  </button>
);

// =====================
// NOTIFICATION CARD
// =====================
const NotificationCard = ({ item, onSend, showLabel = false, isThankYou = false }) => {
  const isCompleted = isThankYou ? !!item.sent : (item.completed || item.status === "completed");

  const getSpecialBadge = (t) => {
    if (t === "first_time") return { bg: "#F5F3FF", color: "#8b5cf6", label: "New Owner" };
    if (t === "birthday") return { bg: "#FFFBEB", color: "#f59e0b", label: "Birthday" };
    if (t === "three_months") return { bg: "#ECFEFF", color: "#06b6d4", label: "3 Months" };
    return { bg: "#F5F3FF", color: "#8b5cf6", label: "Special" };
  };

  const sp = item.type === "special" ? getSpecialBadge(item.specialType) : null;
  const badgeBg = item.type === "vaccine" ? "#EEF2FF" : sp ? sp.bg : "#F0FDF4";
  const badgeColor = item.type === "vaccine" ? "#4a6cf7" : sp ? sp.color : "#16A34A";
  const badgeLabel = item.type === "vaccine" ? "Vaccine" : sp ? sp.label : "Deworming";

  return (
    <div className={`${styles.card} ${isCompleted ? styles.cardCompleted : ""}`}>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <span className={styles.petName}>{item.animalName}</span>
          <span className={styles.badge} style={{ backgroundColor: badgeBg, color: badgeColor }}>
            {badgeLabel}
          </span>
        </div>
        <span className={styles.ownerName}>Owner: {item.ownerName}</span>
        {showLabel && item.label && (
          <span className={styles.specialLabel}>{item.label}</span>
        )}
        {isCompleted && (
          <div className={styles.completedBadge}>
            <Icon name="checkmark-circle" size={12} color="#16A34A" />
            <span className={styles.completedText}>Sent</span>
          </div>
        )}
      </div>
      <button
        type="button"
        className={`${styles.whatsappBtn} ${isCompleted ? styles.whatsappBtnDisabled : ""}`}
        onClick={() => !isCompleted && onSend(item)}
        disabled={isCompleted}
        aria-label="Send WhatsApp"
      >
        <Icon name="logo-whatsapp" size={24} color="#fff" />
      </button>
    </div>
  );
};

// =====================
// SECTION
// =====================
const Section = ({ title, data, sendWhatsApp }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className={styles.sectionContainer}>
      <span className={styles.sectionTitle}>{title}</span>
      {data.map((item) => (
        <NotificationCard
          key={`${item._id || item.animalId}-${item.type}`}
          item={item}
          onSend={sendWhatsApp}
        />
      ))}
    </div>
  );
};

// =====================
// EMPTY STATE
// =====================
const EmptyState = ({ text }) => (
  <div className={styles.emptyContainer}>
    <Icon name="notifications-off-outline" size={48} color="#CBD5E1" />
    <span className={styles.emptyText}>{text}</span>
  </div>
);

// =====================
// NOTIFICATIONS SCREEN
// =====================
const NotificationsScreen = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("notification");
  const [activeTypeTab, setActiveTypeTab] = useState("vaccine");
  const [activeSpecialTab, setActiveSpecialTab] = useState("new_owner");
  const [loading, setLoading] = useState(false);
  const [sentIds, setSentIds] = useState(getSentIds);

  const [notificationData, setNotificationData] = useState({ today: [], tomorrow: [], seventhDay: [] });
  const [missedList, setMissedList] = useState([]);
  const [specialList, setSpecialList] = useState([]);
  const [thanksList, setThanksList] = useState([]);

  const getToken = () => localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const ids = getSentIds();
      setNotificationData({
        today: applyCompleted(res.data.today || [], ids),
        tomorrow: applyCompleted(res.data.tomorrow || [], ids),
        seventhDay: applyCompleted(res.data.seventhDay || [], ids),
      });
    } catch { alert("Failed to fetch notifications"); }
    finally { setLoading(false); }
  }, []);

  const fetchMissed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/notifications/missed`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMissedList(applyCompleted(res.data || [], getSentIds()));
    } catch { alert("Failed to fetch missed messages"); }
    finally { setLoading(false); }
  }, []);

  const fetchSpecial = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/notifications/special`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setSpecialList(applyCompleted(res.data || [], getSentIds()));
    } catch { alert("Failed to fetch special messages"); }
    finally { setLoading(false); }
  }, []);

  const fetchThanks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/notifications/thank-you`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setThanksList(res.data || []);
    } catch { alert("Failed to fetch thank you list"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "notification") fetchNotifications();
    if (activeTab === "missed") fetchMissed();
    if (activeTab === "special") fetchSpecial();
    if (activeTab === "thanks") fetchThanks();
  }, [activeTab]);

  const sendWhatsApp = async (item) => {
    try {
      const token = getToken();
      const reminderPayload = {
        ownerName: item.ownerName,
        petName: item.animalName,
        type: item.specialType || item.type,
        dueDate: item.dueDate ? new Date(item.dueDate).toDateString() : "",
        species: item.species || "",
      };

      let messageType = "reminder";
      if (activeTab === "missed") messageType = "missed";
      else if (activeTab === "special") {
        if (item.specialType === "birthday") messageType = "birthday";
        else if (item.specialType === "three_months") messageType = "three_months";
        else messageType = "new_owner";
      } else if (activeTab === "thanks") messageType = "thankyou";

      const buildRes = await axios.post(
        `${API_BASE}/api/notify/build-whatsapp-message`,
        { reminder: reminderPayload, messageType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const message = buildRes.data.message;

      let phone = item.ownerPhone?.replace(/\D/g, "");
      if (!phone) { alert("Owner phone number missing"); return; }
      if (phone.length === 10) phone = "91" + phone;
      else if (!(phone.length === 12 && phone.startsWith("91"))) { alert("Invalid phone number"); return; }

      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      const whatsappUrl = isMobile
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank");

      let endpoint = "send-whatsapp";
      if (activeTab === "missed") endpoint = "send-followup";
      else if (activeTab === "special") endpoint = "send-special";

      await axios.post(
        `${API_BASE}/api/notifications/${endpoint}/${item.animalId}`,
        { type: item.type, scheduleRowId: item.scheduleRowId, ownerId: item.ownerId, specialType: item.specialType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      saveSentId(item._id);
      setSentIds(getSentIds());

      const markDone = (list) => list.map(i => i._id === item._id ? { ...i, completed: true } : i);

      if (activeTab === "notification") {
        setNotificationData(prev => ({
          today: markDone(prev.today),
          tomorrow: markDone(prev.tomorrow),
          seventhDay: markDone(prev.seventhDay),
        }));
      } else if (activeTab === "missed") setMissedList(prev => markDone(prev));
      else if (activeTab === "special") setSpecialList(prev => markDone(prev));
      else if (activeTab === "thanks") setThanksList(prev => prev.map(i => i._id === item._id ? { ...i, sent: true } : i));

    } catch (err) {
      console.error("SEND ERROR:", err.message);
      alert("Failed to send message.");
    }
  };

  // Derived data
  const filteredToday = notificationData.today.filter(i => i.type === activeTypeTab);
  const filteredTomorrow = notificationData.tomorrow.filter(i => i.type === activeTypeTab);
  const filteredSeventhDay = notificationData.seventhDay.filter(i => i.type === activeTypeTab);
  const hasFiltered = filteredToday.length > 0 || filteredTomorrow.length > 0 || filteredSeventhDay.length > 0;

  const vaccineCount = [...notificationData.today, ...notificationData.tomorrow, ...notificationData.seventhDay].filter(i => i.type === "vaccine").length;
  const dewormingCount = [...notificationData.today, ...notificationData.tomorrow, ...notificationData.seventhDay].filter(i => i.type === "deworming").length;

  const newOwnerList = specialList.filter(i => i.specialType === "first_time");
  const birthdayList = specialList.filter(i => i.specialType === "birthday");
  const threeMonthsList = specialList.filter(i => i.specialType === "three_months");

  const activeSpecialList =
    activeSpecialTab === "new_owner" ? newOwnerList :
      activeSpecialTab === "birthday" ? birthdayList :
        threeMonthsList;

  const listData = activeTab === "missed" ? missedList : activeTab === "thanks" ? thanksList : [];

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <button type="button" className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
            <Icon name="arrow-back" size={24} color="#fff" />
          </button>
          <span className={styles.headerTitle}>Notifications</span>
          <div style={{ width: 40 }} />
        </div>
      </div>

      {/* MAIN TABS */}
      <div className={styles.tabContainer}>
        <TabButton label="Notification" value="notification" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton label="Missed" value="missed" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton label="Special" value="special" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton label="Thanks" value="thanks" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* SUB-TABS — Notification tab only */}
      {activeTab === "notification" && (
        <div className={styles.subTabContainer}>
          <button
            type="button"
            className={`${styles.subTabBtn} ${activeTypeTab === "vaccine" ? styles.subTabBtnActive : ""}`}
            onClick={() => setActiveTypeTab("vaccine")}
          >
            <Icon name="shield-checkmark" size={14} color={activeTypeTab === "vaccine" ? "#4a6cf7" : "#94a3b8"} />
            <span className={`${styles.subTabText} ${activeTypeTab === "vaccine" ? styles.subTabTextActiveVaccine : ""}`}>Vaccine</span>
            {vaccineCount > 0 && (
              <span className={styles.countBadge} style={{ backgroundColor: activeTypeTab === "vaccine" ? "#4a6cf7" : "#cbd5e1" }}>
                {vaccineCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`${styles.subTabBtn} ${activeTypeTab === "deworming" ? styles.subTabBtnActive : ""}`}
            onClick={() => setActiveTypeTab("deworming")}
          >
            <Icon name="leaf" size={14} color={activeTypeTab === "deworming" ? "#10b981" : "#94a3b8"} />
            <span className={`${styles.subTabText} ${activeTypeTab === "deworming" ? styles.subTabTextActiveDeworming : ""}`}>Deworming</span>
            {dewormingCount > 0 && (
              <span className={styles.countBadge} style={{ backgroundColor: activeTypeTab === "deworming" ? "#10b981" : "#cbd5e1" }}>
                {dewormingCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* CONTENT */}
      <div className={styles.content}>
        <div className={styles.contentInner}>

          {loading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.spinner} />
            </div>

          ) : activeTab === "notification" ? (
            !hasFiltered ? (
              <EmptyState text={`No ${activeTypeTab} notifications`} />
            ) : (
              <>
                <Section title="Today" data={filteredToday} sendWhatsApp={sendWhatsApp} />
                <Section title="Tomorrow" data={filteredTomorrow} sendWhatsApp={sendWhatsApp} />
                <Section title="7 Days Later" data={filteredSeventhDay} sendWhatsApp={sendWhatsApp} />
              </>
            )

          ) : activeTab === "special" ? (
            <>
              {/* SPECIAL SUB-TABS */}
              <div className={styles.specialTabRow}>
                <button
                  type="button"
                  className={`${styles.specialTabBtn} ${activeSpecialTab === "new_owner" ? styles.specialTabBtnNewOwner : ""}`}
                  onClick={() => setActiveSpecialTab("new_owner")}
                >
                  <span className={`${styles.specialTabText} ${activeSpecialTab === "new_owner" ? styles.specialTabTextActive : ""}`}>🌟 New Owner</span>
                  {newOwnerList.length > 0 && (
                    <span className={styles.specialTabBadge} style={{ backgroundColor: activeSpecialTab === "new_owner" ? "rgba(255,255,255,0.3)" : "#8b5cf6" }}>
                      {newOwnerList.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`${styles.specialTabBtn} ${activeSpecialTab === "birthday" ? styles.specialTabBtnBirthday : ""}`}
                  onClick={() => setActiveSpecialTab("birthday")}
                >
                  <span className={`${styles.specialTabText} ${activeSpecialTab === "birthday" ? styles.specialTabTextActive : ""}`}>🎂 Birthday</span>
                  {birthdayList.length > 0 && (
                    <span className={styles.specialTabBadge} style={{ backgroundColor: activeSpecialTab === "birthday" ? "rgba(255,255,255,0.3)" : "#f59e0b" }}>
                      {birthdayList.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className={`${styles.specialTabBtn} ${activeSpecialTab === "three_months" ? styles.specialTabBtnThree : ""}`}
                  onClick={() => setActiveSpecialTab("three_months")}
                >
                  <span className={`${styles.specialTabText} ${activeSpecialTab === "three_months" ? styles.specialTabTextActive : ""}`}>📅 3 Months</span>
                  {threeMonthsList.length > 0 && (
                    <span className={styles.specialTabBadge} style={{ backgroundColor: activeSpecialTab === "three_months" ? "rgba(255,255,255,0.3)" : "#06b6d4" }}>
                      {threeMonthsList.length}
                    </span>
                  )}
                </button>
              </div>

              {activeSpecialList.length === 0 ? (
                <EmptyState text="No messages here" />
              ) : (
                activeSpecialList.map((item) => (
                  <NotificationCard key={`${item._id || item.animalId}-${item.specialType}`} item={item} onSend={sendWhatsApp} showLabel />
                ))
              )}
            </>

          ) : listData.length === 0 ? (
            <EmptyState text="No data available" />
          ) : (
            listData.map((item, index) => (
              <NotificationCard
                key={item._id?.toString() || index}
                item={item}
                onSend={sendWhatsApp}
                isThankYou={activeTab === "thanks"}
              />
            ))
          )}

        </div>
      </div>
    </div>
  );
};

export default NotificationsScreen;