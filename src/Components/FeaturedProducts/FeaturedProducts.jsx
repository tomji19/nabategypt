import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PlantCard from '../PlantCard/PlantCard';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import styles from './FeaturedProducts.module.css';

function useVisibleCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1100) setCount(4);
      else if (w >= 720) setCount(2);
      else setCount(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return count;
}

export default function FeaturedProducts() {
  const { featuredProducts } = useProducts();
  const { content } = useSiteContent();
  const { t, isAr } = useLanguage();
  const home = content?.home || {};
  const featuredTitle = isAr
    ? t('featuredTitle')
    : home.featuredTitle || t('featuredTitle');
  const visible = useVisibleCount();

  const cards = useMemo(() => {
    const featured = Array.isArray(featuredProducts) ? featuredProducts : [];
    return featured;
  }, [featuredProducts]);

  const maxIndex = Math.max(0, cards.length - visible);
  const [index, setIndex] = useState(0);
  const pageCount = maxIndex + 1;

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex, visible]);

  const goTo = useCallback(
    (next) => {
      if (pageCount <= 1) return;
      const wrapped = ((next % pageCount) + pageCount) % pageCount;
      setIndex(wrapped);
    },
    [pageCount]
  );

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  if (!cards.length) return null;

  const slidePercent = 100 / visible;

  return (
    <section className={styles.section}>
      <div className={`section-pad ${styles.inner}`}>
        <div className={styles.header}>
          <div>
            <p className="section-label">{t('bestsellersEyebrow')}</p>
            <h2 className="section-title">
              {featuredTitle}
            </h2>
          </div>
          <div className={styles.headerAside}>
            <Link to="/shop" className={styles.shopLink}>
              {t('browsePlants')}
              <i className="fa-solid fa-arrow-right" aria-hidden />
            </Link>
          </div>
        </div>

        <div className={styles.slider}>
          <div className={styles.viewport}>
            <div
              className={styles.track}
              style={{
                transform: `translateX(-${index * slidePercent}%)`,
              }}
            >
              {cards.map((product) => (
                <div
                  key={product.id}
                  className={styles.slide}
                  style={{ flexBasis: `${slidePercent}%`, maxWidth: `${slidePercent}%` }}
                >
                  <PlantCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.controls}>
            <div className={styles.arrows}>
              <button
                type="button"
                className={styles.arrow}
                onClick={prev}
                disabled={pageCount <= 1}
                aria-label="Previous featured plants"
              >
                <i className="fa-solid fa-arrow-left" aria-hidden />
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={next}
                disabled={pageCount <= 1}
                aria-label="Next featured plants"
              >
                <i className="fa-solid fa-arrow-right" aria-hidden />
              </button>
            </div>

            <div className={styles.pagination} role="tablist" aria-label="Featured slides">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                  onClick={() => goTo(i)}
                >
                  <span className={styles.dotFill} />
                </button>
              ))}
            </div>

            <p className={styles.counter}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.counterSep}>/</span>
              <span>{String(pageCount).padStart(2, '0')}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
