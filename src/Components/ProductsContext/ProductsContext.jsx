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
      setSource('supabase');
    } catch (err) {
      console.error('Failed to load products from Supabase:', err);
      setProducts([]);
      setFeaturedProducts([]);
      setRecentProducts([]);
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
