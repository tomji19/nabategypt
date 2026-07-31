import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import PlantLoader from '../PlantLoader/PlantLoader';
import CartDrawer from '../CartDrawer/CartDrawer';
import { scrollWindowToTop } from '../../utils/scrollLock';

function RouteTransition() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    scrollWindowToTop();
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      requestAnimationFrame(() => scrollWindowToTop());
    }, 420);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

  if (!visible) return null;
  return <PlantLoader variant="overlay" />;
}

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    scrollWindowToTop();
  }, [location.pathname, location.search]);

  // Hard safety on first mount in case a previous session left body locked
  useEffect(() => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <RouteTransition />
        <Suspense fallback={<PlantLoader variant="overlay" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
