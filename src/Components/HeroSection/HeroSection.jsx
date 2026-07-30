import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '../../assets/images/herosection.png';
import logo from '../../assets/images/logocolored.png';
import newArrivals from '../../assets/images/newarrivals.png';
import bestSelling from '../../assets/images/bestselling.png';

export default function HeroSection() {
  return (
    <>
      <section className="relative flex min-h-[100svh] w-full items-end overflow-hidden md:items-center">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nabat-primary/85 via-nabat-primary/35 to-nabat-primary/15 md:bg-gradient-to-r md:from-nabat-primary/80 md:via-nabat-primary/40 md:to-transparent" />

        <div className="relative z-10 section-pad w-full pb-16 pt-28 md:pb-24 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <img
              src={logo}
              alt="Nabat"
              className="mb-6 h-12 w-auto brightness-0 invert md:h-14"
            />
            <p className="font-heading text-hero font-medium text-white">Nabat</p>
            <h1 className="mt-4 max-w-md font-heading text-xl font-normal tracking-wide text-white/90 md:text-2xl">
              Plants for modern living
            </h1>
            <p className="mt-4 max-w-sm font-body text-base text-white/75">
              Delivering life to your doorstep
            </p>
            <Link to="/shop" className="btn-ghost mt-10 inline-flex">
              Shop the collection
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        {[
          { img: newArrivals, title: 'New Arrivals', to: '/shop' },
          { img: bestSelling, title: 'Best Selling', to: '/shop' },
        ].map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="group relative flex min-h-[11rem] items-center justify-between overflow-hidden border-b border-white/10 px-6 py-10 md:min-h-[13rem] md:px-12"
          >
            <img
              src={item.img}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-nabat-primary/55 transition-colors group-hover:bg-nabat-primary/45" />
            <span className="relative z-10 font-heading text-2xl font-medium text-white md:text-3xl">
              {item.title}
            </span>
            <span className="relative z-10 font-nav text-[11px] uppercase tracking-[0.2em] text-white/80">
              Shop →
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
