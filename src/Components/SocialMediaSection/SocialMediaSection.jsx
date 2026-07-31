import React from 'react';
import socialMediaImage from '../../assets/images/socialmedia.png';
import BrandLogo from '../BrandLogo/BrandLogo';
import { STORE } from '../../config/store';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';

export default function SocialMediaSection() {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const home = content?.home || {};
  const phone = content?.store?.phone || STORE.phone;
  const wa = `https://wa.me/2${String(phone).replace(/^0/, '')}`;

  return (
    <section className="grid md:grid-cols-2">
      <div className="leaf-wash section-pad flex flex-col justify-center py-16 md:py-24">
        <BrandLogo className="mb-6" imgClassName="h-10 w-auto object-contain" />
        <p className="section-label">{t('community')}</p>
        <h2 className="section-title">
          {home.socialTitle || t('socialTitle')}
        </h2>
        <p className="section-subtitle">
          {home.socialSubtitle || t('socialSubtitle')}
        </p>
        <div className="mt-10 flex gap-2">
          {['facebook', 'instagram', 'youtube', 'whatsapp'].map((n) => (
            <a
              key={n}
              href={n === 'whatsapp' ? wa : '#'}
              target={n === 'whatsapp' ? '_blank' : undefined}
              rel={n === 'whatsapp' ? 'noopener noreferrer' : undefined}
              aria-label={n}
              className="flex h-12 w-12 items-center justify-center border border-nabat-border text-nabat-primary transition-colors hover:border-nabat-primary hover:bg-nabat-primary hover:text-white"
            >
              <i className={`fa-brands fa-${n}`} />
            </a>
          ))}
        </div>
      </div>
      <div className="relative min-h-[18rem] md:min-h-full">
        <img
          src={socialMediaImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
