import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { formatEGP } from '../../utils/money';
import { CARD_IMAGE_FALLBACKS, cmsImage } from '../../config/cmsFallbacks';
import styles from './BundlesSection.module.css';

export default function BundlesSection() {
  const { t, isAr } = useLanguage();
  const { content } = useSiteContent();
  const home = content?.home || {};
  const bundles = home.bundles || [];

  if (!bundles.length) return null;

  return (
    <section className={styles.section}>
      <div className={`section-pad ${styles.inner}`}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              {home.bundlesEyebrow || t('bundlesEyebrow')}
            </p>
            <h2 className={styles.title}>
              {home.bundlesTitle || t('bundlesTitle')}
            </h2>
          </div>
        </header>

        <div className={styles.list}>
          {bundles.map((bundle, i) => {
            const name = isAr ? bundle.nameAr || bundle.name : bundle.name;
            const desc = isAr ? bundle.descAr || bundle.desc : bundle.desc;
            const src = cmsImage(
              bundle.image,
              CARD_IMAGE_FALLBACKS[bundle.id]
            );
            return (
              <motion.article
                key={bundle.id || i}
                className={styles.row}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
              >
                <Link to={bundle.to || '/shop'} className={styles.link}>
                  <div className={styles.media}>
                    {src ? <img src={src} alt="" /> : null}
                    {bundle.save ? (
                      <span className={styles.saveTag}>
                        {t('bundleSave', { pct: bundle.save })}
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.body}>
                    <p className={styles.badge}>{t('bundleBadge')}</p>
                    <h3 className={styles.name}>{name}</h3>
                    <p className={styles.desc}>{desc}</p>
                  </div>
                  <div className={styles.aside}>
                    <div className={styles.prices}>
                      <p className={styles.price}>{formatEGP(bundle.price)}</p>
                      {bundle.compare ? (
                        <p className={styles.compare}>
                          {formatEGP(bundle.compare)}
                        </p>
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
      </div>
    </section>
  );
}
