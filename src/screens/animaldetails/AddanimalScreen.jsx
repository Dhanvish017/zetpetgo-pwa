import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { allBreeds } from "../../constants/breeds";
import styles from "./AddanimalScreen.module.css";

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
// BREED DROPDOWN
// =====================
const BreedDropdown = ({ items, value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef(null);

    const filtered = items.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        setSearch("");
        setOpen(false);
    }, [disabled]);

    const selected = items.find((i) => i.value === value);

    return (
        <div className={styles.dropdownWrapper} ref={ref}>
            <button
                type="button"
                className={`${styles.dropdownTrigger} ${open ? styles.dropdownTriggerOpen : ""} ${disabled ? styles.dropdownDisabled : ""}`}
                onClick={() => !disabled && setOpen((o) => !o)}
                disabled={disabled}
            >
                <span className={selected ? styles.dropdownValue : styles.dropdownPlaceholder}>
                    {selected ? selected.label : disabled ? "Select Species First" : "Select Breed"}
                </span>
                <Icon name="chevron-down" size={18} color="#94a3b8" />
            </button>

            {open && (
                <div className={styles.dropdownList}>
                    <div className={styles.dropdownSearch}>
                        <Icon name="search" size={15} color="#94a3b8" />
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
                                onClick={() => { onChange(item.value); setOpen(false); setSearch(""); }}
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
// MAIN SCREEN
// =====================
const AddanimalScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { ownerId } = location.state || {};

    const [name, setName] = useState("");
    const [species, setSpecies] = useState(null);
    const [breed, setBreed] = useState(null);
    const [items, setItems] = useState([]);
    const [dob, setDob] = useState(null);
    const [age, setAge] = useState("");
    const [gender, setGender] = useState(null);
    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // Reset breed when species changes
    useEffect(() => {
        if (species) {
            setItems(allBreeds[species] || []);
            setBreed(null);
        }
    }, [species]);

    const calculateAge = (birthDate) => {
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();
        if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        return `${years} years ${months} months ${days} days`;
    };

    const onDOBChange = (e) => {
        const selectedDate = new Date(e.target.value);
        if (isNaN(selectedDate)) return;
        setDob(selectedDate);
        setAge(calculateAge(selectedDate));
        setShowDOBPicker(false);
    };

    const handleSave = async () => {
        if (!name.trim()) { alert("Animal name is required"); return; }
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.post(
                "https://vetcare-1.onrender.com/api/animals",
                {
                    owner_id: ownerId,
                    name: name.trim(),
                    species: species || null,
                    breed: breed || null,
                    age: age || null,
                    gender: gender || null,
                    dob: dob ? dob.toISOString().split("T")[0] : null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Animal added successfully!");
            navigate(-1);
        } catch (err) {
            console.error("ADD ANIMAL ERROR:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Failed to add animal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>

            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <button type="button" className={styles.backButton} onClick={() => navigate(-1)} aria-label="Go back">
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </button>
                    <span className={styles.headerText}>Add Animal</span>
                    <div style={{ width: 40 }} />
                </div>
            </div>

            {/* FORM */}
            <div className={styles.form}>

                {/* Name */}
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Animal Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* Species */}
                <div className={styles.speciesRow}>
                    <button
                        type="button"
                        className={`${styles.speciesBtn} ${species === "dog" ? styles.active : ""}`}
                        onClick={() => setSpecies("dog")}
                    >
                        🐶 Dog
                    </button>
                    <button
                        type="button"
                        className={`${styles.speciesBtn} ${species === "cat" ? styles.active : ""}`}
                        onClick={() => setSpecies("cat")}
                    >
                        🐱 Cat
                    </button>
                </div>

                {/* Breed Dropdown */}
                <BreedDropdown
                    items={items}
                    value={breed}
                    onChange={setBreed}
                    disabled={!species}
                />

                {/* Date of Birth */}
                <div className={styles.dobWrapper}>
                    {showDOBPicker ? (
                        <input
                            className={styles.input}
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            onChange={onDOBChange}
                            autoFocus
                            onBlur={() => setShowDOBPicker(false)}
                        />
                    ) : (
                        <button
                            type="button"
                            className={`${styles.input} ${styles.dobButton}`}
                            onClick={() => setShowDOBPicker(true)}
                        >
                            <span style={{ color: dob ? "#1e293b" : "#999", fontSize: 16 }}>
                                {dob ? dob.toDateString() : "Date of Birth"}
                            </span>
                        </button>
                    )}
                </div>

                {/* Age (auto calculated) */}
                <input
                    className={`${styles.input} ${styles.inputDisabled}`}
                    type="text"
                    placeholder="Age (auto calculated from DOB)"
                    value={age}
                    readOnly
                />

                {/* Gender */}
                <div className={styles.speciesRow}>
                    <button
                        type="button"
                        className={`${styles.speciesBtn} ${gender === "male" ? styles.active : ""}`}
                        onClick={() => setGender("male")}
                    >
                        ♂ Male
                    </button>
                    <button
                        type="button"
                        className={`${styles.speciesBtn} ${gender === "female" ? styles.active : ""}`}
                        onClick={() => setGender("female")}
                    >
                        ♀ Female
                    </button>
                </div>

                {/* Save Button */}
                <button
                    type="button"
                    className={`${styles.saveBtn} ${loading ? styles.saveBtnLoading : ""}`}
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Animal"}
                </button>

                <div style={{ height: 40 }} />
            </div>
        </div>
    );
};

export default AddanimalScreen;