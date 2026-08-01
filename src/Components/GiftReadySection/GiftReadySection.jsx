import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../PlantCard/PlantCard';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import styles from '../RecentProducts/RecentProducts.module.css';

export default function GiftReadySection() {
  const { giftProducts, featuredProducts, products } = useProducts();
  const { t } = useLanguage();

  const cards = useMemo(() => {
    const gifts = Array.isArray(giftProducts) ? giftProducts : [];
    if (gifts.length) return gifts.slice(0, 8);
    const featured = Array.isArray(featuredProducts) ? featuredProducts : [];
    if (featured.length) return featured.slice(0, 4);
    return (Array.isArray(products) ? products : []).slice(0, 4);
  }, [giftProducts, featuredProducts, products]);

  if (!cards.length) return null;

  return (
    <section className={styles.section}>
      <div className={`section-pad ${styles.inner}`}>
        <div className={styles.header}>
          <div>
            <p className="section-label">{t('giftReadyEyebrow')}</p>
            <h2 className="section-title">{t('giftReadyTitle')}</h2>
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
              product={{ ...product, isGift: true }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
