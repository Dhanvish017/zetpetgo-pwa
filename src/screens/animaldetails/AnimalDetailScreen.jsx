import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import styles from "./AnimalDetailsScreen.module.css";

// =====================
// ICONS
// =====================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    "close-circle": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    "chevron-forward": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    "alert-circle-outline": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    "paw-outline": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="6" cy="7" rx="2" ry="3" />
        <ellipse cx="12" cy="5" rx="2" ry="3" />
        <ellipse cx="18" cy="7" rx="2" ry="3" />
        <ellipse cx="9" cy="12" rx="2" ry="2.5" />
        <path d="M12 11c1.5 0 6 3 6 7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3c0-4 4.5-7 6-7z" />
      </svg>
    ),
  };
  return <span style={{ display: "inline-flex", alignItems: "center" }}>{icons[name] || null}</span>;
};

// =====================
// MAIN SCREEN
// =====================
const AnimalDetailScreen = () => {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOwners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/owners");
      setOwners(res.data);
      setFilteredOwners(res.data);
      setError(null);
    } catch {
      setError("Failed to load owners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text) {
      setFilteredOwners(owners);
      return;
    }
    setFilteredOwners(
      owners.filter((owner) => owner.phone?.toString().includes(text))
    );
  };

  // ---- LOADING ----
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>Loading animals...</span>
      </div>
    );
  }

  // ---- ERROR ----
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#ff6b6b" />
          <span className={styles.error}>{error}</span>
          <button className={styles.retryButton} onClick={fetchOwners}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---- MAIN UI ----
  return (
    <div className={styles.container}>

      {/* SEARCH BAR */}
      <div className={styles.searchBox}>
        <Icon name="search" size={20} color="#4a6cf7" />
        <input
          className={styles.searchInput}
          type="tel"
          placeholder="Search by phone number"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {searchText.length > 0 && (
          <button
            className={styles.clearBtn}
            onClick={() => handleSearch("")}
            aria-label="Clear search"
          >
            <Icon name="close-circle" size={20} color="#999" />
          </button>
        )}
      </div>

      {/* LIST OR EMPTY STATE */}
      {filteredOwners.length === 0 ? (
        <div className={styles.emptyContainer}>
          <Icon name="paw-outline" size={64} color="#ccc" />
          <span className={styles.empty}>No owners found</span>
          {searchText.length > 0 && (
            <span className={styles.emptySubtext}>Try a different phone number</span>
          )}
        </div>
      ) : (
        <div className={styles.listContent}>
          {filteredOwners.map((item) => (
            <button
              key={item.id}
              className={styles.card}
              onClick={() => navigate(`/owner/${item.id}`)}
            >
              <div className={styles.cardLeft}>
                <span className={styles.ownerName}>{item.name}</span>
                <span className={styles.phone}>📞 {item.phone}</span>
              </div>
              <Icon name="chevron-forward" size={22} color="#4a6cf7" />
            </button>
          ))}
        </div>
      )}

    </div>
  );
};

export default AnimalDetailScreen;