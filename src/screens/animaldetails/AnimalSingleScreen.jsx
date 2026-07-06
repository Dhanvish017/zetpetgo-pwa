import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import styles from "./AnimalSingleScreen.module.css";

// =====================
// CONSTANTS
// =====================
const VACCINE_OPTIONS = {
    dog: ["DHPPi+RL", "DHPPi+L", "Puppy DP", "Antirabies", "Custom"],
    cat: ["FVRCP", "FVRCP+Rabies", "Anti-rabies", "Custom"],
};
const DEWORMING_OPTIONS = ["Pyrantel Pamoate", "Fenbendazole", "Ivermectin Oral", "Custom"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// =====================
// HELPERS
// =====================
function formatDate(date) {
    if (!date) return "—";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function getDayName(date) {
    if (!date) return "—";
    return DAY_NAMES[new Date(date).getDay()];
}
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function toISODate(date) {
    return new Date(date).toISOString().split("T")[0];
}
function calcAge(dob) {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    const totalMonths = years * 12 + months;
    if (totalDays < 30) return `${totalDays} day${totalDays !== 1 ? "s" : ""}`;
    if (totalMonths < 12) return `${totalMonths} mo${totalMonths !== 1 ? "s" : ""}`;
    if (months === 0) return `${years} yr${years !== 1 ? "s" : ""}`;
    return `${years} yr${years !== 1 ? "s" : ""} ${months} mo${months !== 1 ? "s" : ""}`;
}

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
    const icons = {
        "arrow-back": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>),
        "trash-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>),
        paw: (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><ellipse cx="6" cy="7" rx="2" ry="3" /><ellipse cx="12" cy="5" rx="2" ry="3" /><ellipse cx="18" cy="7" rx="2" ry="3" /><ellipse cx="9" cy="12" rx="2" ry="2.5" /><path d="M12 11c1.5 0 6 3 6 7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3c0-4 4.5-7 6-7z" /></svg>),
        ribbon: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>),
        calendar: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
        "male-female": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="4" /><path d="M13 9h8m-4-4 4 4-4 4" /><path d="M15 19v-4M13 17h4" /></svg>),
        "shield-checkmark": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>),
        "shield-checkmark-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>),
        medkit: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>),
        "leaf-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.34L5.71 21M12 12l-1.5 1.5" /><path d="M21 3c-5 0-10 2-13 8 1 2 2.5 3.5 4 4 0-4 2-6 9-12z" /></svg>),
        checkmark: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
        "pencil-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>),
        "add-circle-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>),
        "alert-circle-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>),
        close: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
        "chevron-down": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>),
        "checkmark-circle": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
        "checkmark-circle-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
        "create-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>),
    };
    return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// STAT CHIP
// =====================
const StatChip = ({ icon, label, value, color }) => (
    <div className={styles.statChip}>
        <div className={styles.statIconContainer} style={{ backgroundColor: color }}>
            <Icon name={icon} size={18} color="#fff" />
        </div>
        <div>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{value || "N/A"}</span>
        </div>
    </div>
);

