/** Bundled asset fallbacks when CMS image URLs are empty */

import bamboo from '../assets/images/hero-bamboo.jpeg';
import snakePlant from '../assets/plantimages/indoor/snakeplant.jpg';
import succulent1 from '../assets/images/succulent-1-hero.png';
import succulent2 from '../assets/images/succulent-2-hero.png';
import succulent3 from '../assets/images/succulent-3-hero.png';
import pothos from '../assets/images/pothos-hero.jpeg';
import leather from '../assets/images/leather-1-hero.jpeg';
import outdoorImg from '../assets/images/outdoorplants.png';
import succulentsImg from '../assets/images/succulents.png';
import indoorImg from '../assets/images/indoor.png';
import discountImage from '../assets/images/discount.png';
import communityImage from '../assets/images/community-flowers.png';
import aboutImage from '../assets/images/about-succulent.png';
import pageBanner from '../assets/images/pagebanner.png';

export const HERO_IMAGE_FALLBACKS = {
  bambooImage: bamboo,
  snakeImage: snakePlant,
  trioImage1: succulent1,
  trioImage2: succulent2,
  trioImage3: succulent3,
  pothosImage: pothos,
};

export const SECTION_IMAGE_FALLBACKS = {
  discountImage,
  socialImage: communityImage,
  pageBannerImage: pageBanner,
  aboutImage,
};

export const CARD_IMAGE_FALLBACKS = {
  /* Prefer photographic assets so category tiles look full-bleed by default */
  indoor: pothos,
  outdoor: leather,
  succulent: succulent1,
  desert: succulentsImg,
  herbs: outdoorImg,
  mint: outdoorImg,
  basil: indoorImg,
  rosemary: succulentsImg,
  'new-home': indoorImg,
  'desk-calm': succulentsImg,
  balcony: outdoorImg,
};

/** Prefer CMS URL; otherwise use bundled fallback */
export function cmsImage(url, fallback) {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  return trimmed || fallback || '';
}
