/* @refresh reload */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { fetchProducts } from '../../supabase/products';

const ProductsContext = createContext(null);

let cachedCatalog = {
  products: [],
  featuredProducts: [],
  recentProducts: [],
  giftProducts: [],
  easyCareProducts: [],
  source: 'supabase',
};

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return ctx;
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(cachedCatalog.products);
  const [featuredProducts, setFeaturedProducts] = useState(
    cachedCatalog.featuredProducts
  );
  const [recentProducts, setRecentProducts] = useState(
    cachedCatalog.recentProducts
  );
  const [giftProducts, setGiftProducts] = useState(cachedCatalog.giftProducts);
  const [easyCareProducts, setEasyCareProducts] = useState(
    cachedCatalog.easyCareProducts
  );
  const [source, setSource] = useState(cachedCatalog.source);
  const [loading, setLoading] = useState(() => !cachedCatalog.products.length);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const applyCatalog = (data) => {
    const next = {
      products: data.products || [],
      featuredProducts: data.featuredProducts || [],
      recentProducts: data.recentProducts || [],
      giftProducts: data.giftProducts || [],
      easyCareProducts: data.easyCareProducts || [],
      source: 'supabase',
    };
    cachedCatalog = next;
    setProducts(next.products);
    setFeaturedProducts(next.featuredProducts);
    setRecentProducts(next.recentProducts);
    setGiftProducts(next.giftProducts);
    setEasyCareProducts(next.easyCareProducts);
    setSource(next.source);
  };

  const load = async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      if (requestIdRef.current === requestId) setLoading(false);
    }, 12000);
    try {
      const data = await fetchProducts();
      if (requestId !== requestIdRef.current) return;
      applyCatalog(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to load products from Supabase:', err);
      setError(err?.message || 'Failed to load products');
    } finally {
      window.clearTimeout(timer);
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  const getProductById = useCallback(
    (id) => products.find((p) => p.id === id || p.dbId === id) || null,
    [products]
  );

  return (
    <ProductsContext.Provider
      value={{
        products,
        featuredProducts,
        recentProducts,
        giftProducts,
        easyCareProducts,
        getProductById,
        source,
        loading,
        error,
        refreshProducts: load,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
