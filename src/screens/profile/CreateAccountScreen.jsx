import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import styles from "./CreateAccountScreen.module.css";

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 32, color = "currentColor" }) => {
    const icons = {
        business: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="12" />
                <line x1="8" y1="12" x2="8" y2="12" />
                <line x1="16" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="12" y1="16" x2="12" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
        ),
        person: (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    };
    return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// CREATE ACCOUNT SCREEN
// =====================
const CreateAccountScreen = () => {
    const navigate = useNavigate();

    const [selectedType, setSelectedType] = useState(null);
    const [form, setForm] = useState({
        clinicName: "",
        doctorName: "",
        phoneNumber: "",
        permanentAddress: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setForm({ clinicName: "", doctorName: "", phoneNumber: "", permanentAddress: "" });
        setErrors({});
    };

    const handleInputChange = (field, value) => {
        const cleaned = field === "phoneNumber" ? value.replace(/\D/g, "").slice(0, 10) : value;
        setForm(prev => ({ ...prev, [field]: cleaned }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!selectedType) { newErrors.type = "Please select an account type"; }

        if (selectedType === "clinic" && !form.clinicName.trim()) newErrors.clinicName = "Clinic name is required";
        if (!form.doctorName.trim()) newErrors.doctorName = "Doctor name is required";
        if (!form.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^\d{10}$/.test(form.phoneNumber.trim())) {
            newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
        }
        if (!form.permanentAddress.trim()) newErrors.permanentAddress = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const profileData = selectedType === "clinic"
                ? { clinicName: form.clinicName, name: form.doctorName, phone: form.phoneNumber, address: form.permanentAddress, accountType: "clinic" }
                : { name: form.doctorName, phone: form.phoneNumber, address: form.permanentAddress, accountType: "individual" };

            await api.put("/api/profile", profileData);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const skip = () => navigate("/dashboard", { replace: true });

    const clinicFields = [
        { key: "clinicName", label: "Clinic Name", placeholder: "Enter clinic name", type: "text" },
        { key: "doctorName", label: "Doctor Name", placeholder: "Enter doctor name", type: "text" },
        { key: "phoneNumber", label: "Phone Number", placeholder: "Enter 10-digit phone number", type: "tel" },
        { key: "permanentAddress", label: "Permanent Address", placeholder: "Enter permanent address", type: "text" },
    ];

    const individualFields = [
        { key: "doctorName", label: "Doctor Name", placeholder: "Enter doctor name", type: "text" },
        { key: "phoneNumber", label: "Phone Number", placeholder: "Enter 10-digit phone number", type: "tel" },
        { key: "permanentAddress", label: "Address", placeholder: "Enter address", type: "text" },
    ];

    const fields = selectedType === "clinic" ? clinicFields : selectedType === "individual" ? individualFields : [];

    return (
        <div className={styles.root}>
            <div className={styles.card}>

                {/* HEADER */}
                <div className={styles.header}>
                    <span className={styles.title}>Create Account</span>
                    <span className={styles.subtitle}>Complete your profile to get started</span>
                </div>

                {/* ACCOUNT TYPE */}
                <div className={styles.selectionContainer}>
                    <span className={styles.sectionTitle}>Select Account Type</span>
                    {errors.type && <span className={styles.errorText}>{errors.type}</span>}
                    <div className={styles.typeContainer}>
                        <button
                            type="button"
                            className={`${styles.typeCard} ${selectedType === "clinic" ? styles.typeCardSelected : ""}`}
                            onClick={() => handleTypeSelect("clinic")}
                        >
                            <Icon name="business" size={32} color={selectedType === "clinic" ? "#fff" : "#6A7BFF"} />
                            <span className={`${styles.typeText} ${selectedType === "clinic" ? styles.typeTextSelected : ""}`}>
                                Clinic
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`${styles.typeCard} ${selectedType === "individual" ? styles.typeCardSelected : ""}`}
                            onClick={() => handleTypeSelect("individual")}
                        >
                            <Icon name="person" size={32} color={selectedType === "individual" ? "#fff" : "#6A7BFF"} />
                            <span className={`${styles.typeText} ${selectedType === "individual" ? styles.typeTextSelected : ""}`}>
                                Individual Doctor
                            </span>
                        </button>
                    </div>
                </div>

                {/* FORM FIELDS */}
                {fields.length > 0 && (
                    <div className={styles.formContainer}>
                        {fields.map((field) => (
                            <div key={field.key} className={styles.inputGroup}>
                                <label className={styles.label} htmlFor={field.key}>{field.label} *</label>
                                <input
                                    id={field.key}
                                    className={`${styles.input} ${errors[field.key] ? styles.inputError : ""}`}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={form[field.key]}
                                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                                    autoCapitalize={field.type === "tel" ? "none" : "words"}
                                    inputMode={field.type === "tel" ? "numeric" : undefined}
                                    maxLength={field.type === "tel" ? 10 : undefined}
                                />
                                {errors[field.key] && (
                                    <span className={styles.fieldError}>{errors[field.key]}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* BUTTONS */}
                <div className={styles.buttonContainer}>
                    <button
                        type="button"
                        className={`${styles.primaryButton} ${loading ? styles.buttonDisabled : ""}`}
                        onClick={submit}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>

                    <button type="button" className={styles.skipButton} onClick={skip}>
                        Skip for now
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateAccountScreen;