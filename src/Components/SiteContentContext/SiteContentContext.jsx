import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCmsLocalContent, loadSiteContent } from '../../supabase/cms';
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
  const [content, setContent] = useState(() => getCmsLocalContent());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { content: next } = await loadSiteContent();
      setContent(next);
    } catch {
      setContent(getCmsLocalContent());
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
