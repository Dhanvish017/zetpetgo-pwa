import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { allBreeds } from "../../constants/breeds";
import styles from "./AddAnimalScreen.module.css";
import AddActivityScreen from "./AddActivityscreen";

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
    paw: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <ellipse cx="6" cy="7" rx="2" ry="3" /><ellipse cx="12" cy="5" rx="2" ry="3" />
        <ellipse cx="18" cy="7" rx="2" ry="3" /><ellipse cx="9" cy="12" rx="2" ry="2.5" />
        <path d="M12 11c1.5 0 6 3 6 7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3c0-4 4.5-7 6-7z" />
      </svg>
    ),
    person: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    "checkmark-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    male: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="14" r="5" /><line x1="21" y1="3" x2="15" y2="9" /><polyline points="15 3 21 3 21 9" />
      </svg>
    ),
    female: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" /><line x1="12" y1="13" x2="12" y2="21" /><line x1="9" y1="18" x2="15" y2="18" />
      </svg>
    ),
    "chevron-down": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  };
  return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// PROGRESS BAR
// =====================
const ProgressBar = ({ progress }) => {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBarBackground}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={styles.progressText}>{Math.round(progress)}% Complete</span>
    </div>
  );
};

// =====================
// XP FEEDBACK
// =====================
const XPFeedback = ({ visible, text, onComplete }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        onComplete && onComplete();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!show) return null;
  return (
    <div className={styles.xpContainer}>
      <span className={styles.xpText}>{text}</span>
    </div>
  );
};

// =====================
// PET CARD
// =====================
const PetCard = ({ species, isSelected, onPress }) => {
  return (
    <button
      className={`${styles.speciesCard} ${isSelected ? styles.speciesCardSelected : ""}`}
      onClick={onPress}
      type="button"
    >
      <span className={styles.speciesEmoji}>{species === "dog" ? "🐶" : "🐱"}</span>
      <span className={`${styles.speciesText} ${isSelected ? styles.speciesTextSelected : ""}`}>
        {species.charAt(0).toUpperCase() + species.slice(1)}
      </span>
      {isSelected && (
        <span className={styles.selectedBadge}>Selected</span>
      )}
    </button>
  );
};

