import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logoNoBackground from '../../assets/images/logocolored.png';
import cartIcon from '../../assets/images/cart.svg';
import userIcon from '../../assets/images/user.svg';
import { useCart } from '../CartContext/CartContext';
import { useAuth } from '../AuthContext/AuthContext';
import { doSignOut } from '../../supabase/auth';
import styles from './Navbar.module.css';

const categories = ['Succulents', 'Indoor Plants', 'Outdoor Plants'];

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { currentUser, userDetails, userLoggedIn, anonymousUserName } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const categoriesRef = useRef(null);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

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
      setSearchOpen(false);
    }
  };

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  const displayName = getUserDisplayName();

  return (
    <header className={styles.header}>
      <div className={styles.promo}>
        <div className={`section-pad ${styles.promoInner}`}>
          <p className={styles.promoText}>Get 30% off your first order</p>
          <div className={styles.promoAuth}>
            {userLoggedIn ? (
              <>
                <span className={styles.promoHello}>Hello, {displayName}</span>
                <button type="button" onClick={handleLogout} className={styles.promoLink}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.promoLink}>
                  Login
                </Link>
                <span className={styles.promoSep} aria-hidden>
                  /
                </span>
                <Link to="/register" className={styles.promoLink}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`section-pad ${styles.bar}`}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
        </button>

        <nav className={styles.nav} aria-label="Primary">
          <div className={styles.catWrap} ref={categoriesRef}>
            <button
              type="button"
              className={`${styles.catBtn} ${categoriesOpen ? styles.catBtnOpen : ''}`}
              onClick={() => setCategoriesOpen((o) => !o)}
              aria-expanded={categoriesOpen}
            >
              <span className={styles.catEyebrow}>Shop by</span>
              <span className={styles.catLabel}>
                Categories
                <i className={`fa-solid fa-chevron-down ${styles.catChevron}`} />
              </span>
            </button>
            {categoriesOpen && (
              <ul className={styles.dropdown}>
                {categories.map((cat) => (
                  <li key={cat}>
                    <NavLink
                      to={`/category/${cat.toLowerCase().replace(' ', '-')}`}
                      className={styles.dropdownLink}
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
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
        </nav>

        <Link to="/" className={styles.logo}>
          <img src={logoNoBackground} alt="Nabat" />
        </Link>

        <div className={styles.actions}>
          <div className={`${styles.search} ${searchOpen ? styles.searchOpen : ''}`}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Search"
              onClick={() => setSearchOpen((o) => !o)}
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="search"
                placeholder="Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
            </form>
          </div>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => navigate('/accountdetails')}
            aria-label="Account"
          >
            <img src={userIcon} alt="" />
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => navigate('/cart')}
            aria-label="Cart"
          >
            <img src={cartIcon} alt="" />
            {cartItems.length > 0 && (
              <span className={styles.badge}>{cartItems.length}</span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`section-pad ${styles.mobile}`}>
          <form onSubmit={handleSearch} className={styles.mobileSearch}>
            <input
              type="search"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
            />
            <button type="submit" aria-label="Search">
              <i className="fa-solid fa-magnifying-glass" />
            </button>
          </form>

          <ul className={styles.mobileNav}>
            <li>
              <button
                type="button"
                className={`${styles.mobileLink} ${styles.mobileCat}`}
                onClick={() => setCategoriesOpen((o) => !o)}
              >
                <span className={styles.catEyebrow}>Shop by</span>
                Categories
              </button>
              {categoriesOpen && (
                <ul className={styles.mobileCats}>
                  {categories.map((cat) => (
                    <li key={cat}>
                      <NavLink
                        to={`/category/${cat.toLowerCase().replace(' ', '-')}`}
                        className={styles.mobileSubLink}
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
              ['/', 'Home', true],
              ['/shop', 'Shop', false],
              ['/about', 'About', false],
              ['/contact', 'Contact', false],
            ].map(([to, label, end]) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `${styles.mobileLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
