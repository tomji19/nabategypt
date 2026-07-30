import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import pageBanner from '../../assets/images/pagebanner.png';
import indoorImg from '../../assets/images/indoor.png';
import logo from '../../assets/images/logocolored.png';

export default function AboutPage() {
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
          <h1 className="page-banner-title">About Nabat</h1>
        </div>
      </section>

      <section className="section-pad grid items-center gap-12 py-20 md:grid-cols-2 md:gap-16 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={logo}
            alt="Nabat"
            className="mb-8 h-14 w-auto object-contain"
          />
          <p className="section-label">Egypt&apos;s plant atelier</p>
          <h2 className="section-title">
            Delivering life to your doorstep
          </h2>
          <p className="mt-6 font-body text-base leading-relaxed text-nabat-muted">
            Nabat brings thoughtfully chosen plants into modern homes —
            from quiet indoor greens to sun-loving outdoor companions.
            We curate with care so every plant arrives ready to thrive.
          </p>
          <Link to="/shop" className="btn-primary mt-10 inline-flex">
            Shop plants
          </Link>
        </motion.div>
        <div className="relative aspect-[4/5] overflow-hidden bg-nabat-mist">
          <img
            src={indoorImg}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </section>
    </>
  );
}
