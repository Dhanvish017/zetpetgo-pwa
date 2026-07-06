import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import "./AddActivityscreen.css";

const VACCINE_OPTIONS = {
  dog: ["DHPPi+RL", "DHPPi+L", "Puppy DP", "Antirabies", "Custom"],
  cat: ["FVRCP", "FVRCP+Rabies", "Anti-rabies", "Custom"],
};

const DEWORMING_OPTIONS = [
  "Pyrantel Pamoate",
  "Fenbendazole",
  "Ivermectin Oral",
  "Custom",
];

const STAGES = ["1st", "2nd", "3rd", "4th", "Annual", "Custom"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function getDayName(date) {
  return DAY_NAMES[date.getDay()];
}

function toISODate(date) {
  return date.toISOString().split("T")[0];
}

const PREFILLED_IDS = [1, 2, 3, 4, 5];

const COL = {
  stage: 130,
  interval: 90,
  date: 105,
  day: 70,
  name: 160,
  action: 44,
};

// ---------------------------------------------------------------------------
// Generic dropdown-style modal (replaces React Native <Modal> + <FlatList>)
// ---------------------------------------------------------------------------
const SelectModal = ({ visible, onClose, title, icon, species, options, onSelect }) => {
  if (!visible) return null;
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <span className="modalIcon">{icon}</span>
          <span className="modalTitle">{title}</span>
          {species && (
            <span className="modalSpecies">{species === "dog" ? "🐶 Dog" : "🐱 Cat"}</span>
          )}
        </div>
        <div className="modalList">
          {options.map((item) => (
            <button
              key={item}
              type="button"
              className="modalItem"
              onClick={() => onSelect(item)}
            >
              <span className="modalItemIcon">{item === "Custom" ? "✏️" : "✓"}</span>
              <span className="modalItemText">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AddActivityScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { animalId, species: routeSpecies, initialTab } = location.state || {};
  const BASE_DATE = useRef(new Date()).current;

  const [species, setSpecies] = useState(routeSpecies || null);
  const [activeTab, setActiveTab] = useState(initialTab || "vaccine");
  const [saving, setSaving] = useState(false);
  const [fetchingSpecies, setFetchingSpecies] = useState(!routeSpecies);

  const [vaccineRows, setVaccineRows] = useState([
    { id: 1, stage: "1st", customStage: "", interval: "", vaccineName: "", customVaccine: "" },
    { id: 2, stage: "2nd", customStage: "", interval: "", vaccineName: "", customVaccine: "" },
    { id: 3, stage: "3rd", customStage: "", interval: "", vaccineName: "", customVaccine: "" },
    { id: 4, stage: "4th", customStage: "", interval: "", vaccineName: "", customVaccine: "" },
    { id: 5, stage: "Annual", customStage: "", interval: "", vaccineName: "", customVaccine: "" },
  ]);

  const [dewormingRows, setDewormingRows] = useState([
    { id: 1, interval: "", dewormingName: "", customDeworming: "" },
    { id: 2, interval: "", dewormingName: "", customDeworming: "" },
    { id: 3, interval: "", dewormingName: "", customDeworming: "" },
    { id: 4, interval: "", dewormingName: "", customDeworming: "" },
  ]);

  const [vaccineModalVisible, setVaccineModalVisible] = useState(false);
  const [stageModalVisible, setStageModalVisible] = useState(false);
  const [dewormingModalVisible, setDewormingModalVisible] = useState(false);
  const [activeRowId, setActiveRowId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [firstDate, setFirstDate] = useState("");

  // ---------------------
  // FETCH SPECIES (if not passed in)
  // ---------------------
  useEffect(() => {
    if (!routeSpecies && animalId) {
      const fetchSpecies = async () => {
        try {
          const res = await api.get(`/api/animals/${animalId}`);
          if (res.data?.species) setSpecies(res.data.species);
        } catch (e) {
          console.log("Failed to fetch species", e.message);
        } finally {
          setFetchingSpecies(false);
        }
      };
      fetchSpecies();
    } else {
      setFetchingSpecies(false);
    }
  }, [animalId, routeSpecies]);

  // ---------------------
  // FETCH TEMPLATE
  // ---------------------
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const res = await api.get("/api/template");
        if (res.data.scheduleTemplate) setTemplate(res.data.scheduleTemplate);
      } catch (e) {
        // silent, same as native
      }
    };
    loadTemplate();
  }, []);

  // ---------------------
  // VACCINE ROW ACTIONS
  // ---------------------
  const addVaccineRow = () => {
    const newId = Date.now();
    const newRow = { id: newId, stage: "Custom", customStage: "", interval: "", vaccineName: "", customVaccine: "" };
    setVaccineRows((prev) => {
      const annualIndex = prev.findIndex((r) => r.stage === "Annual");
      if (annualIndex === -1) return [...prev, newRow];
      const updated = [...prev];
      updated.splice(annualIndex, 0, newRow);
      return updated;
    });
  };

  const removeVaccineRow = (id) => {
    if (vaccineRows.length > 1) setVaccineRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateVaccineRow = (id, field, value) =>
    setVaccineRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // ---------------------
  // DEWORMING ROW ACTIONS
  // ---------------------
  const addDewormingRow = () => {
    const newId = dewormingRows[dewormingRows.length - 1].id + 1;
    setDewormingRows((prev) => [...prev, { id: newId, interval: "", dewormingName: "", customDeworming: "" }]);
  };
  const removeDewormingRow = (id) => {
    if (dewormingRows.length > 1) setDewormingRows((prev) => prev.filter((r) => r.id !== id));
  };
  const updateDewormingRow = (id, field, value) =>
    setDewormingRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  // ---------------------
  // DATE CALCULATION — supports negative intervals
  // ---------------------
  const getVaccineRowDate = (index) => {
    let date = BASE_DATE;
    for (let i = 0; i <= index; i++) {
      const val = parseInt(vaccineRows[i].interval, 10);
      if (!isNaN(val) && val !== 0) {
        date = addDays(i === 0 ? BASE_DATE : date, val);
      }
    }
    return date;
  };

  const getDewormingRowDate = (index) => {
    let date = BASE_DATE;
    for (let i = 0; i <= index; i++) {
      const val = parseInt(dewormingRows[i].interval, 10);
      if (!isNaN(val) && val !== 0) {
        date = addDays(i === 0 ? BASE_DATE : date, val);
      }
    }
    return date;
  };

  // ---------------------
  // MODAL OPENERS
  // ---------------------
  const openVaccineModal = (id) => { setActiveRowId(id); setVaccineModalVisible(true); };
  const openStageModal = (id) => { setActiveRowId(id); setStageModalVisible(true); };
  const openDewormingModal = (id) => { setActiveRowId(id); setDewormingModalVisible(true); };

  const selectVaccineName = (name) => {
    const id = activeRowId;
    setVaccineModalVisible(false);
    setVaccineRows((prev) => prev.map((r) => (r.id === id ? { ...r, vaccineName: name, customVaccine: "" } : r)));
  };
  const selectStage = (stage) => {
    const id = activeRowId;
    setStageModalVisible(false);
    setVaccineRows((prev) => prev.map((r) => (r.id === id ? { ...r, stage, customStage: "" } : r)));
  };
  const selectDewormingName = (name) => {
    const id = activeRowId;
    setDewormingModalVisible(false);
    setDewormingRows((prev) => prev.map((r) => (r.id === id ? { ...r, dewormingName: name, customDeworming: "" } : r)));
  };

  // ---------------------
  // TEMPLATE
  // ---------------------
  const applyTemplate = () => {
    if (!template || !species) {
      window.alert("No Template: Please set up your template in Settings first.");
      return;
    }
    setDateModalVisible(true);
  };

  const confirmApplyTemplate = () => {
    if (!firstDate || firstDate.trim() === "") {
      window.alert("Missing Date: Please select the first date.");
      return;
    }
    const speciesTemplate = template[species];
    if (!speciesTemplate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fd = new Date(firstDate);
    fd.setHours(0, 0, 0, 0);
    const daysToFirst = Math.round((fd - today) / (1000 * 60 * 60 * 24));

    if (activeTab === "vaccine" && speciesTemplate.vaccine?.length) {
      setVaccineRows(
        speciesTemplate.vaccine.map((t, i) => ({
          id: i + 1,
          stage: t.stage || `${i + 1}`,
          customStage: "",
          interval: i === 0 ? String(daysToFirst) : String(t.interval || 0),
          vaccineName: t.vaccineName || "",
          customVaccine: "",
        }))
      );
    }
    if (activeTab === "deworming" && speciesTemplate.deworming?.length) {
      setDewormingRows(
        speciesTemplate.deworming.map((t, i) => ({
          id: i + 1,
          interval: i === 0 ? String(daysToFirst) : String(t.interval || 0),
          dewormingName: t.dewormingName || "",
          customDeworming: "",
        }))
      );
    }
    setDateModalVisible(false);
    setFirstDate("");
  };

  // ---------------------
  // SAVE
  // ---------------------
  const handleSave = async (skipDeworming = false) => {
    if (!animalId) {
      window.alert("Error: Missing Animal ID. Cannot save schedule.");
      return;
    }
    try {
      setSaving(true);

      const vaccineSchedule = vaccineRows
        .filter((row) => row.vaccineName || row.customVaccine)
        .map((row, index) => ({
          stage: row.stage === "Custom" ? row.customStage || "Custom" : row.stage,
          vaccineName: row.vaccineName === "Custom" ? row.customVaccine || "" : row.vaccineName,
          interval: parseInt(row.interval, 10) || 0,
          dueDate: toISODate(getVaccineRowDate(index)),
          status: "pending",
        }));

      const dewormingSchedule = skipDeworming
        ? []
        : dewormingRows
          .filter((row) => row.dewormingName || row.customDeworming)
          .map((row, index) => ({
            dewormingName: row.dewormingName === "Custom" ? row.customDeworming || "" : row.dewormingName,
            interval: parseInt(row.interval, 10) || 0,
            dueDate: toISODate(getDewormingRowDate(index)),
            status: "pending",
          }));

      await api.put(
        `/api/animals/${animalId}/schedule`,
        { vaccineSchedule, dewormingSchedule }
      );

      window.alert("Success: Schedule saved successfully!");
      navigate("/animals");
    } catch (err) {
      console.error("SAVE SCHEDULE ERROR:", err.message);
      window.alert("Error: Failed to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  const handleIntervalChange = (raw) => {
    // Allow digits and a single leading minus sign, same as native cleaning logic
    return raw.replace(/[^0-9-]/g, "").replace(/(?!^)-/g, "");
  };

  const vaccineOptions = species ? VACCINE_OPTIONS[species] : [];

  // ---------------------
  // RENDER
  // ---------------------
  return (
    <div className="safeArea">
      {/* Header */}
      <div className="header">
        <button type="button" className="backBtn" onClick={() => navigate(-1)}>
          <span aria-hidden="true">←</span>
        </button>
        <div className="headerCenter">
          <span className="headerIcon">📅</span>
          <span className="headerTitle">Create Schedule</span>
        </div>
        <div className="headerSpacer" />
      </div>

      {species && (
        <div className="speciesBanner">
          <span className="speciesBannerText">{species === "dog" ? "🐶 Dog" : "🐱 Cat"} Schedule</span>
        </div>
      )}

      {fetchingSpecies ? (
        <div className="loadingScreen">
          <div className="spinner" />
          <span className="loadingText">Loading...</span>
        </div>
      ) : (
        <>
          {/* Tab Bar */}
          <div className="tabBar">
            <button
              type="button"
              className={`tabBtn ${activeTab === "vaccine" ? "tabBtnActive" : ""}`}
              onClick={() => setActiveTab("vaccine")}
            >
              <span className={`tabIcon ${activeTab === "vaccine" ? "tabIconActive" : ""}`}>🛡️</span>
              <span className={`tabText ${activeTab === "vaccine" ? "tabTextActive" : ""}`}>Vaccine</span>
              <span className={`stepBadge ${activeTab === "vaccine" ? "stepBadgeActive" : "stepBadgeDone"}`}>
                {activeTab === "vaccine" ? "1" : "✓"}
              </span>
            </button>
            <button
              type="button"
              className={`tabBtn ${activeTab === "deworming" ? "tabBtnActive" : ""}`}
              onClick={() => setActiveTab("deworming")}
            >
              <span className={`tabIcon ${activeTab === "deworming" ? "tabIconActive" : ""}`}>💊</span>
              <span className={`tabText ${activeTab === "deworming" ? "tabTextActive" : ""}`}>Deworming</span>
              <span className={`stepBadge ${activeTab === "deworming" ? "stepBadgeActive" : ""}`}>2</span>
            </button>
          </div>

          {/* Use Template Button */}
          <button type="button" className="templateBtn" onClick={applyTemplate}>
            <span aria-hidden="true">⚡</span>
            <span>Use Template</span>
          </button>

          <div className="body">
            {/* ======================== VACCINE TABLE ======================== */}
            {activeTab === "vaccine" && (
              <>
                {!species ? (
                  <div className="noSpeciesHint">
                    <span className="noSpeciesIcon">🐾</span>
                    <span className="noSpeciesText">Species info unavailable.</span>
                  </div>
                ) : (
                  <>
                    <div className="tableScroll">
                      <div className="tableInner">
                        <div className="tableHeader">
                          <span className="th" style={{ width: COL.stage }}>Stage</span>
                          <span className="th" style={{ width: COL.interval }}>
                            Interval
                            <br />
                            (Days)
                          </span>
                          <span className="th" style={{ width: COL.date }}>Date</span>
                          <span className="th" style={{ width: COL.day }}>Day</span>
                          <span className="th" style={{ width: COL.name }}>Vaccine Name</span>
                          <span className="th" style={{ width: COL.action }} />
                        </div>

                        {vaccineRows.map((row, index) => {
                          const rowDate = getVaccineRowDate(index);
                          const isPreFilled = PREFILLED_IDS.includes(row.id);
                          const isCustomStage = row.stage === "Custom";
                          const isCustomVaccine = row.vaccineName === "Custom";

                          return (
                            <div
                              key={row.id}
                              className={`tableRow ${index % 2 === 0 ? "rowEven" : "rowOdd"}`}
                            >
                              {/* Stage */}
                              <div className="td" style={{ width: COL.stage }}>
                                {isPreFilled ? (
                                  <div className="stageLocked">
                                    <span className="stageLockedText">{row.stage}</span>
                                  </div>
                                ) : isCustomStage ? (
                                  <input
                                    className="cellInput"
                                    placeholder="Stage name..."
                                    value={row.customStage}
                                    onChange={(e) => updateVaccineRow(row.id, "customStage", e.target.value)}
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    className="cellDropdown"
                                    onClick={() => openStageModal(row.id)}
                                  >
                                    <span className={`cellDropdownText ${!row.stage ? "placeholder" : ""}`}>
                                      {row.stage || "Select..."}
                                    </span>
                                    <span className="chevron">▾</span>
                                  </button>
                                )}
                              </div>

                              {/* Interval — allows negative numbers */}
                              <div className="td" style={{ width: COL.interval }}>
                                <input
                                  className="cellInput"
                                  inputMode="numeric"
                                  placeholder="0"
                                  value={row.interval}
                                  onChange={(e) =>
                                    updateVaccineRow(row.id, "interval", handleIntervalChange(e.target.value))
                                  }
                                />
                              </div>

                              {/* Date */}
                              <div className="td" style={{ width: COL.date }}>
                                <div className="autoCell">
                                  <span className="autoIcon">📅</span>
                                  <span className="autoText">{formatDate(rowDate)}</span>
                                </div>
                              </div>

                              {/* Day */}
                              <div className="td" style={{ width: COL.day }}>
                                <div className="dayBadge">
                                  <span className="dayText">{getDayName(rowDate)}</span>
                                </div>
                              </div>

                              {/* Vaccine Name */}
                              <div className="td" style={{ width: COL.name }}>
                                {isCustomVaccine ? (
                                  <input
                                    className="cellInput"
                                    placeholder="Vaccine name..."
                                    value={row.customVaccine}
                                    onChange={(e) => updateVaccineRow(row.id, "customVaccine", e.target.value)}
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    className={`cellDropdown ${row.vaccineName ? "cellDropdownSelected" : ""}`}
                                    onClick={() => openVaccineModal(row.id)}
                                  >
                                    <span
                                      className={`cellDropdownText ${!row.vaccineName ? "placeholder" : "cellDropdownSelectedText"
                                        }`}
                                    >
                                      {row.vaccineName || "Select..."}
                                    </span>
                                    <span className={`chevron ${row.vaccineName ? "chevronActive" : ""}`}>▾</span>
                                  </button>
                                )}
                              </div>

                              {/* Delete */}
                              <div className="td" style={{ width: COL.action }}>
                                <button
                                  type="button"
                                  className="deleteBtn"
                                  onClick={() => removeVaccineRow(row.id)}
                                  aria-label="Delete row"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button type="button" className="addRowBtn" onClick={addVaccineRow}>
                      <span aria-hidden="true">➕</span>
                      <span>Add Row</span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* ======================== DEWORMING TABLE ======================== */}
            {activeTab === "deworming" && (
              <>
                <div className="tableScroll">
                  <div className="tableInner">
                    <div className="tableHeader">
                      <span className="th" style={{ width: COL.interval }}>
                        Interval
                        <br />
                        (Days)
                      </span>
                      <span className="th" style={{ width: COL.date }}>Date</span>
                      <span className="th" style={{ width: COL.day }}>Day</span>
                      <span className="th" style={{ width: COL.name }}>Deworming Name</span>
                      <span className="th" style={{ width: COL.action }} />
                    </div>

                    {dewormingRows.map((row, index) => {
                      const rowDate = getDewormingRowDate(index);
                      const isCustom = row.dewormingName === "Custom";

                      return (
                        <div key={row.id} className={`tableRow ${index % 2 === 0 ? "rowEven" : "rowOdd"}`}>
                          {/* Interval — allows negative */}
                          <div className="td" style={{ width: COL.interval }}>
                            <input
                              className="cellInput"
                              inputMode="numeric"
                              placeholder="0"
                              value={row.interval}
                              onChange={(e) =>
                                updateDewormingRow(row.id, "interval", handleIntervalChange(e.target.value))
                              }
                            />
                          </div>

                          {/* Date */}
                          <div className="td" style={{ width: COL.date }}>
                            <div className="autoCell">
                              <span className="autoIcon">📅</span>
                              <span className="autoText">{formatDate(rowDate)}</span>
                            </div>
                          </div>

                          {/* Day */}
                          <div className="td" style={{ width: COL.day }}>
                            <div className="dayBadge">
                              <span className="dayText">{getDayName(rowDate)}</span>
                            </div>
                          </div>

                          {/* Deworming Name */}
                          <div className="td" style={{ width: COL.name }}>
                            {isCustom ? (
                              <input
                                className="cellInput"
                                placeholder="Deworming name..."
                                value={row.customDeworming}
                                onChange={(e) => updateDewormingRow(row.id, "customDeworming", e.target.value)}
                              />
                            ) : (
                              <button
                                type="button"
                                className={`cellDropdown ${row.dewormingName ? "cellDropdownSelected" : ""}`}
                                onClick={() => openDewormingModal(row.id)}
                              >
                                <span
                                  className={`cellDropdownText ${!row.dewormingName ? "placeholder" : "cellDropdownSelectedText"
                                    }`}
                                >
                                  {row.dewormingName || "Select..."}
                                </span>
                                <span className={`chevron ${row.dewormingName ? "chevronActive" : ""}`}>▾</span>
                              </button>
                            )}
                          </div>

                          {/* Delete */}
                          <div className="td" style={{ width: COL.action }}>
                            <button
                              type="button"
                              className="deleteBtn"
                              onClick={() => removeDewormingRow(row.id)}
                              aria-label="Delete row"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button type="button" className="addRowBtn" onClick={addDewormingRow}>
                  <span aria-hidden="true">➕</span>
                  <span>Add Row</span>
                </button>
              </>
            )}

            {/* Info */}
            <div className="infoCard">
              <span className="infoIcon">ℹ️</span>
              <span className="infoText">
                Dates are calculated from today ({formatDate(BASE_DATE)}) using cumulative intervals. Use negative
                numbers to go back in time.
              </span>
            </div>
            <div className="bottomSpacer" />
          </div>

          {/* ======================== FOOTER BUTTONS ======================== */}
          <div className="footer">
            {activeTab === "vaccine" ? (
              <button type="button" className="nextBtn" onClick={() => setActiveTab("deworming")}>
                <span>Next: Deworming</span>
                <span className="nextArrow" aria-hidden="true">→</span>
              </button>
            ) : (
              <div className="footerRow">
                <button
                  type="button"
                  className="skipBtn"
                  style={saving ? { opacity: 0.7 } : undefined}
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  <span aria-hidden="true">✔️</span>
                  <span>Skip &amp; Save</span>
                </button>

                <button
                  type="button"
                  className="saveBtn"
                  style={saving ? { opacity: 0.7 } : undefined}
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="spinnerSmall" />
                  ) : (
                    <>
                      <span>Save Schedule</span>
                      <span aria-hidden="true">✅</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* VACCINE MODAL */}
      <SelectModal
        visible={vaccineModalVisible}
        onClose={() => setVaccineModalVisible(false)}
        title="Select Vaccine"
        icon="🛡️"
        species={species}
        options={vaccineOptions}
        onSelect={selectVaccineName}
      />

      {/* STAGE MODAL */}
      <SelectModal
        visible={stageModalVisible}
        onClose={() => setStageModalVisible(false)}
        title="Select Stage"
        icon="📚"
        options={STAGES}
        onSelect={selectStage}
      />

      {/* DEWORMING MODAL */}
      <SelectModal
        visible={dewormingModalVisible}
        onClose={() => setDewormingModalVisible(false)}
        title="Select Deworming"
        icon="💊"
        options={DEWORMING_OPTIONS}
        onSelect={selectDewormingName}
      />

      {/* DATE MODAL */}
      {dateModalVisible && (
        <div className="modalOverlay" onClick={() => setDateModalVisible(false)}>
          <div className="modalBox dateModalBox" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <span className="modalIcon">📅</span>
              <span className="modalTitle">
                Select First {activeTab === "vaccine" ? "Vaccine" : "Deworming"} Date
              </span>
            </div>

            <label className="dateDisplayBtn">
              <span className="dateDisplayIcon" aria-hidden="true">📅</span>
              <input
                type="date"
                className="dateNativeInput"
                value={firstDate}
                onChange={(e) => setFirstDate(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="applyBtn"
              style={!firstDate ? { opacity: 0.5 } : undefined}
              onClick={confirmApplyTemplate}
              disabled={!firstDate}
            >
              <span aria-hidden="true">⚡</span>
              <span>Apply Template</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddActivityScreen;