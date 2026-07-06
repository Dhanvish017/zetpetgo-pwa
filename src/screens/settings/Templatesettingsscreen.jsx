import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import styles from "./Templatesettingsscreen.module.css";

const VACCINE_STAGES = ["1st", "2nd", "3rd", "4th", "Annual"];
const PREFILLED_STAGES = ["1st", "2nd", "3rd", "4th", "Annual"];

const VACCINE_OPTIONS = {
    dog: ["DHPPi+RL", "DHPPi+L", "Puppy DP", "Antirabies", "Custom"],
    cat: ["FVRCP", "FVRCP+Rabies", "Anti-rabies", "Custom"],
};
const DEWORMING_OPTIONS = ["Pyrantel Pamoate", "Fenbendazole", "Ivermectin Oral", "Custom"];

const STEPS = [
    { key: "dog-vaccine", label: "Dog Vaccine", species: "dog", type: "vaccine" },
    { key: "dog-deworming", label: "Dog Deworming", species: "dog", type: "deworming" },
    { key: "cat-vaccine", label: "Cat Vaccine", species: "cat", type: "vaccine" },
    { key: "cat-deworming", label: "Cat Deworming", species: "cat", type: "deworming" },
];

const STEP_COLORS = {
    "dog-vaccine": "#4A6CF7",
    "dog-deworming": "#10b981",
    "cat-vaccine": "#f59e0b",
    "cat-deworming": "#ec4899",
};

const makeDefaultVaccine = () => VACCINE_STAGES.map((stage, i) => ({ stage, interval: i === 0 ? "0" : "", vaccineName: "", customName: "" }));
const makeDefaultDeworming = () => [
    { interval: "0", dewormingName: "", customName: "" },
    { interval: "", dewormingName: "", customName: "" },
    { interval: "", dewormingName: "", customName: "" },
    { interval: "", dewormingName: "", customName: "" },
];

const DEFAULT_TEMPLATE = {
    dog: { vaccine: makeDefaultVaccine(), deworming: makeDefaultDeworming() },
    cat: { vaccine: makeDefaultVaccine(), deworming: makeDefaultDeworming() },
};

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 18, color = "currentColor" }) => {
    const icons = {
        "arrow-back": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>),
        "arrow-forward": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>),
        checkmark: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>),
        "checkmark-circle": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
        "trash-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>),
        "add-circle-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>),
        "chevron-down": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>),
        "lock-closed": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
        "shield-checkmark": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>),
        "medkit-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>),
        "checkmark-circle-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>),
        "create-outline": (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>),
        close: (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
    };
    return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// TEMPLATE SETTINGS SCREEN
