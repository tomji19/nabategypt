import React, { useState } from 'react';
import { STORE } from '../../config/store';
import BrandLogo from '../BrandLogo/BrandLogo';

const SESSION_KEY = 'nabat_dashboard_unlocked';

export function isDashboardUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function lockDashboard() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Password gate for /dashboard — no login account required */
export default function DashboardGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => isDashboardUnlocked());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === STORE.dashboardPassword) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
      setUnlocked(true);
      setError('');
      setPassword('');
    } else {
      setError('Wrong password');
    }
  };

  if (unlocked) {
    return children;
  }

  return (
    <div className="leaf-wash flex min-h-screen items-center justify-center section-pad">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-nabat-border bg-white p-8 md:p-10"
      >
        <BrandLogo className="mb-6" imgClassName="h-12 w-auto object-contain" />
        <p className="font-nav text-[11px] uppercase tracking-[0.2em] text-nabat-muted">
          Dashboard
        </p>
        <p className="mt-2 font-nav text-sm text-nabat-muted">
          Enter the dashboard password to continue.
        </p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="Password"
          className="input-box mt-6"
        />
        {error && (
          <p className="mt-2 font-nav text-sm text-red-600">{error}</p>
        )}
        <button type="submit" className="btn-primary mt-6 w-full">
          Unlock
        </button>
      </form>
    </div>
  );
}
