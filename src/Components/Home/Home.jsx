import React from 'react';
import HeroSection from '../HeroSection/HeroSection';
import CategorySection from '../CategorySection/CategorySection';
import SeasonalPicksSection from '../SeasonalPicksSection/SeasonalPicksSection';
import EasyCareSection from '../EasyCareSection/EasyCareSection';
import BundlesSection from '../BundlesSection/BundlesSection';
import GiftReadySection from '../GiftReadySection/GiftReadySection';
// import DiscountSection from '../DiscountSection/DiscountSection';
import TestimonialSection from '../TestimonialSection/TestimonialSection';
import SocialMediaSection from '../SocialMediaSection/SocialMediaSection';
import FeaturedProducts from '../FeaturedProducts/FeaturedProducts';

/**
 * Merchandising order:
 * discover (seasonal) → ease first-timers → value (offers) → emotion (gifts) → trust (bestsellers)
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <SeasonalPicksSection />
      <EasyCareSection />
      <BundlesSection />
      <GiftReadySection />
      {/* <DiscountSection /> member perk — hidden for now */}
      <TestimonialSection />
      <FeaturedProducts />
      <SocialMediaSection />
    </>
  );
}
