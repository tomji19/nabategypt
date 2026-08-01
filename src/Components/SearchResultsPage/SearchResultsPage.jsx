import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import AddToCartButton from '../AddToCartButton/AddToCartButton';
import pageBanner from '../../assets/images/pagebanner.png';
import {
  getCategoryLabel,
  getProductName,
} from '../../utils/productLocale';

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query') || '';
  const { products } = useProducts();
  const { t, isAr } = useLanguage();
  const [hoveredProductId, setHoveredProductId] = useState(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return [];
    return (products || []).filter((product) => {
      const name = getProductName(product, { isAr, t }).toLowerCase();
      return (
        name.includes(q) ||
        product.name?.toLowerCase().includes(q) ||
        product.nameAr?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, isAr, t]);

  return (
    <>
      <section className="page-banner">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/60" />
        <div className="relative z-10">
          <p className="mb-2 font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
            {t('searchLabel')}
          </p>
          <h1 className="page-banner-title">&ldquo;{searchQuery}&rdquo;</h1>
        </div>
      </section>

      <div className="section-pad py-12 md:py-16">
        {searchResults.length === 0 ? (
          <p className="text-center font-body text-nabat-muted">
            {t('noPlantsFound')}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {searchResults.map((product) => {
              const name = getProductName(product, { isAr, t });
              return (
                <article
                  key={product.id}
                  className="border border-nabat-border bg-white"
                  onMouseEnter={() => setHoveredProductId(product.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => navigate(`/singleproduct/${product.id}`)}
                  >
                    <img
                      src={
                        hoveredProductId === product.id && product.hoverImage
                          ? product.hoverImage
                          : product.image
                      }
                      alt={name}
                      className="aspect-square w-full object-cover bg-nabat-mist"
                    />
                  </button>
                  <div className="p-4">
                    <p className="font-nav text-xs uppercase tracking-wider text-nabat-muted">
                      {getCategoryLabel(product.category, { t })}
                    </p>
                    <h2 className="font-heading text-lg font-medium">{name}</h2>
                    <div className="mt-3">
                      <AddToCartButton product={product} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
