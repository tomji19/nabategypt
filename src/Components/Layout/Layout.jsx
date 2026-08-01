import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import PlantLoader from '../PlantLoader/PlantLoader';
import CartDrawer from '../CartDrawer/CartDrawer';
import AuthRedirectHandler from '../AuthRedirectHandler/AuthRedirectHandler';
import PlantChatbot from '../PlantChatbot/PlantChatbot';
import {
  resetBodyScroll,
  scrollWindowToTop,
} from '../../utils/scrollLock';

/**
 * Brief page-change flash. Must clear on cleanup so Back never leaves
 * a stuck overlay (timeout was previously cleared while visible stayed true).
 */
function RouteTransition() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 320);
    return () => {
      window.clearTimeout(t);
      setVisible(false);
    };
  }, [location.pathname, location.search]);

  if (!visible) return null;
  // No body lock — cosmetic only; locking caused stuck “loading” on back
  return <PlantLoader variant="overlay" lockScroll={false} />;
}

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    scrollWindowToTop();
    // Safety: never leave the page scroll-locked after a route change
    resetBodyScroll();
  }, [location.pathname, location.search]);

  useEffect(() => {
    resetBodyScroll();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <AuthRedirectHandler />
      <Navbar />
      <main className="flex-1">
        <RouteTransition />
        <Suspense fallback={<PlantLoader variant="overlay" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <PlantChatbot />
    </div>
  );
}
