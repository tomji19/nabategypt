import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../PlantCard/PlantCard';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import styles from '../RecentProducts/RecentProducts.module.css';

export default function SeasonalPicksSection() {
  const { recentProducts } = useProducts();
  const { t } = useLanguage();

  const cards = useMemo(() => {
    const recent = Array.isArray(recentProducts) ? recentProducts : [];
    return recent.slice(0, 4);
  }, [recentProducts]);

  if (!cards.length) return null;

  return (
    <section className={styles.section}>
      <div className={`section-pad ${styles.inner}`}>
        <div className={styles.header}>
          <div>
            <p className="section-label">{t('seasonalEyebrow')}</p>
            <h2 className="section-title">{t('seasonalTitle')}</h2>
          </div>
          <div className={styles.headerAside}>
            <Link to="/shop" className={styles.shopLink}>
              {t('browsePlants')}
              <i className="fa-solid fa-arrow-right" aria-hidden />
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          {cards.map((product) => (
            <PlantCard
              key={product.id}
              product={{ ...product, isSeasonal: true, isRecent: true }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
