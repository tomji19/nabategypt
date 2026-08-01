import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadSiteContent } from '../../supabase/cms';
import { DEFAULT_SITE_CONTENT } from '../../config/defaultContent';

const SiteContentContext = createContext(null);

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    return {
      content: DEFAULT_SITE_CONTENT,
      refreshContent: () => {},
      loading: false,
    };
  }
  return ctx;
}

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { content: next } = await loadSiteContent();
      setContent(next);
    } catch (err) {
      console.error('Failed to load site content:', err);
      setContent(DEFAULT_SITE_CONTENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SiteContentContext.Provider
      value={{ content, refreshContent: load, loading }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}
