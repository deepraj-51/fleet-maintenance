// src/layout/AppLayout.jsx
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navLinkClass = ({ isActive }) =>
  `block min-h-10 rounded px-3 py-2 font-medium ${
    isActive ? 'bg-booked-bg text-action' : 'text-ink hover:bg-bg'
  }`;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const isManager = user?.role === 'FLEET_MANAGER';

  return (
    <div className="grid min-h-screen grid-cols-1 grid-rows-[auto_1fr] md:grid-cols-[220px_1fr]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-50 focus:rounded-br focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        Skip to main content
      </a>

      <header className="col-span-full flex items-center gap-4 bg-ink px-5 py-3 text-white">
        <button
          type="button"
          aria-expanded={navOpen}
          aria-controls="primary-nav"
          onClick={() => setNavOpen((open) => !open)}
          className="flex min-h-10 min-w-10 items-center justify-center rounded border border-white/30 md:hidden"
        >
          <span className="sr-only">{navOpen ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden="true">{navOpen ? '✕' : '☰'}</span>
        </button>
        <span className="text-base font-bold tracking-wide">FleetOps</span>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <span>{user?.fullName}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-white/40 px-3 py-1.5 hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </header>

      <nav
        id="primary-nav"
        aria-label="Primary"
        className={`fixed inset-y-0 left-0 z-40 w-[min(80vw,280px)] -translate-x-full border-r border-border bg-surface p-2 pt-4 shadow-lg transition-transform duration-150 md:static md:z-auto md:w-auto md:translate-x-0 md:shadow-none ${
          navOpen ? 'translate-x-0' : ''
        }`}
      >
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setNavOpen(false)}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/vehicles" className={navLinkClass} onClick={() => setNavOpen(false)}>
              Vehicles
            </NavLink>
          </li>
          <li>
            <NavLink to="/service-records" className={navLinkClass} onClick={() => setNavOpen(false)}>
              Service records
            </NavLink>
          </li>
          {isManager && (
            <li>
              <NavLink to="/bulk-upload" className={navLinkClass} onClick={() => setNavOpen(false)}>
                Bulk odometer upload
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <main id="main-content" tabIndex={-1} className="w-full max-w-6xl p-4 outline-none md:p-8">
        <Outlet />
      </main>
    </div>
  );
}