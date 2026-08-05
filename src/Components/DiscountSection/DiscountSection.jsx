import React from 'react';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { cmsImage } from '../../config/cmsFallbacks';

export default function DiscountSection() {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const src = cmsImage(content?.home?.discountImage);

  if (!src) return null;

  return (
    <section className="relative flex min-h-[28rem] items-center justify-center overflow-hidden md:min-h-[32rem]">
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover scale-105 transition-transform duration-[8s] ease-out hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-nabat-primary/55 via-nabat-primary/75 to-nabat-primary/85" />
      <div className="relative z-10 section-pad mx-auto max-w-xl py-20 text-center">
        <p className="mb-4 font-nav text-[11px] font-semibold uppercase tracking-[0.22em] text-nabat-mist/90">
          {t('offerEyebrow')}
        </p>
        <h2 className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-medium tracking-tight text-white">
          {t('offerTitle')}
        </h2>
        <p className="mx-auto mt-4 max-w-md font-body text-sm leading-relaxed text-white/80">
          {t('offerSubtitle')}
        </p>
        <form
          className="mx-auto mt-10 flex max-w-md border border-white/40 bg-white/5 backdrop-blur-sm"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            id="discount_email"
            name="floating_email"
            required
            placeholder={t('yourEmail')}
            className="w-full bg-transparent px-4 py-3.5 font-body text-sm text-white placeholder:text-white/55 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 bg-white px-6 py-3.5 font-nav text-[11px] font-semibold uppercase tracking-[0.14em] text-nabat-primary transition-colors hover:bg-nabat-mist"
          >
            {t('subscribe')}
          </button>
        </form>
        <p className="mx-auto mt-4 max-w-md font-nav text-[10px] uppercase tracking-[0.14em] text-white/55">
          {t('offerFinePrint')}
        </p>
      </div>
    </section>
  );
}
