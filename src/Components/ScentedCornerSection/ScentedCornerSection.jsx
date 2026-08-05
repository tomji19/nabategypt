import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { formatEGP } from '../../utils/money';
import { cmsImage } from '../../config/cmsFallbacks';
import styles from '../CollectionCards/CollectionCards.module.css';

export default function ScentedCornerSection() {
  const { t, isAr } = useLanguage();
  const { content } = useSiteContent();
  const home = content?.home || {};
  const scents = home.scents || [];

  if (!scents.length) return null;

  return (
    <section className={`section-pad ${styles.section}`}>
      <div className={styles.header}>
        <p className="section-label">{home.scentEyebrow || t('scentEyebrow')}</p>
        <h2 className="section-title">{home.scentTitle || t('scentTitle')}</h2>
        <p className="section-subtitle">
          {home.scentSubtitle || t('scentSubtitle')}
        </p>
      </div>

      <div className={styles.grid}>
        {scents.map((item, i) => {
          const name = isAr ? item.nameAr || item.name : item.name;
          const desc = isAr ? item.descAr || item.desc : item.desc;
          const src = cmsImage(item.image);
          return (
            <motion.article
              key={item.id || i}
              className={`${styles.card} ${styles.cardSoft}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link to={item.to || '/shop'} className={styles.link}>
                <div className={styles.media}>
                  <img src={src} alt="" />
                  <div className={styles.badgeRow}>
                    <span className={styles.typeBadge}>{t('scentBadge')}</span>
                  </div>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.name}>{name}</h3>
                  <p className={styles.desc}>{desc}</p>
                  <div className={styles.priceRow}>
                    <p className={styles.price}>{formatEGP(item.price)}</p>
                  </div>
                  <span className={styles.cta}>
                    {t('browsePlants')}
                    <span aria-hidden>↗</span>
                  </span>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
