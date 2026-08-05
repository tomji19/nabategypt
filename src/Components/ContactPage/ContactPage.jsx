import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { submitContactMessage } from '../../supabase/contactMessages';
import { cmsImage } from '../../config/cmsFallbacks';

const emptyForm = { name: '', email: '', message: '' };

export default function ContactPage() {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const contact = content?.contact || {};
  const shop = content?.shop || {};
  const phone = content?.store?.phone || '';
  const email = content?.store?.email || '';
  const wa = phone
    ? `https://wa.me/2${String(phone).replace(/^0/, '')}`
    : '#';
  const bannerSrc = cmsImage(shop.bannerImage || contact.bannerImage);
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await submitContactMessage(form);
      toast.success(t('messageSent'));
      setForm(emptyForm);
    } catch (err) {
      const msg = err?.message || '';
      if (/contact_messages|schema cache|does not exist/i.test(msg)) {
        toast.error(t('messageSchemaMissing'));
      } else {
        toast.error(msg || t('messageFailed'));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="page-banner min-h-[16rem] md:min-h-[20rem]">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-nabat-primary/55" />
        <div className="relative z-10">
          <p className="mb-2 font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
            {t('reachOut')}
          </p>
          <h1 className="page-banner-title">{t('contactTitle')}</h1>
        </div>
      </section>

      <section className="leaf-wash section-pad py-20 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <BrandLogo
              className="mb-8"
              imgClassName="h-12 w-auto object-contain"
            />
            <p className="section-label">
              {contact.eyebrow || t('contactEyebrow')}
            </p>
            <h2 className="section-title">
              {contact.title || t('contactHeading')}
            </h2>
            <p className="section-subtitle">
              {contact.subtitle || t('contactSubtitle')}
            </p>
            <div className="mt-10 space-y-6 font-nav text-sm">
              <div>
                <p className="section-label !mb-1">
                  {contact.locationLabel || t('location')}
                </p>
                <p className="text-nabat-text">
                  {contact.location || t('alexandria')}
                </p>
              </div>
              <div>
                <p className="section-label !mb-1">{t('phoneWhatsapp')}</p>
                <a
                  href={`tel:${phone}`}
                  className="text-nabat-accent hover:underline"
                  dir="ltr"
                >
                  {phone}
                </a>
              </div>
              <div>
                <p className="section-label !mb-1">{t('email')}</p>
                <a
                  href={`mailto:${email}`}
                  className="text-nabat-accent hover:underline"
                  dir="ltr"
                >
                  {email}
                </a>
              </div>
            </div>
            <div className="mt-10 flex gap-2">
              {['facebook', 'instagram', 'whatsapp'].map((n) => (
                <a
                  key={n}
                  href={n === 'whatsapp' ? wa : '#'}
                  target={n === 'whatsapp' ? '_blank' : undefined}
                  rel={n === 'whatsapp' ? 'noopener noreferrer' : undefined}
                  aria-label={n}
                  className="flex h-11 w-11 items-center justify-center border border-nabat-border text-nabat-primary transition-colors hover:bg-nabat-primary hover:text-white"
                >
                  <i className={`fa-brands fa-${n}`} />
                </a>
              ))}
            </div>
          </div>

          <div className="border border-nabat-border bg-white p-8 md:p-10">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <label className="section-label !mb-2" htmlFor="contact-name">
                  {t('name')}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={setField('name')}
                  className="input-field"
                  placeholder={t('yourName')}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="section-label !mb-2" htmlFor="contact-email">
                  {t('email')}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={setField('email')}
                  className="input-field"
                  placeholder={t('yourEmail')}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="section-label !mb-2" htmlFor="contact-message">
                  {t('message')}
                </label>
                <textarea
                  id="contact-message"
                  required
                  value={form.message}
                  onChange={setField('message')}
                  className="input-field min-h-[8rem] resize-y"
                  placeholder={t('howCanWeHelp')}
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full disabled:opacity-60"
                disabled={sending}
              >
                {sending ? t('sending') : t('sendMessage')}
              </button>
            </form>
            <Link
              to="/shop"
              className="mt-6 block text-center font-nav text-xs uppercase tracking-[0.14em] text-nabat-muted hover:text-nabat-accent"
            >
              {t('orContinueShopping')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
