import React from 'react';
import classes from '../Layout/Layout.module.css';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import SecondaryNavbar from '../SecondaryNavbar/SecondaryNavbar';
import ThirdNavbar from '../ThirdNavbar/ThirdNavbar';
import HeroSection from '../HeroSection/HeroSection';
import CategorySection from '../CategorySection/CategorySection';
import RecentProducts from '../RecentProducts/RecentProducts';
import DiscountSection from '../DiscountSection/DiscountSection';
import TestimonialSection from '../TestimonialSection/TestimonialSection';
import SocialMediaSection from '../SocialMediaSection/SocialMediaSection';
import FeaturedProducts from '../FeaturedProducts/FeaturedProducts';

export default function Layout() {
  return (
    <>
      <SecondaryNavbar />
      <Navbar />
      <ThirdNavbar />
      <Outlet />
      <Footer />
    </>
  );
}
