import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import outdoorImg from '../../assets/images/outdoorplants.png';
import succulentsImg from '../../assets/images/succulents.png';
import indoorImg from '../../assets/images/indoor.png';
import careToolsImg from '../../assets/images/caretools.png';
import potsImg from '../../assets/images/pots.png';

const categories = [
  { name: 'Indoor', image: indoorImg, wide: true },
  { name: 'Outdoor', image: outdoorImg, wide: false },
  { name: 'Succulents', image: succulentsImg, wide: false },
  { name: 'Care Tools', image: careToolsImg, wide: false },
  { name: 'Pots', image: potsImg, wide: false },
];

export default function CategorySection() {
  return (
    <section className="leaf-wash section-pad py-20 md:py-28">
      <div className="mb-12 md:mb-16">
        <p className="section-label">Browse</p>
        <h2 className="section-title">Find your plant</h2>
        <p className="section-subtitle">
          From sunlit balconies to quiet corners indoors
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:pb-0">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className={`min-w-[70vw] shrink-0 sm:min-w-[45vw] md:min-w-0 ${
              cat.wide ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2'
            }`}
          >
            <Link
              to="/shop"
              className={`group relative block overflow-hidden ${
                cat.wide ? 'aspect-[3/4] md:h-full md:min-h-[28rem]' : 'aspect-[4/3]'
              }`}
            >
              <img
                src={cat.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nabat-primary/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <h3 className="font-heading text-xl font-medium text-white md:text-2xl">
                  {cat.name}
                </h3>
                <span className="mt-1 block font-nav text-[10px] uppercase tracking-[0.18em] text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                  Explore
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
