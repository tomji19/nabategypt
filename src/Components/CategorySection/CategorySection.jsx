import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useCategories } from '../CategoriesContext/CategoriesContext';
import { CARD_IMAGE_FALLBACKS, cmsImage } from '../../config/cmsFallbacks';
import styles from './CategorySection.module.css';

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function shopPathForCategory(category) {
  const name = category?.name || '';
  return `/shop?category=${encodeURIComponent(name)}`;
}

export default function CategorySection() {
  const { t, isAr } = useLanguage();
  const { content } = useSiteContent();
  const { activeCategories } = useCategories();
  const home = content?.home || {};
  const categories = activeCategories || [];

  if (!categories.length) return null;

  const browseLabel = isAr
    ? t('browseLabel')
    : home.browseLabel || t('browseLabel');
  const browseTitle = isAr
    ? t('browseTitle')
    : home.browseTitle || t('browseTitle');
  const browseQuote = isAr
    ? t('browseQuote')
    : home.browseQuote || t('browseQuote');

  return (
    <section className={styles.section} aria-labelledby="collections-heading">
      <div className={`section-pad ${styles.inner}`}>
        <div className={styles.intro}>
          <header className={styles.header}>
            <p className={styles.label}>{browseLabel}</p>
            <h2 id="collections-heading" className={styles.title}>
              {browseTitle}
            </h2>
          </header>
          <p className={styles.quote}>{browseQuote}</p>
        </div>

        <motion.ul
          className={styles.grid}
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {categories.map((category, index) => {
            const label = isAr
              ? category.nameAr || category.name
              : category.name;
            const src = cmsImage(
              category.image,
              CARD_IMAGE_FALLBACKS[category.id]
            );

            return (
              <motion.li
                key={category.id || index}
                className={styles.cell}
                variants={itemVariants}
              >
                <Link to={shopPathForCategory(category)} className={styles.card}>
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      className={styles.image}
                      loading="lazy"
                    />
                  ) : (
                    <span className={styles.image} aria-hidden />
                  )}
                  <span className={styles.shade} aria-hidden="true" />
                  <span className={styles.index} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.footer}>
                    <span className={styles.name}>{label}</span>
                    <span className={styles.cta}>
                      {t('explore')}
                      <i className="fa-solid fa-arrow-right" aria-hidden />
                    </span>
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
