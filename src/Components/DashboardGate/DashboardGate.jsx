import React, { useState } from 'react';
import { STORE } from '../../config/store';
import BrandLogo from '../BrandLogo/BrandLogo';

const UNLOCK_KEY = 'nabat-dashboard-unlock';

function readUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

function writeUnlocked(value) {
  try {
    if (value) sessionStorage.setItem(UNLOCK_KEY, '1');
    else sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* private mode / blocked storage */
  }
}

/** Password gate for /dashboard — unlock once per browser tab (sessionStorage). */
export default function DashboardGate({ children }) {
  const [unlocked, setUnlocked] = useState(readUnlocked);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === STORE.dashboardPassword) {
      writeUnlocked(true);
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
          type="text"
          name="username"
          autoComplete="username"
          value="nabat-dashboard"
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />
        <input
          type="password"
          name="dashboard-password"
          autoComplete="current-password"
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

export function isDashboardUnlocked() {
  return readUnlocked();
}

export function lockDashboard() {
  writeUnlocked(false);
}
