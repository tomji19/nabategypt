/* @refresh reload */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { loadSiteContent } from '../../supabase/cms';

const SiteContentContext = createContext(null);

const EMPTY = {};

/** Survives HMR remounts so the homepage does not flash empty images. */
let cachedContent = EMPTY;

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    return {
      content: cachedContent,
      refreshContent: () => {},
      patchContent: () => {},
      loading: false,
      error: null,
    };
  }
  return ctx;
}

/** Site CMS — Supabase only. No static default content. */
export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(cachedContent);
  const [loading, setLoading] = useState(() => cachedContent === EMPTY);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const load = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      if (requestIdRef.current === requestId) setLoading(false);
    }, 12000);
    try {
      const { content: next } = await loadSiteContent();
      if (requestId !== requestIdRef.current) return;
      const resolved = next && typeof next === 'object' ? next : EMPTY;
      cachedContent = resolved;
      setContent(resolved);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to load site content:', err);
      // Keep last good content — wiping to {} blanked all CMS images after HMR races
      setError(err?.message || 'Failed to load site content');
    } finally {
      window.clearTimeout(timer);
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const patchContent = (key, value) => {
    setContent((prev) => {
      const next = { ...prev, [key]: value };
      cachedContent = next;
      return next;
    });
  };

  useEffect(() => {
    load();
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  return (
    <SiteContentContext.Provider
      value={{ content, refreshContent: load, patchContent, loading, error }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}
