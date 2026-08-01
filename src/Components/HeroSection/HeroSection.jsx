import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { cmsImage, HERO_IMAGE_FALLBACKS } from '../../config/cmsFallbacks';

const enter = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

function pick(isAr, en, ar, fallback) {
  if (isAr) return (ar && String(ar).trim()) || fallback;
  return (en && String(en).trim()) || fallback;
}

export default function HeroSection() {
  const { content } = useSiteContent();
  const { t, isAr } = useLanguage();
  const hero = content?.hero || {};
  const marqueeText = t('marquee');

  const eyebrow = pick(isAr, hero.eyebrow, hero.eyebrowAr, t('heroEyebrow'));
  const tagline = pick(isAr, hero.tagline, hero.taglineAr, t('heroTagline'));
  const cta = pick(isAr, hero.cta, hero.ctaAr, t('heroCta'));

  const bambooSrc = cmsImage(hero.bambooImage, HERO_IMAGE_FALLBACKS.bambooImage);
  const snakeSrc = cmsImage(hero.snakeImage, HERO_IMAGE_FALLBACKS.snakeImage);
  const pothosSrc = cmsImage(hero.pothosImage, HERO_IMAGE_FALLBACKS.pothosImage);
  const trioItems = [
    cmsImage(hero.trioImage1, HERO_IMAGE_FALLBACKS.trioImage1),
    cmsImage(hero.trioImage2, HERO_IMAGE_FALLBACKS.trioImage2),
    cmsImage(hero.trioImage3, HERO_IMAGE_FALLBACKS.trioImage3),
  ];

  const bambooEyebrow = pick(
    isAr,
    hero.bambooEyebrow,
    hero.bambooEyebrowAr,
    t('heroSignature')
  );
  const bambooTitle = pick(
    isAr,
    hero.bambooTitle,
    hero.bambooTitleAr,
    t('heroLuckyBamboo')
  );
  const snakeEyebrow = pick(
    isAr,
    hero.snakeEyebrow,
    hero.snakeEyebrowAr,
    t('heroIndoor')
  );
  const snakeTitle = pick(
    isAr,
    hero.snakeTitle,
    hero.snakeTitleAr,
    t('heroSnakePlant')
  );
  const trioEyebrow = pick(
    isAr,
    hero.trioEyebrow,
    hero.trioEyebrowAr,
    t('heroTrending')
  );
  const trioTitle = pick(
    isAr,
    hero.trioTitle,
    hero.trioTitleAr,
    t('heroDesertTrio')
  );
  const pothosEyebrow = pick(
    isAr,
    hero.pothosEyebrow,
    hero.pothosEyebrowAr,
    t('heroCollection')
  );
  const pothosTitle = pick(
    isAr,
    hero.pothosTitle,
    hero.pothosTitleAr,
    t('heroHangingPothos')
  );

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
          <p className={styles.brandMeta}>{eyebrow}</p>
          <BrandLogo
            className={styles.brandLogoWrap}
            imgClassName={styles.brandLogo}
          />
          <div>
            <p className={styles.brandCopy}>{tagline}</p>
            <Link to="/shop" className={styles.cta}>
              {cta}
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
            <img src={bambooSrc} alt={bambooTitle} className={styles.tileImg} />
            <div className={styles.marquee} aria-hidden>
              <div className={styles.marqueeBar}>
                <div className={styles.marqueeTrack}>
                  <span>{marqueeText.repeat(4)}</span>
                  <span>{marqueeText.repeat(4)}</span>
                </div>
              </div>
            </div>
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{bambooEyebrow}</p>
              <p className={styles.labelTitle}>{bambooTitle}</p>
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
            <img src={snakeSrc} alt={snakeTitle} className={styles.tileImg} />
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{snakeEyebrow}</p>
              <p className={styles.labelTitle}>{snakeTitle}</p>
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
              {trioItems.map((src, i) => (
                <Link key={i} to="/shop" className={styles.trioItem}>
                  <img src={src} alt={trioTitle} />
                </Link>
              ))}
            </div>
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{trioEyebrow}</p>
              <p className={styles.labelTitle}>{trioTitle}</p>
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
            <img src={pothosSrc} alt={pothosTitle} className={styles.tileImg} />
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{pothosEyebrow}</p>
              <p className={styles.labelTitle}>{pothosTitle}</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
