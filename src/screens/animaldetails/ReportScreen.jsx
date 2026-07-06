import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import styles from "./ReportScreen.module.css";

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
    };
    return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// CHART (Canvas)
// =====================
const MetricsChart = ({ received, missed, visits }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const loadChart = async () => {
            // Dynamically load Chart.js from CDN if not already loaded
            if (!window.Chart) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            // Destroy previous chart instance if it exists
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const ctx = canvasRef.current.getContext("2d");
            chartRef.current = new window.Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["Received", "Missed", "Visits"],
                    datasets: [{
                        data: [received, missed, visits],
                        backgroundColor: [
                            "rgba(74, 108, 247, 0.8)",
                            "rgba(239, 68, 68, 0.8)",
                            "rgba(16, 185, 129, 0.8)",
                        ],
                        borderColor: ["#4a6cf7", "#ef4444", "#10b981"],
                        borderWidth: 1,
                        borderRadius: 6,
                        barThickness: 50,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: "rgba(30, 41, 59, 0.9)",
                            padding: 10,
                            cornerRadius: 8,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: "#f1f5f9" },
                            ticks: { font: { size: 10 }, color: "#64748b" },
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 12, weight: "600" }, color: "#334155" },
                        },
                    },
                    animation: { duration: 1200, easing: "easeOutQuart" },
                },
            });
        };

        loadChart();

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [received, missed, visits]);

    return (
        <div className={styles.chartContainer}>
            <canvas ref={canvasRef} />
        </div>
    );
};

// =====================
// REPORT SCREEN
// =====================
const ReportScreen = () => {
    const navigate = useNavigate();
    const { ownerId } = useParams();

    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        notificationsReceived: 0,
        notificationsMissed: 0,
        clinicVisits: 0,
    });

    // ---- SCORE ----
    const score = useMemo(() => {
        const { notificationsReceived, notificationsMissed } = metrics;
        const total = notificationsReceived + notificationsMissed;
        if (total === 0) return 0;
        return Math.min(100, Math.max(0, Math.round((notificationsReceived / total) * 100)));
    }, [metrics]);

    // ---- STATUS ----
    const getStatus = (s) => {
        if (s >= 80) return { label: "Highly Responsible 🟢", color: "#10b981", bg: "#d1fae5" };
        if (s >= 50) return { label: "Moderately Responsible 🟡", color: "#f59e0b", bg: "#fef3c7" };
        return { label: "Needs Attention 🔴", color: "#ef4444", bg: "#fee2e2" };
    };
    const status = getStatus(score);

    // ---- FETCH ----
    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const res = await api.get(`/api/owners/${ownerId}/reports`);
                if (res.data) {
                    setMetrics({
                        notificationsReceived: res.data.notificationsReceived || 0,
                        notificationsMissed: res.data.notificationsMissed || 0,
                        clinicVisits: res.data.clinicVisits || 0,
                    });
                }
            } catch {
                setMetrics({ notificationsReceived: 0, notificationsMissed: 0, clinicVisits: 0 });
            } finally {
                setLoading(false);
            }
        };

        if (ownerId) {
            fetchReportData();
        } else {
            setMetrics({ notificationsReceived: 15, notificationsMissed: 2, clinicVisits: 4 });
            setLoading(false);
        }
    }, [ownerId]);

    // ---- LOADING ----
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
            </div>
        );
    }

    // ---- RENDER ----
    return (
        <div className={styles.container}>

            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <button type="button" className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </button>
                    <span className={styles.headerTitle}>Owner Report</span>
                    <div style={{ width: 40 }} />
                </div>
            </div>

            {/* SCROLL CONTENT */}
            <div className={styles.scrollContent}>

                {/* RESPONSIBILITY SCORE CARD */}
                <div className={styles.card}>
                    <span className={styles.cardTitle}>Responsibility Score</span>
                    <div className={styles.scoreContainer}>
                        <div className={styles.scoreCircle} style={{ borderColor: status.color }}>
                            <span className={styles.scoreValue} style={{ color: status.color }}>{score}</span>
                            <span className={styles.scoreLabel}>/100</span>
                        </div>
                        <div className={styles.statusBadge} style={{ backgroundColor: status.bg }}>
                            <span className={styles.statusText} style={{ color: status.color }}>{status.label}</span>
                        </div>
                    </div>
                </div>

                {/* METRICS CHART CARD */}
                <div className={styles.card}>
                    <span className={styles.cardTitle}>Engagement Metrics</span>
                    <span className={styles.cardSubtitle}>
                        Overview of notifications and clinic application interaction.
                    </span>
                    <MetricsChart
                        received={metrics.notificationsReceived}
                        missed={metrics.notificationsMissed}
                        visits={metrics.clinicVisits}
                    />
                </div>

                {/* BREAKDOWN SUMMARY */}
                <div className={styles.summaryContainer}>
                    <div className={styles.summaryItem}>
                        <span className={styles.dot} style={{ backgroundColor: "#4a6cf7" }} />
                        <span className={styles.summaryLabel}>Received</span>
                        <span className={styles.summaryValue}>{metrics.notificationsReceived}</span>
                    </div>
                    <div className={styles.separator} />
                    <div className={styles.summaryItem}>
                        <span className={styles.dot} style={{ backgroundColor: "#ef4444" }} />
                        <span className={styles.summaryLabel}>Missed</span>
                        <span className={styles.summaryValue}>{metrics.notificationsMissed}</span>
                    </div>
                    <div className={styles.separator} />
                    <div className={styles.summaryItem}>
                        <span className={styles.dot} style={{ backgroundColor: "#10b981" }} />
                        <span className={styles.summaryLabel}>Visits</span>
                        <span className={styles.summaryValue}>{metrics.clinicVisits}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReportScreen;