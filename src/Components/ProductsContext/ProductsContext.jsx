import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { fetchProducts } from '../../supabase/products';

const ProductsContext = createContext(null);

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return ctx;
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [giftProducts, setGiftProducts] = useState([]);
  const [easyCareProducts, setEasyCareProducts] = useState([]);
  const [source, setSource] = useState('supabase');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data.products || []);
      setFeaturedProducts(data.featuredProducts || []);
      setRecentProducts(data.recentProducts || []);
      setGiftProducts(data.giftProducts || []);
      setEasyCareProducts(data.easyCareProducts || []);
      setSource('supabase');
    } catch (err) {
      console.error('Failed to load products from Supabase:', err);
      setProducts([]);
      setFeaturedProducts([]);
      setRecentProducts([]);
      setGiftProducts([]);
      setEasyCareProducts([]);
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
