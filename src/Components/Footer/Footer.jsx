import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../BrandLogo/BrandLogo';
import { STORE } from '../../config/store';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';

export default function Footer() {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const phone = content?.store?.phone || STORE.phone;
  const wa = `https://wa.me/2${String(phone).replace(/^0/, '')}`;

  return (
    <footer className="leaf-wash mt-auto border-t border-nabat-border">
      <div className="section-pad py-10 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <BrandLogo
            to="/"
            className="mx-auto mb-3 justify-center"
            imgClassName="h-10 w-auto object-contain md:h-11"
          />
          <p className="font-body text-sm text-nabat-muted">
            {content?.footer?.tagline || t('delivering')}
          </p>

          <div className="mt-5 flex justify-center gap-1.5">
            {['facebook', 'instagram', 'youtube', 'whatsapp'].map((network) => (
              <a
                key={network}
                href={network === 'whatsapp' ? wa : '#'}
                target={network === 'whatsapp' ? '_blank' : undefined}
                rel={network === 'whatsapp' ? 'noopener noreferrer' : undefined}
                aria-label={network}
                className="flex h-9 w-9 items-center justify-center text-nabat-primary transition-colors hover:bg-nabat-primary hover:text-white"
              >
                <i className={`fa-brands fa-${network}`} />
              </a>
            ))}
          </div>
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
