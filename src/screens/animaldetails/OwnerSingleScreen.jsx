import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import styles from "./OwnerSingleScreen.module.css";

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
        "person-circle": (
            <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
                <circle cx="12" cy="12" r="12" opacity="0.15" />
                <circle cx="12" cy="10" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
        ),
        "call-outline": (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.43 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
        ),
        "stats-chart": (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
        "add-circle": (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
        ),
    };
    return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// ANIMAL CARD
// =====================
const AnimalCard = ({ item, onClick }) => {
    const imageUrl =
        item.species === "cat"
            ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80"
            : "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80&q=80";

    return (
        <button className={styles.animalCard} onClick={onClick} type="button">
            <img src={imageUrl} alt={item.name} className={styles.animalCardImage} />
            <span className={styles.animalCardName}>{item.name}</span>
        </button>
    );
};

// =====================
// OWNER SINGLE SCREEN
// =====================
const OwnerSingleScreen = () => {
    const navigate = useNavigate();
    const { ownerId } = useParams();

    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOwnerDetails = useCallback(async () => {
        try {
            const res = await api.get(`/api/owners/${ownerId}`);
            setOwner(res.data);
        } catch (err) {
            console.error("FETCH OWNER ERROR:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }, [ownerId]);

    useEffect(() => {
        fetchOwnerDetails();
    }, [fetchOwnerDetails]);

    // ---- LOADING ----
    if (loading) {
        return (
            <div className={styles.center}>
                <div className={styles.spinner} />
            </div>
        );
    }

    // ---- NOT FOUND ----
    if (!owner) {
        return (
            <div className={styles.center}>
                <span>Owner not found</span>
            </div>
        );
    }

    // ---- MAIN UI ----
    return (
        <div className={styles.container}>

            {/* PROFILE HEADER */}
            <div className={styles.profileHeader}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    <Icon name="arrow-back" size={22} color="#fff" />
                </button>

                <div className={styles.avatarContainer}>
                    <div className={styles.avatarWrapper}>
                        <Icon name="person-circle" size={90} color="rgba(255,255,255,0.9)" />
                    </div>
                    <span className={styles.headerName}>{owner.name}</span>
                    <span className={styles.headerPhone}>
                        <Icon name="call-outline" size={14} color="rgba(255,255,255,0.9)" />
                        &nbsp;{owner.phone}
                    </span>
                </div>
            </div>

            {/* ANIMAL GRID */}
            <div className={styles.content}>
                {owner.animals && owner.animals.length > 0 ? (
                    <div className={styles.animalGrid}>
                        {owner.animals.map((item) => (
                            <AnimalCard
                                key={item._id}
                                item={item}
                                onClick={() => navigate(`/animal/${item.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <span className={styles.empty}>No animals added yet</span>
                )}
            </div>

            {/* FOOTER BUTTONSss */}
            <div className={styles.buttonContainer}>
                <button
                    type="button"
                    className={styles.viewReportButton}
                    onClick={() => navigate(`/report/${owner.id}`)}
                >
                    <Icon name="stats-chart" size={22} color="#4a6cf7" />
                    <span className={styles.viewReportText}>View Report</span>
                </button>

                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => navigate("/animals/add", { state: { ownerId: owner.id } })}
                >
                    <Icon name="add-circle" size={22} color="#fff" />
                    <span className={styles.addText}>Add Animal</span>
                </button>
            </div>

        </div>
    );
};

export default OwnerSingleScreen;