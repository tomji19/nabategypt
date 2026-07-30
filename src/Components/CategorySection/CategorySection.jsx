import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './CategorySection.module.css';

import outdoorImg from '../../assets/images/outdoorplants.png';
import succulentsImg from '../../assets/images/succulents.png';
import indoorImg from '../../assets/images/indoor.png';

const categories = [
  { name: 'Indoor', image: indoorImg },
  { name: 'Outdoor', image: outdoorImg },
  { name: 'Succulents', image: succulentsImg },
];

export default function CategorySection() {
  return (
    <section className="section-pad bg-white py-20 md:py-28">
      <div className="mb-12 md:mb-16">
        <p className="section-label">Browse</p>
        <h2 className="section-title">Find your plant</h2>
      </div>

      <div className={styles.layout}>
        <motion.blockquote
          className={styles.quote}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45 }}
        >
          <span className={styles.quoteMark} aria-hidden>
            “
          </span>
          <p>From sunlit balconies to quiet corners indoors</p>
        </motion.blockquote>

        <div className={styles.grid}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: 0.06 + i * 0.05 }}
            >
              <Link to="/shop" className={styles.item}>
                <div className={styles.stage}>
                  <span className={styles.halo} aria-hidden />
                  <img src={cat.image} alt="" className={styles.plant} />
                </div>
                <span className={styles.name}>{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
