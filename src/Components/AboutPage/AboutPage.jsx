import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { cmsImage, SECTION_IMAGE_FALLBACKS } from '../../config/cmsFallbacks';
import styles from './AboutPage.module.css';

function storyParagraphs(text) {
  return String(text || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function AboutPage() {
  const { content } = useSiteContent();
  const { t, isAr } = useLanguage();
  const about = content?.about || {};
  const shop = content?.shop || {};

  const eyebrow = isAr ? t('aboutEyebrow') : about.eyebrow || t('aboutEyebrow');
  const title = isAr ? t('aboutHeading') : about.title || t('aboutHeading');
  /* Prefer i18n story so CMS stale copy does not hide the new narrative */
  const body = t('aboutBody');
  const paragraphs = storyParagraphs(body);
  const bannerSrc = cmsImage(
    shop.bannerImage,
    SECTION_IMAGE_FALLBACKS.pageBannerImage
  );
  const aboutImg = SECTION_IMAGE_FALLBACKS.aboutImage;

  return (
    <>
      <section className="page-banner min-h-[16rem] md:min-h-[20rem]">
        <img
          src={bannerSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/55" />
        <div className="relative z-10">
          <p className="mb-2 font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
            {t('ourStory')}
          </p>
          <h1 className="page-banner-title">{t('aboutTitle')}</h1>
        </div>
      </section>

      <section className={`section-pad ${styles.section}`}>
        <motion.div
          className={styles.story}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <BrandLogo
            className="mb-8"
            imgClassName="h-14 w-auto object-contain"
          />
          <p className="section-label">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
          <div className={styles.storyBody}>
            {paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
          <Link to="/shop" className="btn-primary mt-8 inline-flex">
            {t('shopPlants')}
          </Link>
        </motion.div>

        <motion.div
          className={styles.mediaWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.media}>
            <img src={aboutImg} alt="" />
          </div>
        </motion.div>
      </section>
    </>
  );
}
