import React from 'react';
import HeroSection from '../HeroSection/HeroSection';
import CategorySection from '../CategorySection/CategorySection';
import RecentProducts from '../RecentProducts/RecentProducts';
import DiscountSection from '../DiscountSection/DiscountSection';
import TestimonialSection from '../TestimonialSection/TestimonialSection';
import SocialMediaSection from '../SocialMediaSection/SocialMediaSection';
import FeaturedProducts from '../FeaturedProducts/FeaturedProducts';

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <RecentProducts />
      <DiscountSection />
      <TestimonialSection />
      <FeaturedProducts />
      <SocialMediaSection />
    </>
  );
}