// =====================
// EDIT MODAL
// =====================
const EditModal = ({ visible, onClose, editingRow, editDate, setEditDate, editVaccineName, setEditVaccineName, editDewormingName, setEditDewormingName, editCustomName, setEditCustomName, vaccineOptions, onSave }) => {
    const [namePickerVisible, setNamePickerVisible] = useState(false);

    useEffect(() => {
        if (!visible) setNamePickerVisible(false);
    }, [visible]);

    if (!visible) return null;

    const options = editingRow?.type === "vaccine" ? vaccineOptions : DEWORMING_OPTIONS;
    const currentName = editingRow?.type === "vaccine" ? editVaccineName : editDewormingName;
    const isCustom = currentName === "Custom";

    return (
        <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={styles.modalBox}>
                <div className={styles.modalHeader}>
                    <Icon name={editingRow?.type === "vaccine" ? "shield-checkmark" : "medkit"} size={18} color="#4A6CF7" />
                    <span className={styles.modalTitle}>Edit {editingRow?.type === "vaccine" ? "Vaccine" : "Deworming"} Row</span>
                    <button type="button" className={styles.modalCloseBtn} onClick={onClose}>
                        <Icon name="close" size={22} color="#64748b" />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <label className={styles.fieldLabel}>Due Date</label>
                    <input
                        className={styles.modalInput}
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                    />
                    <span className={styles.fieldHint}>⚠️ Changing the date will reschedule all following rows automatically.</span>

                    <label className={styles.fieldLabel} style={{ marginTop: 16 }}>
                        {editingRow?.type === "vaccine" ? "Vaccine Name" : "Deworming Name"}
                    </label>

                    {isCustom ? (
                        <input
                            className={styles.modalInput}
                            value={editCustomName}
                            onChange={(e) => setEditCustomName(e.target.value)}
                            placeholder={`Type ${editingRow?.type === "vaccine" ? "vaccine" : "deworming"} name...`}
                        />
                    ) : (
                        <button type="button" className={styles.modalDropdown} onClick={() => setNamePickerVisible(true)}>
                            <span className={currentName ? styles.modalDropdownValue : styles.modalDropdownPlaceholder}>
                                {currentName || `Select ${editingRow?.type === "vaccine" ? "vaccine" : "deworming"}...`}
                            </span>
                            <Icon name="chevron-down" size={16} color="#64748b" />
                        </button>
                    )}
                </div>

                <button type="button" className={styles.modalSaveBtn} onClick={onSave}>
                    <span className={styles.modalSaveBtnText}>Save Changes</span>
                    <Icon name="checkmark-circle" size={18} color="#fff" />
                </button>
            </div>

            {/* Name Picker */}
            {namePickerVisible && (
                <div className={styles.pickerOverlay} onClick={() => setNamePickerVisible(false)}>
                    <div className={styles.pickerBox} onClick={(e) => e.stopPropagation()}>
                        <span className={styles.pickerTitle}>
                            {editingRow?.type === "vaccine" ? "Select Vaccine" : "Select Deworming"}
                        </span>
                        {options.map((item) => (
                            <button
                                key={item}
                                type="button"
                                className={styles.pickerItem}
                                onClick={() => {
                                    if (editingRow?.type === "vaccine") setEditVaccineName(item);
                                    else setEditDewormingName(item);
                                    setNamePickerVisible(false);
                                }}
                            >
                                <Icon name={item === "Custom" ? "create-outline" : "checkmark-circle-outline"} size={16} color="#4A6CF7" />
                                <span className={styles.pickerItemText}>{item}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// =====================
// MAIN SCREEN
// =====================
const AnimalSingleScreen = () => {
    const navigate = useNavigate();
    const { animalId } = useParams();
    const id = animalId;

    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("vaccine");
    const [vaccineSchedule, setVaccineSchedule] = useState([]);
    const [dewormingSchedule, setDewormingSchedule] = useState([]);
    const [fadeIn, setFadeIn] = useState(false);

    // Edit modal state
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editVaccineName, setEditVaccineName] = useState("");
    const [editDewormingName, setEditDewormingName] = useState("");
    const [editCustomName, setEditCustomName] = useState("");

    // ---- FETCH ----
    useEffect(() => {
        if (!id) { setError("No animal ID provided"); setLoading(false); return; }
        const fetch = async () => {
            try {
                const [animalRes, scheduleRes] = await Promise.all([
                    api.get(`/api/animals/${id}`),
                    api.get(`/api/animal-schedule/${id}`),
                ]);
                setAnimal(animalRes.data);
                setVaccineSchedule(scheduleRes.data.vaccineSchedule || []);
                setDewormingSchedule(scheduleRes.data.dewormingSchedule || []);
                setTimeout(() => setFadeIn(true), 50);
            } catch (err) {
                setError("Failed to load animal details");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    // ---- SAVE SCHEDULE ----
    const saveSchedule = useCallback(async (vSchedule, dSchedule) => {
        try {
            setSaving(true);
            await api.put(
                `/api/animal-schedule/${id}`,
                { vaccineSchedule: vSchedule, dewormingSchedule: dSchedule }
            );
        } catch {
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    }, [id]);

    // ---- DELETE ----
    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${animal?.name || "this animal"}?`)) return;
        try {
            setDeleting(true);
            await api.delete(`/api/animal-schedule/${id}`);
            alert("Animal removed.");
            navigate(-1);
        } catch {
            alert("Failed to delete animal");
            setDeleting(false);
        }
    };

    // ---- TOGGLE COMPLETED ----
    const toggleCompleted = async (type, index) => {
        const schedule = type === "vaccine" ? [...vaccineSchedule] : [...dewormingSchedule];
        const row = schedule[index];
        const newStatus = row.status === "completed" ? "pending" : "completed";
        schedule[index] = { ...row, status: newStatus };
        if (type === "vaccine") setVaccineSchedule(schedule);
        else setDewormingSchedule(schedule);
        await saveSchedule(
            type === "vaccine" ? schedule : vaccineSchedule,
            type === "deworming" ? schedule : dewormingSchedule
        );
        if (newStatus === "completed") {
            alert(`✅ ${type === "vaccine" ? (row.vaccineName || "Vaccine") : (row.dewormingName || "Deworming")} marked as completed!`);
        }
    };

    // ---- OPEN EDIT MODAL ----
    const openEditModal = (type, index) => {
        const row = type === "vaccine" ? vaccineSchedule[index] : dewormingSchedule[index];
        setEditingRow({ type, index });
        setEditDate(row.dueDate ? toISODate(row.dueDate) : "");
        setEditVaccineName(row.vaccineName || "");
        setEditDewormingName(row.dewormingName || "");
        setEditCustomName("");
        setEditModalVisible(true);
    };

    // ---- SAVE EDIT ----
    const saveEdit = async () => {
        if (!editingRow) return;
        const { type, index } = editingRow;

        if (type === "vaccine") {
            const updated = [...vaccineSchedule];
            const row = updated[index];
            const finalName = editVaccineName === "Custom" ? (editCustomName || row.vaccineName) : (editVaccineName || row.vaccineName);
            updated[index] = { ...row, vaccineName: finalName, dueDate: editDate || row.dueDate };
            if (editDate && editDate !== toISODate(row.dueDate)) {
                let baseDate = new Date(editDate);
                for (let i = index + 1; i < updated.length; i++) {
                    baseDate = addDays(baseDate, updated[i].interval || 0);
                    updated[i] = { ...updated[i], dueDate: toISODate(baseDate) };
                }
            }
            setVaccineSchedule(updated);
            setEditModalVisible(false);
            await saveSchedule(updated, dewormingSchedule);
        } else {
            const updated = [...dewormingSchedule];
            const row = updated[index];
            const finalName = editDewormingName === "Custom" ? (editCustomName || row.dewormingName) : (editDewormingName || row.dewormingName);
            updated[index] = { ...row, dewormingName: finalName, dueDate: editDate || row.dueDate };
            if (editDate && editDate !== toISODate(row.dueDate)) {
                let baseDate = new Date(editDate);
                for (let i = index + 1; i < updated.length; i++) {
                    baseDate = addDays(baseDate, updated[i].interval || 0);
                    updated[i] = { ...updated[i], dueDate: toISODate(baseDate) };
                }
            }
            setDewormingSchedule(updated);
            setEditModalVisible(false);
            await saveSchedule(vaccineSchedule, updated);
        }
    };

    // ---- ADD ROW ----
    const handleAddRow = async () => {
        if (activeTab === "vaccine" && vaccineSchedule.length > 0) {
            const updated = [...vaccineSchedule];
            const lastRow = updated[updated.length - 1];
            updated.splice(updated.length - 1, 0, { stage: "Custom", vaccineName: "", dueDate: lastRow.dueDate || toISODate(new Date()), interval: 0, status: "pending" });
            setVaccineSchedule(updated);
            await saveSchedule(updated, dewormingSchedule);
        } else if (activeTab === "deworming" && dewormingSchedule.length > 0) {
            const updated = [...dewormingSchedule];
            const lastRow = updated[updated.length - 1];
            updated.splice(updated.length - 1, 0, { dewormingName: "", dueDate: lastRow.dueDate || toISODate(new Date()), interval: 0, status: "pending" });
            setDewormingSchedule(updated);
            await saveSchedule(vaccineSchedule, updated);
        }
    };

    const vaccineOptions = animal?.species ? VACCINE_OPTIONS[animal.species] || [] : [];
    const showAddRow = (activeTab === "vaccine" && vaccineSchedule.length > 0) || (activeTab === "deworming" && dewormingSchedule.length > 0);

    // ---- LOADING ----
    if (loading) return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
        </div>
    );

    // ---- ERROR ----
    if (error || !animal) return (
        <div className={styles.centeredContainer}>
            <Icon name="alert-circle-outline" size={64} color="#dc2626" />
            <span className={styles.errorText}>{error || "Animal not found"}</span>
            <button type="button" className={styles.backButtonSimple} onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );

    // ---- RENDER ----
    return (
        <div className={styles.container}>

            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerTopRow}>
                    <button type="button" className={styles.iconButton} onClick={() => navigate(-1)} aria-label="Go back">
                        <Icon name="arrow-back" size={22} color="#fff" />
                    </button>
                    {saving && <div className={styles.savingSpinner} />}
                    <button
                        type="button"
                        className={`${styles.iconButton} ${styles.deleteBtn}`}
                        onClick={handleDelete}
                        disabled={deleting}
                        aria-label="Delete animal"
                    >
                        <Icon name="trash-outline" size={20} color="#fff" />
                    </button>
                </div>

                <div className={styles.headerContent}>
                    <div className={styles.avatarContainer}>
                        <span className={styles.avatarText}>{animal.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className={styles.animalName}>{animal.name}</span>
                    <div className={styles.activeBadge}>
                        <span className={styles.activeDot} />
                        <span className={styles.activeText}>Active Profile</span>
                    </div>
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className={`${styles.scrollContent} ${fadeIn ? styles.fadeIn : ""}`}>

                {/* STAT CHIPS */}
                <div className={styles.statsGrid}>
                    <StatChip icon="paw" label="Species" value={animal.species} color="#4A6CF7" />
                    <StatChip icon="ribbon" label="Breed" value={animal.breed} color="#F59E0B" />
                    <StatChip icon="calendar" label="Age" value={calcAge(animal.dob) || (animal.age ? `${animal.age} yrs` : null)} color="#10B981" />
                    <StatChip icon="male-female" label="Gender" value={animal.gender} color="#EC4899" />
                </div>

                {/* TAB BAR */}
                <div className={styles.tabBar}>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === "vaccine" ? styles.tabBtnActive : ""}`}
                        onClick={() => setActiveTab("vaccine")}
                    >
                        <Icon name="shield-checkmark" size={15} color={activeTab === "vaccine" ? "#4A6CF7" : "#94a3b8"} />
                        <span className={`${styles.tabText} ${activeTab === "vaccine" ? styles.tabTextActive : ""}`}>Vaccine Schedule</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === "deworming" ? styles.tabBtnActive : ""}`}
                        onClick={() => setActiveTab("deworming")}
                    >
                        <Icon name="medkit" size={15} color={activeTab === "deworming" ? "#4A6CF7" : "#94a3b8"} />
                        <span className={`${styles.tabText} ${activeTab === "deworming" ? styles.tabTextActive : ""}`}>Deworming Schedule</span>
                    </button>
                </div>

                {/* VACCINE TABLE */}
                {activeTab === "vaccine" && (
                    <div className={styles.tableCard}>
                        {vaccineSchedule.length === 0 ? (
                            <div className={styles.emptyState} onClick={() => navigate("/addactivity", { state: { animalId: id, species: animal.species } })}>
                                <Icon name="shield-checkmark-outline" size={36} color="#c7d2fe" />
                                <span className={styles.emptyText}>No vaccine schedule yet</span>
                                <span className={`${styles.emptySubText} ${styles.emptySubTextLink}`}>Tap to create schedule →</span>
                            </div>
                        ) : (
                            <div className={styles.tableScroll}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr className={styles.tableHeader}>
                                            <th className={styles.th} style={{ width: 44 }}></th>
                                            <th className={styles.th} style={{ width: 80 }}>Stage</th>
                                            <th className={styles.th} style={{ width: 100 }}>Date</th>
                                            <th className={styles.th} style={{ width: 64 }}>Day</th>
                                            <th className={styles.th} style={{ width: 140 }}>Vaccine</th>
                                            <th className={styles.th} style={{ width: 80 }}>Status</th>
                                            <th className={styles.th} style={{ width: 44 }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vaccineSchedule.map((row, index) => {
                                            const isCompleted = row.status === "completed";
                                            const isMissed = row.status === "missed";
                                            return (
                                                <tr key={index} className={`${styles.tableRow} ${index % 2 === 0 ? styles.rowEven : styles.rowOdd} ${isCompleted ? styles.rowCompleted : ""}`}>
                                                    <td className={styles.td}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.checkbox} ${isCompleted ? styles.checkboxChecked : ""}`}
                                                            onClick={() => toggleCompleted("vaccine", index)}
                                                        >
                                                            {isCompleted && <Icon name="checkmark" size={12} color="#fff" />}
                                                        </button>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.stagePill}>{row.stage || "—"}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={`${styles.cellText} ${isCompleted ? styles.completedText : ""}`}>{formatDate(row.dueDate)}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.dayBadge}>{getDayName(row.dueDate)}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={`${styles.cellText} ${isCompleted ? styles.completedText : ""}`}>{row.vaccineName || "—"}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={`${styles.statusBadge} ${isCompleted ? styles.statusCompleted : isMissed ? styles.statusMissed : styles.statusPending}`}>
                                                            {isCompleted ? "Done" : isMissed ? "Missed" : "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <button type="button" className={styles.editBtn} onClick={() => openEditModal("vaccine", index)}>
                                                            <Icon name="pencil-outline" size={14} color="#4A6CF7" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* DEWORMING TABLE */}
                {activeTab === "deworming" && (
                    <div className={styles.tableCard}>
                        {dewormingSchedule.length === 0 ? (
                            <div className={styles.emptyState} onClick={() => navigate("/addactivity", { state: { animalId: id, species: animal.species, initialTab: "deworming" } })}>
                                <Icon name="leaf-outline" size={36} color="#86efac" />
                                <span className={`${styles.emptyText} ${styles.emptyTextGreen}`}>No deworming schedule yet</span>
                                <span className={`${styles.emptySubText} ${styles.emptySubTextLink}`}>Tap to create schedule →</span>
                            </div>
                        ) : (
                            <div className={styles.tableScroll}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr className={`${styles.tableHeader} ${styles.tableHeaderGreen}`}>
                                            <th className={`${styles.th} ${styles.thGreen}`} style={{ width: 44 }}></th>
                                            <th className={`${styles.th} ${styles.thGreen}`} style={{ width: 100 }}>Date</th>
                                            <th className={`${styles.th} ${styles.thGreen}`} style={{ width: 64 }}>Day</th>
                                            <th className={`${styles.th} ${styles.thGreen}`} style={{ width: 140 }}>Deworming</th>
                                            <th className={`${styles.th} ${styles.thGreen}`} style={{ width: 80 }}>Status</th>
                                            <th className={`${styles.th} ${styles.thGreen}`} style={{ width: 44 }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dewormingSchedule.map((row, index) => {
                                            const isCompleted = row.status === "completed";
                                            const isMissed = row.status === "missed";
                                            return (
                                                <tr key={index} className={`${styles.tableRow} ${index % 2 === 0 ? styles.rowEven : styles.rowOdd} ${isCompleted ? styles.rowCompleted : ""}`}>
                                                    <td className={styles.td}>
                                                        <button
                                                            type="button"
                                                            className={`${styles.checkbox} ${styles.checkboxGreen} ${isCompleted ? styles.checkboxCheckedGreen : ""}`}
                                                            onClick={() => toggleCompleted("deworming", index)}
                                                        >
                                                            {isCompleted && <Icon name="checkmark" size={12} color="#fff" />}
                                                        </button>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={`${styles.cellText} ${isCompleted ? styles.completedText : ""}`}>{formatDate(row.dueDate)}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={`${styles.dayBadge} ${styles.dayBadgeGreen}`}>{getDayName(row.dueDate)}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={`${styles.cellText} ${isCompleted ? styles.completedText : ""}`}>{row.dewormingName || "—"}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={`${styles.statusBadge} ${isCompleted ? styles.statusCompleted : isMissed ? styles.statusMissed : styles.statusPending}`}>
                                                            {isCompleted ? "Done" : isMissed ? "Missed" : "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <button type="button" className={`${styles.editBtn} ${styles.editBtnGreen}`} onClick={() => openEditModal("deworming", index)}>
                                                            <Icon name="pencil-outline" size={14} color="#10b981" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ height: 80 }} />
            </div>

            {/* ADD ROW BUTTON */}
            {showAddRow && (
                <button type="button" className={styles.addRowBtn} onClick={handleAddRow}>
                    <Icon name="add-circle-outline" size={16} color="#4A6CF7" />
                    <span className={styles.addRowBtnText}>Add Row</span>
                </button>
            )}

            {/* EDIT MODAL */}
            <EditModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                editingRow={editingRow}
                editDate={editDate}
                setEditDate={setEditDate}
                editVaccineName={editVaccineName}
                setEditVaccineName={setEditVaccineName}
                editDewormingName={editDewormingName}
                setEditDewormingName={setEditDewormingName}
                editCustomName={editCustomName}
                setEditCustomName={setEditCustomName}
                vaccineOptions={vaccineOptions}
                onSave={saveEdit}
            />
        </div>
    );
};

export default AnimalSingleScreen;