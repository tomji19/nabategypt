import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext/LanguageContext';
import styles from './TestimonialSection.module.css';

const TESTIMONIAL_IDS = [1, 2, 3];

function Stars() {
  return (
    <div className={styles.stars} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className="fa-solid fa-star" />
      ))}
    </div>
  );
}

export default function TestimonialSection() {
  const { t } = useLanguage();

  const testimonials = TESTIMONIAL_IDS.map((n) => ({
    id: n,
    quote: t(`review${n}Text`),
    name: t(`review${n}Author`),
  }));

  return (
    <section className={styles.section} aria-labelledby="testimonials-heading">
      <div className={`section-pad ${styles.inner}`}>
        <header className={styles.header}>
          <p className={styles.label}>{t('wordsEyebrow')}</p>
          <h2 id="testimonials-heading" className={styles.title}>
            {t('wordsTitle')}
          </h2>
        </header>

        <ul className={styles.grid}>
          {testimonials.map((item, i) => (
            <motion.li
              key={item.id}
              className={styles.item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Stars />
              <blockquote className={styles.quote}>
                <p className={styles.text}>{item.quote}</p>
                <footer className={styles.footer}>
                  <cite className={styles.name}>{item.name}</cite>
                  <span className={styles.place}>{t('alexandria')}</span>
                </footer>
              </blockquote>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
