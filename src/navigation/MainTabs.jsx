import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./MainTabs.css";

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: "/animals",
    label: "Animal Details",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 13c2.5 0 4.5-2 4.5-4.5S14.5 4 12 4 7.5 6 7.5 8.5 9.5 13 12 13z" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        <circle cx="5.5" cy="8" r="1.5" />
        <circle cx="18.5" cy="8" r="1.5" />
        <circle cx="5.5" cy="14" r="1.5" />
        <circle cx="18.5" cy="14" r="1.5" />
      </svg>
    ),
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    path: "/reports",
    label: "Report",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    path: "/notifications",
    label: "Notifications",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        {active && <circle cx="18" cy="5" r="3" fill="#6A7BFF" stroke="none" />}
      </svg>
    ),
  },
];

const EXTRA_NAV_ITEMS = [
  {
    path: "/schedule-template",
    label: "Schedule Template",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polyline points="10 14 12 16 16 12" />
      </svg>
    ),
  },
  {
    path: "/notification-template",
    label: "Notification Template",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22 6 12 13 2 6" />
      </svg>
    ),
  },
];

const ALL_NAV_ITEMS = [...NAV_ITEMS, ...EXTRA_NAV_ITEMS];

function SidebarNavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `sidebar__item ${isActive ? "sidebar__item--active" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          <span className="sidebar__item-icon">{item.icon(isActive)}</span>
          <span className="sidebar__item-label">{item.label}</span>
          {isActive && (
            <span className="sidebar__item-dot" aria-hidden="true" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function MainTabs() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentNav = ALL_NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
  const pageTitle = currentNav?.label ?? "FarmTrack";

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="sidebar__brand">Zetpetgo</span>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.path} item={item} />
          ))}

          <div className="sidebar__divider" />

          {EXTRA_NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.path} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`drawer ${drawerOpen ? "drawer--open" : ""}`}>
        <div className="drawer__header">
          <div className="sidebar__logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="sidebar__brand">FarmTrack</span>
          <button
            className="drawer__close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="drawer__nav">
          {EXTRA_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `drawer__item ${isActive ? "drawer__item--active" : ""}`
              }
              onClick={() => setDrawerOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <span className="drawer__item-icon">{item.icon(isActive)}</span>
                  <span className="drawer__item-label">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar__left">
            <button
              className="topbar__hamburger"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={22} height={22}>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="topbar__title">{pageTitle}</h1>
          </div>
          <div className="topbar__actions">
            <button className="topbar__btn" aria-label="Profile" onClick={() => navigate("/profile")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>

      {/* Bottom tab bar — mobile only, only main NAV_ITEMS */}
      <nav className="bottom-tabs" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `bottom-tabs__item ${isActive ? "bottom-tabs__item--active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="bottom-tabs__icon">{item.icon(isActive)}</span>
                <span className="bottom-tabs__label">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
