import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../PlantCard/PlantCard';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import styles from '../RecentProducts/RecentProducts.module.css';

export default function EasyCareSection() {
  const { easyCareProducts, products } = useProducts();
  const { t } = useLanguage();

  const cards = useMemo(() => {
    const easy = Array.isArray(easyCareProducts) ? easyCareProducts : [];
    if (easy.length) return easy.slice(0, 8);
    return (Array.isArray(products) ? products : [])
      .filter(
        (p) =>
          p.isEasyCare || String(p.care || '').toLowerCase() === 'easy'
      )
      .slice(0, 8);
  }, [easyCareProducts, products]);

  if (!cards.length) return null;

  return (
    <section className={`${styles.section} ${styles.sectionSoft || ''}`}>
      <div className={`section-pad ${styles.inner}`}>
        <div className={styles.header}>
          <div>
            <p className="section-label">{t('easyCareEyebrow')}</p>
            <h2 className="section-title">{t('easyCareTitle')}</h2>
          </div>
          <div className={styles.headerAside}>
            <Link to="/shop?care=easy" className={styles.shopLink}>
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