// =====================
// MODERN INPUT
// =====================
const ModernInput = ({
  placeholder,
  value,
  onChange,
  type = "text",
  multiline = false,
  disabled = false,
  label,
  readOnly = false,
  onClick,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={styles.inputWrapper}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      {multiline ? (
        <textarea
          className={`${styles.modernInput} ${styles.modernTextarea} ${isFocused ? styles.inputFocused : ""} ${disabled ? styles.inputDisabled : ""}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      ) : (
        <input
          className={`${styles.modernInput} ${isFocused ? styles.inputFocused : ""} ${disabled || readOnly ? styles.inputDisabled : ""}`}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onClick={onClick}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      )}
    </div>
  );
};

// =====================
// BREED DROPDOWN
// =====================
const BreedDropdown = ({ items, value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = items.find((i) => i.value === value);

  return (
    <div className={styles.dropdownWrapper} ref={ref}>
      <label className={styles.inputLabel}>Breed</label>
      <button
        type="button"
        className={`${styles.dropdownTrigger} ${open ? styles.dropdownTriggerOpen : ""} ${disabled ? styles.inputDisabled : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
      >
        <span className={selected ? styles.dropdownValue : styles.dropdownPlaceholder}>
          {selected ? selected.label : disabled ? "Select Species First" : "Select Breed"}
        </span>
        <Icon name="chevron-down" size={18} color="#64748b" />
      </button>

      {open && (
        <div className={styles.dropdownList}>
          <div className={styles.dropdownSearch}>
            <Icon name="search" size={16} color="#94a3b8" />
            <input
              className={styles.dropdownSearchInput}
              placeholder="Search breed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.dropdownItems}>
            {filtered.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`${styles.dropdownItem} ${value === item.value ? styles.dropdownItemActive : ""}`}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {item.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <span className={styles.dropdownEmpty}>No breeds found</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =====================
// ADD ANIMAL SCREEN
// =====================
const AddAnimalScreen = () => {
  const navigate = useNavigate();

  const [checkingGuard, setCheckingGuard] = useState(true);
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [breedItems, setBreedItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const [xpVisible, setXpVisible] = useState(false);
  const [xpText, setXpText] = useState("");
  const [ageBadgeVisible, setAgeBadgeVisible] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const [formData, setFormData] = useState({
    animalName: "",
    species: "",
    breed: "",
    dob: null,
    ageDisplay: "",
    ageYears: 0,
    gender: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    address: "",
    vaccineType: "",
    stage: "",
    vaccineDate: "",
    dewormingName: "",
    nextDewormingDate: "",
  });

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
  }, []);

  // Progress calculation
  useEffect(() => {
    const requiredFields = [
      formData.species,
      formData.animalName,
      formData.breed,
      formData.dob,
      formData.gender,
      formData.ownerName,
      formData.ownerPhone,
      formData.address,
    ];
    const filled = requiredFields.filter(Boolean).length;
    setProgress((filled / requiredFields.length) * 100);
  }, [formData]);

  // Update breed list when species changes
  useEffect(() => {
    if (formData.species) {
      const formatted = formData.species === "dog" ? "Dog" : "Cat";
      setBreedItems(allBreeds[formatted] || []);
      setFormData((prev) => ({ ...prev, breed: "" }));
    }
  }, [formData.species]);

  // Profile guard
  useEffect(() => {
    const checkProfileGuard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const res = await axios.get("https://vetcare-1.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.isProfileComplete) {
          const go = window.confirm(
            "Please complete your account to add animals.\n\nClick OK to go to Create Account."
          );
          if (go) navigate("/createAccount");
          else navigate(-1);
          return;
        }
        setCheckingGuard(false);
      } catch {
        navigate("/login");
      }
    };
    checkProfileGuard();
  }, [navigate]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const triggerXP = (text) => {
    setXpText(text);
    setXpVisible(true);
  };

  const calculateAge = (dob) => {
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();
    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return { years, display: `${years} yrs ${months} mos ${days} days` };
  };

  const onDOBChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (isNaN(selectedDate)) return;
    const age = calculateAge(selectedDate);
    setFormData((prev) => ({
      ...prev,
      dob: selectedDate,
      ageDisplay: age.display,
      ageYears: age.years,
    }));
    setShowDOBPicker(false);
    setAgeBadgeVisible(true);
    setTimeout(() => setAgeBadgeVisible(false), 2000);
  };

  const handleAddActivity = async () => {
    if (!formData.animalName || !formData.species || !formData.ownerName || !formData.ownerPhone) {
      setShakeTrigger((p) => p + 1);
      alert("Please fill in all required fields to complete the level! 🎮");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const ownerRes = await axios.post(
        "https://vetcare-1.onrender.com/api/owners",
        {
          name: formData.ownerName,
          phone: formData.ownerPhone,
          email: formData.ownerEmail,
          address: formData.address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Debug: confirm all three required fields are present
      const ownerId = ownerRes.data?._id || ownerRes.data?.owner?._id || ownerRes.data?.id;
      console.log("Owner response:", ownerRes.data);
      console.log("owner_id:", ownerId, "| name:", formData.animalName, "| species:", formData.species);

      const animalRes = await axios.post(
        "https://vetcare-1.onrender.com/api/animals",
        {
          owner_id: ownerId,
          name: formData.animalName,
          species: formData.species.toLowerCase(),
          breed: formData.breed || null,
          age: parseInt(formData.ageYears) || null,
          gender: formData.gender || null,
          dob: formData.dob ? formData.dob.toISOString() : null,
          vaccineInfo: {
            vaccineType: formData.vaccineType || null,
            stage: formData.stage || null,
            vaccineStatus: "pending",
            nextVaccineDate: formData.vaccineDate ? new Date(formData.vaccineDate).toISOString() : null,
          },
          dewormingInfo: {
            dewormingName: formData.dewormingName || null,
            nextDewormingDate: formData.nextDewormingDate ? new Date(formData.nextDewormingDate).toISOString() : null,
            dewormingStatus: "pending",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const animalId = animalRes.data?._id || animalRes.data?.animal?._id || animalRes.data?.id;
      const species = animalRes.data?.species || animalRes.data?.animal?.species || formData.species;

      alert("🎉 Level Complete! Animal added successfully to your roster!");
      navigate("/addactivity", {
        state: { animalId, species },
      });
    } catch (err) {
      console.error("SAVE ANIMAL ERROR:", err.response?.data || err.message);
      alert("Failed to save animal. Please try again.");
    }
  };

  if (checkingGuard) return null;

  return (
    <div className={`${styles.container} ${fadeIn ? styles.fadeIn : ""}`}>

      {/* PROGRESS */}
      <ProgressBar progress={progress} />

      {/* XP FEEDBACK */}
      <div className={styles.xpWrapper}>
        <XPFeedback visible={xpVisible} text={xpText} onComplete={() => setXpVisible(false)} />
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className={styles.scrollContent}>

        {/* Animal Info Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Icon name="paw" size={22} color="#4a6cf7" />
            <span className={styles.sectionTitle}>Animal Information</span>
          </div>

          {/* Species */}
          <div className={styles.speciesRow}>
            {["dog", "cat"].map((species) => (
              <PetCard
                key={species}
                species={species}
                isSelected={formData.species === species}
                onPress={() => {
                  if (formData.species !== species) {
                    triggerXP("+10 XP 🐾");
                    setFormData((p) => ({ ...p, species, vaccineType: "" }));
                  }
                }}
              />
            ))}
          </div>

          <ModernInput
            label="Pet Name"
            placeholder="e.g. Bella"
            value={formData.animalName}
            onChange={(e) => handleChange("animalName", e.target.value)}
          />

          <BreedDropdown
            items={breedItems}
            value={formData.breed}
            onChange={(val) => {
              handleChange("breed", val);
              triggerXP("+5 XP ✨");
            }}
            disabled={!formData.species}
          />

          {/* Date of Birth */}
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>Date of Birth</label>
            {showDOBPicker ? (
              <input
                className={styles.modernInput}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                onChange={onDOBChange}
                autoFocus
                onBlur={() => setShowDOBPicker(false)}
              />
            ) : (
              <input
                className={`${styles.modernInput} ${styles.inputDisabled}`}
                type="text"
                value={formData.dob ? formData.dob.toDateString() : ""}
                placeholder="Select Date"
                readOnly
                onClick={() => setShowDOBPicker(true)}
                style={{ cursor: "pointer" }}
              />
            )}
          </div>

          {/* Age */}
          <div style={{ position: "relative" }}>
            <ModernInput
              label="Age"
              placeholder="Calculated Age"
              value={formData.ageDisplay}
              readOnly
              disabled
            />
            {ageBadgeVisible && (
              <span className={styles.ageBadge}>Age Calculated 🎉</span>
            )}
          </div>

          {/* Gender */}
          <div className={styles.inputWrapper}>
            <label className={styles.inputLabel}>Gender</label>
            <div className={styles.genderToggleContainer}>
              {["male", "female"].map((g) => {
                const isActive = formData.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    className={`${styles.genderBtn} ${isActive ? styles.genderBtnActive : ""}`}
                    onClick={() => {
                      if (formData.gender !== g) triggerXP("+5 XP ⚡");
                      handleChange("gender", g);
                    }}
                  >
                    <Icon name={g} size={18} color={isActive ? "#fff" : "#666"} />
                    <span className={`${styles.genderText} ${isActive ? styles.genderTextActive : ""}`}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Owner Info Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Icon name="person" size={22} color="#4a6cf7" />
            <span className={styles.sectionTitle}>Owner Details</span>
          </div>

          <ModernInput
            label="Owner Name"
            placeholder="Full Name"
            value={formData.ownerName}
            onChange={(e) => handleChange("ownerName", e.target.value)}
          />
          <ModernInput
            label="Phone Number"
            placeholder="Contact Number"
            type="tel"
            value={formData.ownerPhone}
            onChange={(e) => handleChange("ownerPhone", e.target.value)}
          />
          <ModernInput
            label="Address"
            placeholder="Full Address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            multiline
          />
        </div>

        {/* Save Button */}
        <button
          type="button"
          className={`${styles.saveButton} ${shakeTrigger > 0 ? styles.shake : ""}`}
          onClick={handleAddActivity}
          onAnimationEnd={() => setShakeTrigger(0)}
        >
          <Icon name="checkmark-circle" size={22} color="#fff" />
          <span className={styles.saveButtonText}>COMPLETE PROFILE</span>
        </button>

      </div>
    </div>
  );
};

export default AddAnimalScreen;