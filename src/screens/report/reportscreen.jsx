import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./reportscreen.module.css";

const API_BASE = "https://vetcare-1.onrender.com";

const DATE_FILTERS = [
    { label: "7 Days", value: "7" },
    { label: "30 Days", value: "30" },
    { label: "All", value: "0" },
];

const COLUMNS = [
    { key: "petName", label: "Pet" },
    { key: "ownerName", label: "Owner" },
    { key: "type", label: "Type" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
];

const fmt = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const toISO = (date) => new Date(date).toISOString().split("T")[0];

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 16, color = "currentColor" }) => {
    const icons = {
        "arrow-back": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>),
        search: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
        "close-circle": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>),
        "calendar-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
        calendar: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
        "arrow-forward": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>),
        "arrow-up": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>),
        "arrow-down": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>),
        "swap-vertical-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 17 23 13 19" /><polyline points="7 23 7 1 11 5" /></svg>),
        "document-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>),
        close: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
    };
    return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// SORT ICON
// =====================
const SortIcon = ({ field, sortField, ascending }) => {
    if (sortField !== field) return <Icon name="swap-vertical-outline" size={10} color="#94a3b8" />;
    return <Icon name={ascending ? "arrow-up" : "arrow-down"} size={10} color="#4A6CF7" />;
};

