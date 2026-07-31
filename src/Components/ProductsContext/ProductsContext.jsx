import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchProducts } from '../../supabase/products';
import { getProducts as getLocalProducts } from '../ProductData/ProductData';
import { getCmsLocalProducts } from '../../supabase/cms';

const ProductsContext = createContext(null);

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return ctx;
}

function fromCmsOrLocal() {
  const cms = getCmsLocalProducts();
  if (cms?.length) {
    const products = cms.filter((p) => p.isActive !== false);
    return {
      products,
      featuredProducts: products.filter((p) => p.isFeatured),
      recentProducts: products.filter((p) => p.isRecent),
      source: 'cms-local',
      getProductById: (id) =>
        products.find((p) => p.id === id || p.dbId === id) || null,
    };
  }
  return { ...getLocalProducts(), source: 'local' };
}

export function ProductsProvider({ children }) {
  const initial = fromCmsOrLocal();
  const [products, setProducts] = useState(initial.products);
  const [featuredProducts, setFeaturedProducts] = useState(
    initial.featuredProducts
  );
  const [recentProducts, setRecentProducts] = useState(initial.recentProducts);
  const [source, setSource] = useState(initial.source);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      if (data.source === 'supabase' && data.products?.length) {
        setProducts(data.products);
        setFeaturedProducts(
          data.featuredProducts?.length
            ? data.featuredProducts
            : data.products.filter((p) => p.isFeatured)
        );
        setRecentProducts(
          data.recentProducts?.length
            ? data.recentProducts
            : data.products.filter((p) => p.isRecent)
        );
        setSource('supabase');
      } else {
        const fallback = fromCmsOrLocal();
        setProducts(fallback.products);
        setFeaturedProducts(
          fallback.featuredProducts?.length
            ? fallback.featuredProducts
            : fallback.products.slice(0, 7)
        );
        setRecentProducts(
          fallback.recentProducts?.length
            ? fallback.recentProducts
            : fallback.products.slice(0, 4)
        );
        setSource(fallback.source);
      }
    } catch {
      const fallback = fromCmsOrLocal();
      setProducts(fallback.products);
      setFeaturedProducts(fallback.featuredProducts);
      setRecentProducts(fallback.recentProducts);
      setSource(fallback.source);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getProductById = (id) =>
    products.find((p) => p.id === id || p.dbId === id) || null;

  return (
    <ProductsContext.Provider
      value={{
        products,
        featuredProducts,
        recentProducts,
        getProductById,
        source,
        loading,
        refreshProducts: load,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
