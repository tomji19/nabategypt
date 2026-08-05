import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../PlantCard/PlantCard';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import styles from './RecentProducts.module.css';

export default function RecentProducts() {
  const { recentProducts } = useProducts();
  const { content } = useSiteContent();
  const { t, isAr } = useLanguage();
  const home = content?.home || {};
  const recentTitle = isAr
    ? t('recentTitle')
    : home.recentTitle || t('recentTitle');
  const recentSubtitle = isAr
    ? t('recentSubtitle')
    : home.recentSubtitle || t('recentSubtitle');

  const cards = useMemo(() => {
    const recent = Array.isArray(recentProducts) ? recentProducts : [];
    return recent.slice(0, 8);
  }, [recentProducts]);

  if (!cards.length) return null;

  return (
    <section className={styles.section}>
      <div className={`section-pad ${styles.inner}`}>
        <div className={styles.header}>
          <div>
            <p className="section-label">{t('justIn')}</p>
            <h2 className="section-title">
              {recentTitle}
            </h2>
          </div>
          <div className={styles.headerAside}>
            <p className={styles.subtitle}>
              {recentSubtitle}
            </p>
            <Link to="/shop" className={styles.shopLink}>
              {t('browsePlants')}
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
