import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logoNoBackground from '../../assets/images/logocolored.png';
import cartIcon from '../../assets/images/cart.svg';
import userIcon from '../../assets/images/user.svg';
import { useCart } from '../CartContext/CartContext';
import { useAuth } from '../AuthContext/AuthContext';
import { doSignOut } from '../../supabase/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const {
    currentUser,
    userDetails,
    userLoggedIn,
    anonymousUserName,
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await doSignOut();
      localStorage.removeItem('token');
      localStorage.removeItem('guestCart');
      localStorage.removeItem('userAddresses');
      localStorage.removeItem('userDetails');
      clearCart();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('guestCart');
      localStorage.removeItem('userAddresses');
      localStorage.removeItem('userDetails');
      clearCart();
      navigate('/login');
    }
  };

  const getUserDisplayName = () => {
    if (!userLoggedIn) return null;
    if (anonymousUserName) return anonymousUserName;
    if (userDetails?.name) return userDetails.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Guest';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setMobileOpen(false);
    }
  };

  const linkClass = ({ isActive }) =>
    `font-nav text-[13px] uppercase tracking-[0.12em] transition-colors hover:text-nabat-accent ${
      isActive ? 'text-nabat-accent' : 'text-nabat-text'
    }`;

  const categories = [
    'Succulents',
    'Indoor Plants',
    'Outdoor Plants',
    'Pots',
    'Care Tools',
  ];

  const displayName = getUserDisplayName();

  return (
    <header className="site-header">
      {/* Micro promo + auth */}
      <div className="border-b border-nabat-border/60 bg-nabat-primary text-white">
        <div className="section-pad flex flex-wrap items-center justify-between gap-2 py-2">
          <p className="font-nav text-[11px] font-medium uppercase tracking-[0.16em]">
            Get 30% off your first order
          </p>
          <div className="flex items-center gap-3 font-nav text-[11px] uppercase tracking-[0.12em]">
            {userLoggedIn ? (
              <>
                <span className="text-white/70">Hello, {displayName}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-white transition-opacity hover:opacity-70"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="transition-opacity hover:opacity-70">
                  Login
                </Link>
                <span className="text-white/40">/</span>
                <Link to="/register" className="transition-opacity hover:opacity-70">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="section-pad py-3 md:py-4">
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-nabat-primary lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-lg`} />
          </button>

          <Link to="/" className="shrink-0">
            <img
              src={logoNoBackground}
              alt="Nabat"
              className="h-10 w-auto object-contain md:h-12"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen((o) => !o)}
                className="font-nav text-[13px] uppercase tracking-[0.12em] text-nabat-text transition-colors hover:text-nabat-accent"
              >
                Categories
                <i className="fa-solid fa-chevron-down ml-1.5 text-[9px]" />
              </button>
              {categoriesOpen && (
                <ul className="absolute left-0 top-full z-50 mt-3 min-w-[12rem] border border-nabat-border bg-white py-2 shadow-lg">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <NavLink
                        to={`/category/${cat.toLowerCase().replace(' ', '-')}`}
                        className="block px-4 py-2.5 font-nav text-sm text-nabat-text hover:bg-nabat-mist hover:text-nabat-primary"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {cat}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={linkClass}>
              Shop
            </NavLink>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <form
              onSubmit={handleSearch}
              className="hidden max-w-[14rem] items-center border-b border-nabat-border md:flex xl:max-w-[18rem]"
            >
              <input
                type="search"
                className="w-full bg-transparent py-2 font-body text-sm text-nabat-text placeholder:text-nabat-muted focus:outline-none"
                placeholder="Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
              <button type="submit" className="p-2 text-nabat-primary" aria-label="Search">
                <i className="fa-solid fa-magnifying-glass text-sm" />
              </button>
            </form>

            <button
              type="button"
              className="opacity-80 transition-opacity hover:opacity-100"
              onClick={() => navigate('/accountdetails')}
              aria-label="Account"
            >
              <img className="h-5 w-5" src={userIcon} alt="" />
            </button>
            <button
              type="button"
              className="relative opacity-80 transition-opacity hover:opacity-100"
              onClick={() => navigate('/cart')}
              aria-label="Cart"
            >
              <img className="h-5 w-5" src={cartIcon} alt="" />
              {cartItems.length > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-nabat-accent px-1 font-nav text-[9px] font-semibold text-white">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="mt-4 border-t border-nabat-border pb-4 pt-4 lg:hidden">
            <form onSubmit={handleSearch} className="mb-4 flex border-b border-nabat-border">
              <input
                type="search"
                className="w-full bg-transparent py-2 font-body text-sm focus:outline-none"
                placeholder="Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
              <button type="submit" className="p-2 text-nabat-primary">
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </form>
            <ul className="flex flex-col gap-1">
              <li>
                <button
                  type="button"
                  className="w-full py-2.5 text-left font-nav text-sm uppercase tracking-wider"
                  onClick={() => setCategoriesOpen((o) => !o)}
                >
                  Categories
                </button>
                {categoriesOpen && (
                  <ul className="mb-2 ml-3 border-l border-nabat-border pl-3">
                    {categories.map((cat) => (
                      <li key={cat}>
                        <NavLink
                          to={`/category/${cat.toLowerCase().replace(' ', '-')}`}
                          className="block py-2 font-nav text-sm text-nabat-muted"
                          onClick={() => setMobileOpen(false)}
                        >
                          {cat}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              {[
                ['/', 'Home'],
                ['/shop', 'Shop'],
                ['/contact', 'Contact'],
                ['/about', 'About'],
              ].map(([to, label]) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={linkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="block py-2.5">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