// =====================
const TemplateSettingsScreen = () => {
    const navigate = useNavigate();

    const [stepIndex, setStepIndex] = useState(0);
    const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [activeRowIndex, setActiveRowIndex] = useState(null);

    const currentStep = STEPS[stepIndex];
    const { species, type } = currentStep;
    const isLastStep = stepIndex === STEPS.length - 1;
    const accentColor = STEP_COLORS[currentStep.key];

    // ---- LOAD ----
    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get("/api/template");
                if (res.data.scheduleTemplate) {
                    const saved = res.data.scheduleTemplate;
                    setTemplate({
                        dog: {
                            vaccine: saved.dog?.vaccine?.length ? saved.dog.vaccine.map((r, i) => ({ ...r, interval: i === 0 ? "0" : String(r.interval || ""), customName: "" })) : makeDefaultVaccine(),
                            deworming: saved.dog?.deworming?.length ? saved.dog.deworming.map((r, i) => ({ ...r, interval: i === 0 ? "0" : String(r.interval || ""), customName: "" })) : makeDefaultDeworming(),
                        },
                        cat: {
                            vaccine: saved.cat?.vaccine?.length ? saved.cat.vaccine.map((r, i) => ({ ...r, interval: i === 0 ? "0" : String(r.interval || ""), customName: "" })) : makeDefaultVaccine(),
                            deworming: saved.cat?.deworming?.length ? saved.cat.deworming.map((r, i) => ({ ...r, interval: i === 0 ? "0" : String(r.interval || ""), customName: "" })) : makeDefaultDeworming(),
                        },
                    });
                }
            } catch (e) {
                console.log("Load template error:", e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ---- UPDATE ROW ----
    const updateRow = (index, field, value) => {
        setTemplate(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            updated[species][type][index][field] = value;
            return updated;
        });
    };

    // ---- ADD ROW ----
    const addRow = () => {
        setTemplate(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const rows = updated[species][type];
            if (type === "vaccine") {
                const annualIndex = rows.findIndex(r => r.stage === "Annual");
                const newRow = { stage: "Custom", interval: "", vaccineName: "", customName: "" };
                if (annualIndex === -1) rows.push(newRow);
                else rows.splice(annualIndex, 0, newRow);
            } else {
                rows.push({ interval: "", dewormingName: "", customName: "" });
            }
            return updated;
        });
    };

    // ---- REMOVE ROW ----
    const removeRow = (index) => {
        setTemplate(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const rows = updated[species][type];
            if (rows.length <= 1) return prev;
            rows.splice(index, 1);
            return updated;
        });
    };

    // ---- NAME PICKER ----
    const openNamePicker = (index) => { setActiveRowIndex(index); setNameModalVisible(true); };
    const selectName = (name) => {
        const idx = activeRowIndex;
        const field = type === "vaccine" ? "vaccineName" : "dewormingName";
        setNameModalVisible(false);
        updateRow(idx, field, name);
        if (name !== "Custom") updateRow(idx, "customName", "");
    };

    // ---- NEXT / BACK ----
    const handleNext = () => { if (isLastStep) handleSave(); else setStepIndex(p => p + 1); };
    const handleBack = () => { if (stepIndex === 0) navigate(-1); else setStepIndex(p => p - 1); };

    // ---- SAVE ----
    const handleSave = async () => {
        try {
            setSaving(true);
            const serialize = (rows, t) => rows.map(r => ({
                ...(t === "vaccine"
                    ? { stage: r.stage, vaccineName: r.vaccineName === "Custom" ? (r.customName || "") : r.vaccineName }
                    : { dewormingName: r.dewormingName === "Custom" ? (r.customName || "") : r.dewormingName }
                ),
                interval: parseInt(r.interval, 10) || 0,
            }));
            const payload = {
                dog: { vaccine: serialize(template.dog.vaccine, "vaccine"), deworming: serialize(template.dog.deworming, "deworming") },
                cat: { vaccine: serialize(template.cat.vaccine, "vaccine"), deworming: serialize(template.cat.deworming, "deworming") },
            };
            await api.put("/api/template", { scheduleTemplate: payload });
            alert("Template saved successfully!");
            navigate(-1);
        } catch (err) {
            console.error("SAVE TEMPLATE ERROR:", err.message);
            alert("Failed to save template.");
        } finally {
            setSaving(false);
        }
    };

    const currentRows = template[species][type];
    const nameOptions = type === "vaccine" ? (VACCINE_OPTIONS[species] || []) : DEWORMING_OPTIONS;

    // ---- LOADING ----
    if (loading) {
        return (
            <div className={styles.loadingContainer} style={{ backgroundColor: "#4A6CF7" }}>
                <div className={styles.spinner} style={{ borderTopColor: "#fff" }} />
            </div>
        );
    }

    return (
        <div className={styles.root} style={{ "--accent": accentColor }}>

            {/* HEADER */}
            <div className={styles.header} style={{ backgroundColor: accentColor }}>
                <div className={styles.headerInner}>
                    <button type="button" className={styles.backBtn} onClick={handleBack} aria-label="Go back">
                        <Icon name="arrow-back" size={22} color="#fff" />
                    </button>
                    <div className={styles.headerCenter}>
                        <span className={styles.headerTitle}>{currentStep.label}</span>
                        <span className={styles.headerSub}>Step {stepIndex + 1} of {STEPS.length}</span>
                    </div>
                    <div style={{ width: 36 }} />
                </div>
            </div>

            {/* PROGRESS DOTS */}
            <div className={styles.dotsRow} style={{ backgroundColor: `${accentColor}cc` }}>
                {STEPS.map((s, i) => (
                    <div
                        key={s.key}
                        className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ""} ${i < stepIndex ? styles.dotDone : ""}`}
                    >
                        {i < stepIndex && <Icon name="checkmark" size={10} color="#fff" />}
                    </div>
                ))}
            </div>

            {/* TABLE BODY */}
            <div className={styles.body}>
                <div className={styles.tableWrap}>

                    {/* Table Header */}
                    <div className={styles.tableHeader}>
                        {type === "vaccine" && <span className={`${styles.th} ${styles.thStage}`}>Stage</span>}
                        <span className={`${styles.th} ${styles.thName}`}>{type === "vaccine" ? "Vaccine Name" : "Deworming Name"}</span>
                        <span className={`${styles.th} ${styles.thInterval}`}>Interval (Days)</span>
                        <span className={`${styles.th} ${styles.thDelete}`}></span>
                    </div>

                    {/* Rows */}
                    {currentRows.map((row, index) => {
                        const nameValue = type === "vaccine" ? row.vaccineName : row.dewormingName;
                        const isCustom = nameValue === "Custom";

                        return (
                            <div
                                key={index}
                                className={`${styles.tableRow} ${index % 2 === 0 ? styles.rowEven : styles.rowOdd}`}
                            >
                                {/* Stage */}
                                {type === "vaccine" && (
                                    <div className={`${styles.td} ${styles.tdStage}`}>
                                        <span
                                            className={styles.stagePill}
                                            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                                        >
                                            {row.stage}
                                        </span>
                                    </div>
                                )}

                                {/* Name */}
                                <div className={`${styles.td} ${styles.tdName}`}>
                                    {isCustom ? (
                                        <input
                                            className={styles.cellInput}
                                            type="text"
                                            placeholder="Type name..."
                                            value={row.customName || ""}
                                            onChange={(e) => updateRow(index, "customName", e.target.value)}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.cellDropdown}
                                            style={nameValue ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : {}}
                                            onClick={() => openNamePicker(index)}
                                        >
                                            <span
                                                className={styles.cellDropdownText}
                                                style={nameValue ? { color: accentColor, fontWeight: 600 } : { color: "#94a3b8" }}
                                            >
                                                {nameValue || "Select..."}
                                            </span>
                                            <Icon name="chevron-down" size={12} color={nameValue ? accentColor : "#94a3b8"} />
                                        </button>
                                    )}
                                </div>

                                {/* Interval */}
                                <div className={`${styles.td} ${styles.tdInterval}`}>
                                    {index === 0 ? (
                                        <div className={styles.lockedInterval}>
                                            <span className={styles.lockedIntervalText}>0</span>
                                            <Icon name="lock-closed" size={10} color="#94a3b8" />
                                        </div>
                                    ) : (
                                        <input
                                            className={styles.cellInput}
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={row.interval}
                                            onChange={(e) => updateRow(index, "interval", e.target.value.replace(/[^0-9]/g, ""))}
                                        />
                                    )}
                                </div>

                                {/* Delete */}
                                <div className={`${styles.td} ${styles.tdDelete}`}>
                                    <button type="button" className={styles.deleteBtn} onClick={() => removeRow(index)} aria-label="Delete row">
                                        <Icon name="trash-outline" size={14} color="#ef4444" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Row */}
                    <button
                        type="button"
                        className={styles.addRowBtn}
                        style={{ borderColor: accentColor }}
                        onClick={addRow}
                    >
                        <Icon name="add-circle-outline" size={18} color={accentColor} />
                        <span style={{ color: accentColor }} className={styles.addRowText}>Add Row</span>
                    </button>
                </div>
            </div>

            {/* FOOTER */}
            <div className={styles.footer}>
                <button
                    type="button"
                    className={`${styles.nextBtn} ${saving ? styles.nextBtnSaving : ""}`}
                    style={{ backgroundColor: accentColor }}
                    onClick={handleNext}
                    disabled={saving}
                >
                    {saving ? (
                        <div className={styles.spinnerSmall} />
                    ) : (
                        <>
                            <span className={styles.nextBtnText}>
                                {isLastStep ? "Save All Templates" : `Next: ${STEPS[stepIndex + 1].label}`}
                            </span>
                            <Icon name={isLastStep ? "checkmark-circle" : "arrow-forward"} size={20} color="#fff" />
                        </>
                    )}
                </button>
            </div>

            {/* NAME PICKER MODAL */}
            {nameModalVisible && (
                <div className={styles.modalOverlay} onClick={() => setNameModalVisible(false)}>
                    <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader} style={{ backgroundColor: `${accentColor}18` }}>
                            <Icon name={type === "vaccine" ? "shield-checkmark" : "medkit-outline"} size={17} color={accentColor} />
                            <span className={styles.modalTitle} style={{ color: accentColor }}>
                                Select {type === "vaccine" ? "Vaccine" : "Deworming"}
                            </span>
                            <button type="button" className={styles.modalCloseBtn} onClick={() => setNameModalVisible(false)}>
                                <Icon name="close" size={18} color="#64748b" />
                            </button>
                        </div>
                        <div className={styles.modalList}>
                            {nameOptions.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    className={styles.modalItem}
                                    onClick={() => selectName(item)}
                                >
                                    <Icon name={item === "Custom" ? "create-outline" : "checkmark-circle-outline"} size={16} color={accentColor} />
                                    <span className={styles.modalItemText}>{item}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateSettingsScreen;