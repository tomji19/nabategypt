import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import bamboo from '../../assets/images/hero-bamboo.jpeg';
import leather from '../../assets/images/leather-1-hero.jpeg';
import succulent1 from '../../assets/images/succulent-1-hero.png';
import succulent2 from '../../assets/images/succulent-2-hero.png';
import succulent3 from '../../assets/images/succulent-3-hero.png';
import pothos from '../../assets/images/pothos-hero.jpeg';

const enter = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const trioItems = [
  { src: succulent1, altKey: 'heroDesertTrio', to: '/shop' },
  { src: succulent2, altKey: 'heroDesertTrio', to: '/shop' },
  { src: succulent3, altKey: 'heroDesertTrio', to: '/shop' },
];

export default function HeroSection() {
  const { content } = useSiteContent();
  const { t } = useLanguage();
  const hero = content?.hero || {};
  const marqueeText = t('marquee');

  return (
    <section className={`section-pad ${styles.hero}`}>
      <div className={styles.mosaic}>
        <motion.div
          className={styles.brand}
          custom={0}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <p className={styles.brandMeta}>
            {hero.eyebrow || t('heroEyebrow')}
          </p>
          <BrandLogo
            className={styles.brandLogoWrap}
            imgClassName={styles.brandLogo}
          />
          <div>
            <p className={styles.brandCopy}>
              {hero.tagline || t('heroTagline')}
            </p>
            <Link to="/shop" className={styles.cta}>
              {hero.cta || t('heroCta')}
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.cell} ${styles.cellFeat}`}
          custom={1}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <Link to="/shop" className={`${styles.tile} ${styles.tileBamboo}`}>
            <img src={bamboo} alt={t('heroLuckyBamboo')} className={styles.tileImg} />
            <div className={styles.marquee} aria-hidden>
              <div className={styles.marqueeBar}>
                <div className={styles.marqueeTrack}>
                  <span>{marqueeText.repeat(4)}</span>
                  <span>{marqueeText.repeat(4)}</span>
                </div>
              </div>
            </div>
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{t('heroSignature')}</p>
              <p className={styles.labelTitle}>{t('heroLuckyBamboo')}</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          className={`${styles.cell} ${styles.cellFern}`}
          custom={2}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <Link to="/shop" className={`${styles.tile} ${styles.tileFern}`}>
            <img src={leather} alt={t('heroLeatherleaf')} className={styles.tileImg} />
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{t('heroIndoor')}</p>
              <p className={styles.labelTitle}>{t('heroLeatherleaf')}</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          className={`${styles.cell} ${styles.cellTrio}`}
          custom={3}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <div className={`${styles.tile} ${styles.tileTrio}`}>
            <div className={styles.trioRow}>
              {trioItems.map((item, i) => (
                <Link
                  key={i}
                  to={item.to}
                  className={styles.trioItem}
                >
                  <img src={item.src} alt={t(item.altKey)} />
                </Link>
              ))}
            </div>
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{t('heroTrending')}</p>
              <p className={styles.labelTitle}>{t('heroDesertTrio')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.cell} ${styles.cellStrip}`}
          custom={4}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <Link to="/shop" className={`${styles.tile} ${styles.tileFern}`}>
            <img src={pothos} alt={t('heroHangingPothos')} className={styles.tileImg} />
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{t('heroCollection')}</p>
              <p className={styles.labelTitle}>{t('heroHangingPothos')}</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
