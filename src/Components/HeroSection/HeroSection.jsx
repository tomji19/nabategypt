import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

import bamboo from '../../assets/images/hero-bamboo.jpeg';
import leather from '../../assets/images/leather-1-hero.jpeg';
import succulent1 from '../../assets/images/succulent-1-hero.png';
import succulent2 from '../../assets/images/succulent-2-hero.png';
import succulent3 from '../../assets/images/succulent-3-hero.png';
import pothos from '../../assets/images/pothos-hero.jpeg';

const enter = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const marqueeText = 'Indoor · Outdoor · Succulents · Nabat Egypt · ';

const trioItems = [
  { src: succulent1, alt: 'Succulent one', to: '/shop' },
  { src: succulent2, alt: 'Succulent two', to: '/shop' },
  { src: succulent3, alt: 'Succulent three', to: '/shop' },
];

export default function HeroSection() {
  return (
    <section className={`section-pad ${styles.hero}`}>
      <div className={styles.mosaic}>
        <motion.div
          className={styles.brand}
          custom={0}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <p className={styles.brandMeta}>Est. greenhouse</p>
          <h1 className={styles.brandWord}>Nabat</h1>
          <div>
            <p className={styles.brandCopy}>Delivering life to your doorstep.</p>
            <Link to="/shop" className={styles.cta}>
              Enter the shop
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.cell} ${styles.cellFeat}`}
          custom={1}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <Link to="/shop" className={`${styles.tile} ${styles.tileBamboo}`}>
            <img src={bamboo} alt="Lucky bamboo" className={styles.tileImg} />
            <div className={styles.marquee} aria-hidden>
              <div className={styles.marqueeBar}>
                <div className={styles.marqueeTrack}>
                  <span>{marqueeText.repeat(4)}</span>
                  <span>{marqueeText.repeat(4)}</span>
                </div>
              </div>
            </div>
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>Signature</p>
              <p className={styles.labelTitle}>Lucky bamboo</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          className={`${styles.cell} ${styles.cellFern}`}
          custom={2}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <Link to="/shop" className={`${styles.tile} ${styles.tileFern}`}>
            <img src={leather} alt="Leatherleaf fern" className={styles.tileImg} />
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>Indoor</p>
              <p className={styles.labelTitle}>Leatherleaf fern</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          className={`${styles.cell} ${styles.cellTrio}`}
          custom={3}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <div className={`${styles.tile} ${styles.tileTrio}`}>
            <div className={styles.trioRow}>
              {trioItems.map((item) => (
                <Link
                  key={item.alt}
                  to={item.to}
                  className={styles.trioItem}
                >
                  <img src={item.src} alt={item.alt} />
                </Link>
              ))}
            </div>
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>Trending Bundle</p>
              <p className={styles.labelTitle}>Desert trio</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.cell} ${styles.cellStrip}`}
          custom={4}
          variants={enter}
          initial="hidden"
          animate="show"
        >
          <Link to="/shop" className={`${styles.tile} ${styles.tileFern}`}>
            <img src={pothos} alt="Hanging pothos" className={styles.tileImg} />
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>Collection</p>
              <p className={styles.labelTitle}>Hanging pothos</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
