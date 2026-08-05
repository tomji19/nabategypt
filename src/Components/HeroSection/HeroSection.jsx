import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';
import BrandLogo from '../BrandLogo/BrandLogo';
import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useProducts } from '../ProductsContext/ProductsContext';
import { cmsImage } from '../../config/cmsFallbacks';

const enter = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

function pick(isAr, en, ar, fallback) {
  if (isAr) return (ar && String(ar).trim()) || fallback || '';
  return (en && String(en).trim()) || fallback || '';
}

function productImage(product) {
  const img = product?.image;
  return typeof img === 'string' && img.trim() ? img.trim() : '';
}

/** CMS override if set; otherwise the catalog product photo. */
function heroSrc(cmsUrl, product) {
  return cmsImage(cmsUrl) || productImage(product);
}

function productHref(product, fallback = '/shop') {
  return product?.id ? `/singleproduct/${product.id}` : fallback;
}

export default function HeroSection() {
  const { content } = useSiteContent();
  const { t, isAr } = useLanguage();
  const { getProductById, products } = useProducts();
  const hero = content?.hero || {};
  const marqueeText = t('marquee');

  const bambooProduct = getProductById('bamboo');
  const snakeProduct = getProductById('snakeplant');
  const pothosProduct = getProductById('handingpothos');

  const eyebrow = pick(isAr, hero.eyebrow, hero.eyebrowAr, t('heroEyebrow'));
  const tagline = pick(isAr, hero.tagline, hero.taglineAr, t('heroTagline'));
  const cta = pick(isAr, hero.cta, hero.ctaAr, t('heroCta'));

  const bambooSrc = heroSrc(hero.bambooImage, bambooProduct);
  const snakeSrc = heroSrc(hero.snakeImage, snakeProduct);
  const pothosSrc = heroSrc(hero.pothosImage, pothosProduct);

  const trioItems = useMemo(() => {
    const fromCms = [
      { src: cmsImage(hero.trioImage1), to: '/shop?category=Succulent' },
      { src: cmsImage(hero.trioImage2), to: '/shop?category=Succulent' },
      { src: cmsImage(hero.trioImage3), to: '/shop?category=Succulent' },
    ].filter((item) => item.src);

    if (fromCms.length >= 3) return fromCms.slice(0, 3);

    const succulents = products
      .filter(
        (p) =>
          String(p.category || '')
            .toLowerCase()
            .includes('succulent') && productImage(p)
      )
      .sort((a, b) => {
        if (!!b.isFeatured !== !!a.isFeatured) return b.isFeatured ? 1 : -1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      })
      .slice(0, 3)
      .map((p) => ({
        src: productImage(p),
        to: productHref(p, '/shop?category=Succulent'),
      }));

    // Prefer CMS slots that exist, fill the rest from catalog
    if (fromCms.length) {
      const filled = [...fromCms];
      for (const item of succulents) {
        if (filled.length >= 3) break;
        if (!filled.some((f) => f.src === item.src)) filled.push(item);
      }
      return filled.slice(0, 3);
    }
    return succulents;
  }, [hero.trioImage1, hero.trioImage2, hero.trioImage3, products]);

  const bambooEyebrow = pick(
    isAr,
    hero.bambooEyebrow,
    hero.bambooEyebrowAr,
    t('heroSignature')
  );
  const bambooTitle = pick(
    isAr,
    hero.bambooTitle,
    hero.bambooTitleAr,
    t('heroLuckyBamboo')
  );
  const snakeEyebrow = pick(
    isAr,
    hero.snakeEyebrow,
    hero.snakeEyebrowAr,
    t('heroIndoor')
  );
  const snakeTitle = pick(
    isAr,
    hero.snakeTitle,
    hero.snakeTitleAr,
    t('heroSnakePlant')
  );
  const trioEyebrow = pick(
    isAr,
    hero.trioEyebrow,
    hero.trioEyebrowAr,
    t('heroTrending')
  );
  const trioTitle = pick(
    isAr,
    hero.trioTitle,
    hero.trioTitleAr,
    t('heroDesertTrio')
  );
  const pothosEyebrow = pick(
    isAr,
    hero.pothosEyebrow,
    hero.pothosEyebrowAr,
    t('heroCollection')
  );
  const pothosTitle = pick(
    isAr,
    hero.pothosTitle,
    hero.pothosTitleAr,
    t('heroHangingPothos')
  );

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
          <p className={styles.brandMeta}>{eyebrow}</p>
          <BrandLogo
            className={styles.brandLogoWrap}
            imgClassName={styles.brandLogo}
          />
          <div>
            <p className={styles.brandCopy}>{tagline}</p>
            <Link to="/shop" className={styles.cta}>
              {cta}
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
          <Link
            to={productHref(bambooProduct)}
            className={`${styles.tile} ${styles.tileBamboo}`}
          >
            {bambooSrc ? (
              <img
                src={bambooSrc}
                alt={bambooTitle}
                className={styles.tileImg}
              />
            ) : (
              <div className={styles.tileImg} aria-hidden />
            )}
            <div className={styles.marquee} aria-hidden>
              <div className={styles.marqueeBar}>
                <div className={styles.marqueeTrack}>
                  <span>{marqueeText.repeat(4)}</span>
                  <span>{marqueeText.repeat(4)}</span>
                </div>
              </div>
            </div>
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{bambooEyebrow}</p>
              <p className={styles.labelTitle}>{bambooTitle}</p>
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
          <Link
            to={productHref(snakeProduct)}
            className={`${styles.tile} ${styles.tileFern}`}
          >
            {snakeSrc ? (
              <img src={snakeSrc} alt={snakeTitle} className={styles.tileImg} />
            ) : (
              <div className={styles.tileImg} aria-hidden />
            )}
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{snakeEyebrow}</p>
              <p className={styles.labelTitle}>{snakeTitle}</p>
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
              {trioItems.map((item, i) => (
                <Link key={`${item.src}-${i}`} to={item.to} className={styles.trioItem}>
                  <img src={item.src} alt={trioTitle} />
                </Link>
              ))}
            </div>
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{trioEyebrow}</p>
              <p className={styles.labelTitle}>{trioTitle}</p>
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
          <Link
            to={productHref(pothosProduct)}
            className={`${styles.tile} ${styles.tileFern}`}
          >
            {pothosSrc ? (
              <img
                src={pothosSrc}
                alt={pothosTitle}
                className={styles.tileImg}
              />
            ) : (
              <div className={styles.tileImg} aria-hidden />
            )}
            <div className={styles.label}>
              <p className={styles.labelEyebrow}>{pothosEyebrow}</p>
              <p className={styles.labelTitle}>{pothosTitle}</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
