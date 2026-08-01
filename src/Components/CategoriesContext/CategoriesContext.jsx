import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadCategories } from '../../supabase/cms';
import { DEFAULT_CATEGORIES } from '../../config/defaultContent';

const CategoriesContext = createContext(null);

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    return {
      categories: DEFAULT_CATEGORIES,
      activeCategories: DEFAULT_CATEGORIES.filter((c) => c.isActive !== false),
      refreshCategories: () => {},
      loading: false,
    };
  }
  return ctx;
}

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { categories: next } = await loadCategories();
      setCategories(next?.length ? next : DEFAULT_CATEGORIES);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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
    }),
    [categories, activeCategories, load, loading]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}
