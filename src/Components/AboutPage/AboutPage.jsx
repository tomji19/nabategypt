import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import pageBanner from '../../assets/images/pagebanner.png';
import indoorImg from '../../assets/images/indoor.png';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';

export default function AboutPage() {
  const { content } = useSiteContent();
  const about = content?.about || {};

  return (
    <>
      <section className="page-banner min-h-[16rem] md:min-h-[20rem]">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/55" />
        <div className="relative z-10">
          <p className="mb-2 font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
            Our story
          </p>
          <h1 className="page-banner-title">About</h1>
        </div>
      </section>

      <section className="section-pad grid items-center gap-12 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <BrandLogo
            className="mb-8"
            imgClassName="h-14 w-auto object-contain"
          />
          <p className="section-label">
            {about.eyebrow || "Egypt's plant atelier"}
          </p>
          <h2 className="section-title">
            {about.title || 'Delivering life to your doorstep'}
          </h2>
          <p className="mt-6 font-body text-base leading-relaxed text-nabat-muted">
            {about.body ||
              'Thoughtfully chosen plants for modern homes — from quiet indoor greens to sun-loving outdoor companions. We curate with care so every plant arrives ready to thrive.'}
          </p>
          {about.bodyAr && (
            <p
              className="mt-4 font-body text-base leading-relaxed text-nabat-muted"
              dir="rtl"
            >
              {about.bodyAr}
            </p>
          )}
          <Link to="/shop" className="btn-primary mt-10 inline-flex">
            Shop plants
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="overflow-hidden bg-nabat-mist"
        >
          <img
            src={indoorImg}
            alt=""
            className="h-full w-full object-cover"
          />
        </motion.div>
      </section>
    </>
  );
}
