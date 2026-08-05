/* @refresh reload */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { loadCategories } from '../../supabase/cms';

const CategoriesContext = createContext(null);

let cachedCategories = [];

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    return {
      categories: cachedCategories,
      activeCategories: cachedCategories.filter((c) => c.isActive !== false),
      refreshCategories: () => {},
      loading: false,
      error: null,
    };
  }
  return ctx;
}

/** Categories — Supabase only. No static defaults. */
export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(cachedCategories);
  const [loading, setLoading] = useState(() => !cachedCategories.length);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const { categories: next } = await loadCategories();
      if (requestId !== requestIdRef.current) return;
      const resolved = Array.isArray(next) ? next : [];
      cachedCategories = resolved;
      setCategories(resolved);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to load categories:', err);
      setError(err?.message || 'Failed to load categories');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  const activeCategories = useMemo(
    () => (categories || []).filter((c) => c.isActive !== false),
    [categories]
  );

  const value = useMemo(
    () => ({
      categories,
      activeCategories,
      refreshCategories: load,
      loading,
      error,
    }),
    [categories, activeCategories, load, loading, error]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}