// =====================
// HEALTH REPORT SCREEN
// =====================
const ReportScreen = () => {
    const navigate = useNavigate();

    const [reportType, setReportType] = useState("vaccine");
    const [dateFilter, setDateFilter] = useState("7");
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("date");
    const [ascending, setAscending] = useState(false);
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [loading, setLoading] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dateModalOpen, setDateModalOpen] = useState(false);

    const hasDateRange = startDate && endDate;

    useEffect(() => {
        let cancelled = false;
        const fetchReport = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const params = new URLSearchParams({
                    category: reportType,
                    days: hasDateRange ? "0" : dateFilter,
                    search: search.trim(),
                    sortField,
                    order: ascending ? "asc" : "desc",
                    ...(startDate ? { startDate } : {}),
                    ...(endDate ? { endDate } : {}),
                });
                const res = await fetch(`${API_BASE}/api/report?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (!cancelled) {
                    setData(json.data || []);
                    setStats(json.stats || { total: 0, pending: 0, completed: 0 });
                }
            } catch (err) {
                console.log("Report fetch error:", err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchReport();
        return () => { cancelled = true; };
    }, [reportType, dateFilter, search, sortField, ascending, startDate, endDate]);

    const handleSort = (field) => {
        if (sortField === field) setAscending(p => !p);
        else { setSortField(field); setAscending(true); }
    };

    const clearDateRange = () => { setStartDate(""); setEndDate(""); };

    const headerSubLabel = hasDateRange
        ? `${fmt(startDate)} – ${fmt(endDate)}`
        : dateFilter === "0" ? "All Time" : `Last ${dateFilter} Days`;

    return (
        <div className={styles.root}>

            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerInner}>
                    <button type="button" className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
                        <Icon name="arrow-back" size={20} color="#fff" />
                    </button>
                    <div className={styles.headerCenter}>
                        <span className={styles.headerTitle}>Health Report</span>
                        <span className={styles.headerSub}>{headerSubLabel}</span>
                    </div>
                    <div style={{ width: 36 }} />
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className={styles.pageBody}>

                {/* TOGGLE */}
                <div className={styles.toggleWrap}>
                    <div className={styles.toggleContainer}>
                        {["vaccine", "deworming"].map((val) => (
                            <button
                                key={val}
                                type="button"
                                className={`${styles.toggleBtn} ${reportType === val ? styles.toggleActive : ""}`}
                                onClick={() => setReportType(val)}
                            >
                                <span className={`${styles.toggleText} ${reportType === val ? styles.toggleTextActive : ""}`}>
                                    {val === "vaccine" ? "Vaccination" : "Deworming"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* DATE FILTER CHIPS + DATE RANGE BUTTON */}
                <div className={styles.chipSection}>
                    <div className={styles.chipRow}>
                        {DATE_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                className={`${styles.chip} ${!hasDateRange && dateFilter === f.value ? styles.chipActive : ""}`}
                                onClick={() => { clearDateRange(); setDateFilter(f.value); }}
                            >
                                <span className={`${styles.chipText} ${!hasDateRange && dateFilter === f.value ? styles.chipTextActive : ""}`}>
                                    {f.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className={`${styles.dateRangeBtn} ${hasDateRange ? styles.dateRangeBtnActive : ""}`}
                        onClick={() => setDateModalOpen(true)}
                    >
                        <Icon name="calendar-outline" size={14} color={hasDateRange ? "#fff" : "#4A6CF7"} />
                        <span className={`${styles.dateRangeBtnText} ${hasDateRange ? styles.dateRangeBtnTextActive : ""}`}>
                            {hasDateRange ? "Date Set" : "Date Range"}
                        </span>
                        {hasDateRange && (
                            <button
                                type="button"
                                className={styles.clearDateInlineBtn}
                                onClick={(e) => { e.stopPropagation(); clearDateRange(); }}
                                aria-label="Clear date range"
                            >
                                <Icon name="close-circle" size={14} color="#fff" />
                            </button>
                        )}
                    </button>
                </div>

                {/* STATS */}
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <span className={styles.statNum}>{stats.total}</span>
                        <span className={styles.statLabel}>Total</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <span className={styles.statNum} style={{ color: "#d97706" }}>{stats.pending}</span>
                        <span className={styles.statLabel}>Pending</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                        <span className={styles.statNum} style={{ color: "#16a34a" }}>{stats.completed}</span>
                        <span className={styles.statLabel}>Completed</span>
                    </div>
                </div>

                {/* SEARCH */}
                <div className={styles.controls}>
                    <div className={styles.searchBox}>
                        <Icon name="search" size={16} color="#94a3b8" />
                        <input
                            className={styles.searchInput}
                            type="text"
                            placeholder={`Search pet, owner or ${reportType === "vaccine" ? "vaccine" : "deworming"} name...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search.length > 0 && (
                            <button type="button" className={styles.clearSearchBtn} onClick={() => setSearch("")}>
                                <Icon name="close-circle" size={16} color="#94a3b8" />
                            </button>
                        )}
                    </div>
                </div>

                {/* TABLE */}
                <div className={styles.tableWrap}>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.tableHead}>
                                    {COLUMNS.map(({ key, label }) => (
                                        <th key={key} className={styles.th} onClick={() => handleSort(key)}>
                                            <span className={styles.thInner}>
                                                {label}
                                                <SortIcon field={key} sortField={sortField} ascending={ascending} />
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {!loading && data.map((item, index) => (
                                    <tr
                                        key={item.id?.toString() || index}
                                        className={`${styles.tableRow} ${index % 2 === 0 ? styles.rowEven : styles.rowOdd}`}
                                        onClick={() => navigate(`/animal/${item.animalId}`)}
                                    >
                                        <td className={styles.cell}>{item.petName}</td>
                                        <td className={styles.cell}>{item.ownerName}</td>
                                        <td className={`${styles.cell} ${styles.typeCell}`}>{item.type}</td>
                                        <td className={`${styles.cell} ${styles.dateCell}`}>{fmt(item.date)}</td>
                                        <td className={styles.cell}>
                                            <span className={`${styles.statusBadge} ${item.status === "pending" ? styles.badgePending : styles.badgeCompleted}`}>
                                                <span className={item.status === "pending" ? styles.statusPending : styles.statusCompleted}>
                                                    {item.status === "pending" ? "Pending" : "Done"}
                                                </span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className={styles.loaderContainer}>
                            <div className={styles.spinner} />
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading && data.length === 0 && (
                        <div className={styles.emptyContainer}>
                            <Icon name="document-outline" size={40} color="#c7d2fe" />
                            <span className={styles.emptyText}>No records found</span>
                        </div>
                    )}

                    {/* FOOTER ROW */}
                    {data.length > 0 && (
                        <div className={styles.footerRow}>
                            <span className={styles.footerLabel}>Total</span>
                            <div className={styles.footerStats}>
                                <div className={styles.footerStat}>
                                    <span className={styles.footerStatNum}>{stats.total}</span>
                                    <span className={styles.footerStatLabel}>Records</span>
                                </div>
                                <div className={styles.footerDivider} />
                                <div className={styles.footerStat}>
                                    <span className={styles.footerStatNum} style={{ color: "#d97706" }}>{stats.pending}</span>
                                    <span className={styles.footerStatLabel}>Pending</span>
                                </div>
                                <div className={styles.footerDivider} />
                                <div className={styles.footerStat}>
                                    <span className={styles.footerStatNum} style={{ color: "#16a34a" }}>{stats.completed}</span>
                                    <span className={styles.footerStatLabel}>Done</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* DATE RANGE MODAL */}
            {dateModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setDateModalOpen(false)}>
                    <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <Icon name="calendar" size={18} color="#4A6CF7" />
                            <span className={styles.modalTitle}>Select Date Range</span>
                            <button type="button" className={styles.modalCloseBtn} onClick={() => setDateModalOpen(false)}>
                                <Icon name="close" size={22} color="#64748b" />
                            </button>
                        </div>

                        <div className={styles.datePickerRow}>
                            <div className={styles.datePickerCol}>
                                <label className={styles.datePickerLabel}>From</label>
                                <div className={styles.datePickerInputWrap}>
                                    <Icon name="calendar-outline" size={16} color="#4A6CF7" />
                                    <input
                                        type="date"
                                        className={styles.datePickerInput}
                                        value={startDate}
                                        max={endDate || undefined}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.datePickerArrow}>
                                <Icon name="arrow-forward" size={18} color="#94a3b8" />
                            </div>

                            <div className={styles.datePickerCol}>
                                <label className={styles.datePickerLabel}>To</label>
                                <div className={styles.datePickerInputWrap}>
                                    <Icon name="calendar-outline" size={16} color="#4A6CF7" />
                                    <input
                                        type="date"
                                        className={styles.datePickerInput}
                                        value={endDate}
                                        min={startDate || undefined}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.clearBtn}
                                onClick={() => { clearDateRange(); setDateModalOpen(false); }}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                className={`${styles.applyBtn} ${(!startDate || !endDate) ? styles.applyBtnDisabled : ""}`}
                                disabled={!startDate || !endDate}
                                onClick={() => setDateModalOpen(false)}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportScreen;