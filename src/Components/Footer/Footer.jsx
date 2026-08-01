import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo/BrandLogo';
import { STORE } from '../../config/store';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';

export default function Footer() {
  const { t, isAr } = useLanguage();
  const { content } = useSiteContent();
  const phone = content?.store?.phone || STORE.phone;
  const wa = `https://wa.me/2${String(phone).replace(/^0/, '')}`;
  const tagline = isAr
    ? t('delivering')
    : content?.footer?.tagline || t('delivering');
  const social = content?.store?.social || STORE.social || {};
  const socialLinks = [
    {
      id: 'facebook',
      icon: 'facebook',
      href: social.facebook || '#',
    },
    {
      id: 'instagram',
      icon: 'instagram',
      href: social.instagram || '#',
    },
    {
      id: 'whatsapp',
      icon: 'whatsapp',
      href: wa,
    },
  ];

  return (
    <footer className="leaf-wash mt-auto border-t border-nabat-border">
      <div className="section-pad py-10 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <BrandLogo
            to="/"
            className="mx-auto mb-3 justify-center"
            imgClassName="h-10 w-auto object-contain md:h-11"
          />
          <p className="font-body text-sm text-nabat-muted">{tagline}</p>
        </div>

        <div className="mt-8 grid gap-6 border-t border-nabat-border pt-8 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h3 className="section-label !mb-3">{t('explore')}</h3>
            <ul className="space-y-2 font-nav text-sm text-nabat-muted">
              <li>
                <Link to="/about" className="hover:text-nabat-primary">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-nabat-primary">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-nabat-primary">
                  {t('shop')}
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-nabat-primary">
                  {t('wishlist')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="sm:text-center">
            <h3 className="section-label !mb-3">{t('account')}</h3>
            <ul className="space-y-2 font-nav text-sm text-nabat-muted">
              <li>
                <Link to="/accountdetails" className="hover:text-nabat-primary">
                  {t('myAccount')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-nabat-primary">
                  {t('cart')}
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-nabat-primary">
                  {t('checkout')}
                </Link>
              </li>
              <li>
                <Link to="/orderhistory" className="hover:text-nabat-primary">
                  {t('orderHistory')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="sm:col-span-2 md:col-span-1 md:text-right">
            <h3 className="section-label !mb-3">{t('visit')}</h3>
            <p className="font-body text-sm leading-relaxed text-nabat-muted">
              {t('alexandria')}
              <br />
              <a
                href={`tel:${phone}`}
                className="text-nabat-primary hover:underline"
                dir="ltr"
              >
                {phone}
              </a>
            </p>
            <div className="mt-4 flex gap-1.5 sm:justify-start md:justify-end">
              {socialLinks.map((item) => {
                const external = item.href && item.href !== '#';
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    aria-label={item.id}
                    className="flex h-9 w-9 items-center justify-center border border-nabat-border text-nabat-primary transition-colors hover:bg-nabat-primary hover:text-white"
                  >
                    <i className={`fa-brands fa-${item.icon}`} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-nabat-border section-pad py-3">
        <a
          href="https://youssefashour.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 text-center font-nav text-[10px] uppercase tracking-[0.14em] text-nabat-muted transition-colors hover:text-nabat-primary sm:flex-row sm:justify-center sm:gap-3"
        >
          <BrandLogo imgClassName="h-5 w-auto object-contain opacity-80" />
          <span>
            © 2020–{new Date().getFullYear()} · {t('copyright')}
          </span>
        </a>
      </div>
    </footer>
  );
}
