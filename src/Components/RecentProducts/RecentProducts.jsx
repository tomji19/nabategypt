import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../PlantCard/PlantCard';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import styles from './RecentProducts.module.css';

export default function RecentProducts() {
  const { recentProducts, products } = useProducts();
  const { content } = useSiteContent();
  const { t } = useLanguage();
  const home = content?.home || {};

  const cards = useMemo(() => {
    const recent = Array.isArray(recentProducts) ? recentProducts : [];
    if (recent.length >= 8) return recent.slice(0, 8);

    const seen = new Set(recent.map((p) => p.id));
    const filler = (Array.isArray(products) ? products : []).filter(
      (p) => !seen.has(p.id)
    );
    return [...recent, ...filler].slice(0, 8);
  }, [recentProducts, products]);

  if (!cards.length) return null;

  return (
    <section className={styles.section}>
      <div className={`section-pad ${styles.inner}`}>
        <div className={styles.header}>
          <div>
            <p className="section-label">{t('justIn')}</p>
            <h2 className="section-title">
              {home.recentTitle || t('recentTitle')}
            </h2>
          </div>
          <div className={styles.headerAside}>
            <p className={styles.subtitle}>
              {home.recentSubtitle || t('recentSubtitle')}
            </p>
            <Link to="/shop" className={styles.shopLink}>
              View all
              <i className="fa-solid fa-arrow-right" aria-hidden />
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          {cards.map((product) => (
            <PlantCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
