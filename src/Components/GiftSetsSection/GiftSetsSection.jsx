import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { formatEGP } from '../../utils/money';
import { CARD_IMAGE_FALLBACKS, cmsImage } from '../../config/cmsFallbacks';
import styles from '../CollectionCards/CollectionCards.module.css';

function splitParts(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function GiftSetsSection() {
  const { t, isAr } = useLanguage();
  const { content } = useSiteContent();
  const home = content?.home || {};
  const gifts = home.gifts || [];

  return (
    <section className={`section-pad ${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.header}>
        <p className="section-label">{home.giftsEyebrow || t('giftsEyebrow')}</p>
        <h2 className="section-title">{home.giftsTitle || t('giftsTitle')}</h2>
        <p className="section-subtitle">
          {home.giftsSubtitle || t('giftsSubtitle')}
        </p>
      </div>

      <div className={styles.grid}>
        {gifts.map((gift, i) => {
          const name = isAr ? gift.nameAr || gift.name : gift.name;
          const desc = isAr ? gift.descAr || gift.desc : gift.desc;
          const parts = splitParts(isAr ? gift.partsAr || gift.parts : gift.parts);
          const src = cmsImage(gift.image, CARD_IMAGE_FALLBACKS[gift.id]);
          return (
            <motion.article
              key={gift.id || i}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link to={gift.to || '/shop'} className={styles.link}>
                <div className={styles.media}>
                  <img src={src} alt="" />
                  <div className={styles.badgeRow}>
                    <span className={styles.typeBadge}>{t('giftBadge')}</span>
                  </div>
                </div>
                <div className={styles.body}>
                  <h3 className={styles.name}>{name}</h3>
                  <p className={styles.desc}>{desc}</p>
                  {parts.length > 0 && (
                    <div className={styles.parts}>
                      {parts.map((part) => (
                        <span key={part} className={styles.part}>
                          <i className="fa-solid fa-check" aria-hidden />
                          {part}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.priceRow}>
                    <p className={styles.price}>{formatEGP(gift.price)}</p>
                    {gift.compare ? (
                      <p className={styles.compare}>{formatEGP(gift.compare)}</p>
                    ) : null}
                  </div>
                  <span className={styles.cta}>
                    {t('shopBundle')}
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
