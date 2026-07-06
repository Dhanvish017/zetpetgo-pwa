import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { MESSAGE_TEMPLATES_UI } from "../../constants/messageTemplates";
import styles from "./NotifyScreen.module.css";

const SELECTIONS_KEY = "notify_category_selections";

const CATEGORIES = [
    {
        key: "reminder",
        label: "Reminder",
        icon: "🔔",
        color: "#4a6cf7",
        lightBg: "#eef2ff",
        templates: MESSAGE_TEMPLATES_UI.REMINDER.map((t) => ({ id: t.id, label: t.title, preview: t.preview })),
    },
    {
        key: "birthday",
        label: "Birthday",
        icon: "🎂",
        color: "#f59e0b",
        lightBg: "#fffbeb",
        templates: MESSAGE_TEMPLATES_UI.BIRTHDAY.map((t) => ({ id: t.id, label: t.title, preview: t.preview })),
    },
    {
        key: "new_owner",
        label: "New Owner",
        icon: "🐾",
        color: "#8b5cf6",
        lightBg: "#f5f3ff",
        templates: MESSAGE_TEMPLATES_UI.NEW_OWNER.map((t) => ({ id: t.id, label: t.title, preview: t.preview })),
    },
    {
        key: "thank_you",
        label: "Thank You",
        icon: "❤️",
        color: "#10b981",
        lightBg: "#ecfdf5",
        templates: MESSAGE_TEMPLATES_UI.THANK_YOU.map((t) => ({ id: t.id, label: t.title, preview: t.preview })),
    },
    {
        key: "three_months",
        label: "Three Months",
        icon: "📅",
        color: "#06b6d4",
        lightBg: "#ecfeff",
        templates: MESSAGE_TEMPLATES_UI.THREE_MONTHS.map((t) => ({ id: t.id, label: t.title, preview: t.preview })),
    },
    {
        key: "missed",
        label: "Missed",
        icon: "⏰",
        color: "#ef4444",
        lightBg: "#fef2f2",
        templates: MESSAGE_TEMPLATES_UI.MISSED.map((t) => ({ id: t.id, label: t.title, preview: t.preview })),
    },
];

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
    const icons = {
        "arrow-back": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>),
        "check-circle": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
        check: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
        "expand-less": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>),
        "expand-more": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>),
    };
    return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// NOTIFY SCREEN
// =====================
export default function NotifyScreen() {
    const navigate = useNavigate();

    const [selections, setSelections] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [expanded, setExpanded] = useState(
        Object.fromEntries(CATEGORIES.map((c) => [c.key, true]))
    );

    useEffect(() => { loadSelections(); }, []);

    const loadSelections = async () => {
        try {
            // 1. Local cache first
            const stored = localStorage.getItem(SELECTIONS_KEY);
            if (stored) setSelections(JSON.parse(stored));

            // 2. Sync from backend
            const res = await api.get("/api/notify/whatsapp-template");
            const backendData = res.data?.templateId;
            if (backendData && typeof backendData === "object" && Object.keys(backendData).length > 0) {
                setSelections(backendData);
                localStorage.setItem(SELECTIONS_KEY, JSON.stringify(backendData));
            }
        } catch (err) {
            console.log("NotifyScreen load error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectTemplate = async (categoryKey, templateId) => {
        try {
            const updated = { ...selections, [categoryKey]: templateId };
            setSelections(updated);
            localStorage.setItem(SELECTIONS_KEY, JSON.stringify(updated));

            setSaving(categoryKey);
            await api.post(
                "/api/notify/whatsapp-template",
                { templateId, category: categoryKey }
            );
        } catch (err) {
            console.log("Template save error:", err.message);
        } finally {
            setSaving(null);
        }
    };

    const toggleExpand = (key) =>
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

    if (loading) {
        return (
            <div className={styles.center}>
                <div className={styles.spinner} />
            </div>
        );
    }

    const configuredCount = CATEGORIES.filter((c) => selections[c.key]).length;

    return (
        <div className={styles.mainContainer}>

            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerInner}>
                    <button type="button" className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </button>
                    <span className={styles.headerTitle}>Notifications</span>
                    {configuredCount > 0 && (
                        <div className={styles.headerBadge}>
                            <Icon name="check-circle" size={14} color="#fff" />
                            <span className={styles.headerBadgeText}>{configuredCount}/{CATEGORIES.length} Active</span>
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <div className={styles.scrollView}>
                <div className={styles.container}>
                    <p className={styles.pageSubtitle}>
                        Select one template per category. Each category sends its own message.
                    </p>

                    {CATEGORIES.map((cat) => {
                        const catSelected = selections[cat.key] || null;
                        const activeTpl = cat.templates.find((t) => t.id === catSelected);
                        const isSaving = saving === cat.key;

                        return (
                            <div key={cat.key} className={styles.categoryBlock}>

                                {/* Category Header */}
                                <button
                                    type="button"
                                    className={styles.categoryHeader}
                                    style={{ borderLeftColor: cat.color }}
                                    onClick={() => toggleExpand(cat.key)}
                                >
                                    <div className={styles.categoryIconWrap} style={{ backgroundColor: cat.lightBg }}>
                                        <span style={{ fontSize: 18 }}>{cat.icon}</span>
                                    </div>
                                    <div className={styles.categoryLabelWrap}>
                                        <span className={styles.categoryLabel} style={{ color: cat.color }}>
                                            {cat.label}
                                        </span>
                                        {isSaving ? (
                                            <span className={styles.categoryCount} style={{ color: cat.color }}>Saving...</span>
                                        ) : activeTpl ? (
                                            <div className={styles.activePillRow}>
                                                <Icon name="check-circle" size={12} color={cat.color} />
                                                <span className={styles.activePillText} style={{ color: cat.color }}>
                                                    {activeTpl.label}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={styles.categoryCount}>
                                                {cat.templates.length} template{cat.templates.length > 1 ? "s" : ""} · tap to pick
                                            </span>
                                        )}
                                    </div>
                                    <Icon name={expanded[cat.key] ? "expand-less" : "expand-more"} size={22} color="#999" />
                                </button>

                                {/* Templates */}
                                {expanded[cat.key] && cat.templates.map((tpl) => {
                                    const isSelected = catSelected === tpl.id;
                                    return (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                                            style={isSelected ? { borderColor: cat.color, backgroundColor: cat.lightBg } : {}}
                                            onClick={() => selectTemplate(cat.key, tpl.id)}
                                        >
                                            <div className={styles.cardRow}>
                                                <div
                                                    className={styles.radioOuter}
                                                    style={isSelected ? { borderColor: cat.color } : {}}
                                                >
                                                    {isSelected && (
                                                        <div className={styles.radioInner} style={{ backgroundColor: cat.color }} />
                                                    )}
                                                </div>
                                                <div className={styles.cardContent}>
                                                    <span
                                                        className={styles.cardTitle}
                                                        style={isSelected ? { color: cat.color } : {}}
                                                    >
                                                        {tpl.label}
                                                    </span>
                                                    <span className={styles.cardPreview}>{tpl.preview}</span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className={styles.selectedBadge} style={{ backgroundColor: cat.color }}>
                                                    <Icon name="check" size={12} color="#fff" />
                                                    <span className={styles.selectedBadgeText}>Selected</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}