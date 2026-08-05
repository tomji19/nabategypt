import React from 'react';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { cmsImage } from '../../config/cmsFallbacks';
import styles from './SocialMediaSection.module.css';

function whatsappHref(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '#';
  const local = digits.replace(/^20/, '').replace(/^0/, '');
  return `https://wa.me/20${local}`;
}

export default function SocialMediaSection() {
  const { t, isAr } = useLanguage();
  const { content } = useSiteContent();
  const home = content?.home || {};
  const store = content?.store || {};
  const socialTitle = isAr
    ? t('socialTitle')
    : home.socialTitle || t('socialTitle');
  const socialSubtitle = isAr
    ? t('socialSubtitle')
    : home.socialSubtitle || t('socialSubtitle');
  const socialSrc = cmsImage(home.socialImage);
  const phone = store.phone || '';

  return (
    <section className={styles.section} aria-labelledby="community-heading">
      <div className={`section-pad ${styles.inner}`}>
        <div className={styles.copy}>
          <BrandLogo className={styles.logo} imgClassName="h-10 w-auto object-contain" />
          <p className="section-label">{t('community')}</p>
          <h2 id="community-heading" className="section-title">
            {socialTitle}
          </h2>
          <p className="section-subtitle">{socialSubtitle}</p>
          <ul className={styles.points}>
            <li className={styles.point}>
              <i className="fa-solid fa-seedling" aria-hidden />
              {t('communityPoint1')}
            </li>
            <li className={styles.point}>
              <i className="fa-solid fa-hand-holding-heart" aria-hidden />
              {t('communityPoint2')}
            </li>
            <li className={styles.point}>
              <i className="fa-solid fa-box-open" aria-hidden />
              {t('communityPoint3')}
            </li>
          </ul>
          <div className={styles.actions}>
            <a
              href={whatsappHref(phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {t('contactUs')}
            </a>
          </div>
        </div>

        {socialSrc ? (
          <div className={styles.mediaWrap}>
            <figure className={styles.media}>
              <img src={socialSrc} alt="" />
              <span className={styles.mediaFrame} aria-hidden />
            </figure>
          </div>
        ) : null}
      </div>
    </section>
  );
}
