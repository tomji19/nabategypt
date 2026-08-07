import React, { useEffect } from 'react';
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import BrandLogo from '../BrandLogo/BrandLogo';

/**
 * Catches React Router route errors (including Vite CSS preload failures
 * that otherwise show "Unexpected Application Error!" on Netlify).
 */
export default function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText || String(error.status)
    : error?.message || String(error || 'Unknown error');

  const isCssPreload =
    /unable to preload css/i.test(message) ||
    /preload CSS/i.test(message);

  useEffect(() => {
    if (!isCssPreload || typeof window === 'undefined') return undefined;
    const key = 'nabat-css-preload-reload';
    if (sessionStorage.getItem(key)) return undefined;
    sessionStorage.setItem(key, '1');
    window.location.reload();
    return undefined;
  }, [isCssPreload]);

  return (
    <section className="leaf-wash section-pad flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <BrandLogo
        className="mb-10 opacity-80"
        imgClassName="h-12 w-auto object-contain"
      />
      <h1 className="font-heading text-2xl font-medium text-nabat-text md:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md font-body text-nabat-muted">
        {isCssPreload
          ? 'A style file failed to load (often after a new deploy). Refreshing usually fixes it.'
          : message}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
        <Link
          to="/"
          className="font-nav text-sm uppercase tracking-[0.12em] text-nabat-muted underline-offset-4 hover:text-nabat-primary hover:underline"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
