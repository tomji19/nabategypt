import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logoNoBackground from '../../assets/images/logocolored.png';
import cartIcon from '../../assets/images/cart.svg';
import userIcon from '../../assets/images/user.svg';
import { useCart } from '../CartContext/CartContext';
import { useAuth } from '../AuthContext/AuthContext';
import { doSignOut } from '../../supabase/auth';
import { getProducts } from '../ProductData/ProductData';
import styles from './Navbar.module.css';

const categories = ['Succulents', 'Indoor Plants', 'Outdoor Plants'];

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, clearCart, openCart } = useCart();
  const { currentUser, userDetails, userLoggedIn, anonymousUserName } = useAuth();
  const { products } = getProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const categoriesRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchInputRef = useRef(null);

  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return (products || [])
      .filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [products, searchTerm]);

  const showDesktopResults = searchOpen && searchTerm.trim().length > 0;
  const showMobileResults = mobileOpen && searchTerm.trim().length > 0;

  useEffect(() => {
    const onPointerDown = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

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

  const closeSearch = () => {
    setSearchTerm('');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      closeSearch();
    }
  };

  const goToProduct = (id) => {
    navigate(`/singleproduct/${id}`);
    closeSearch();
  };

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  const displayName = getUserDisplayName();

  const resultsList = (results, onSelect) => (
    <div className={styles.searchDropdown}>
      {results.length > 0 ? (
        <ul className={styles.searchList}>
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                className={styles.searchItem}
                onClick={() => onSelect(product.id)}
              >
                <img src={product.image} alt="" className={styles.searchThumb} />
                <span className={styles.searchMeta}>
                  <span className={styles.searchCat}>{product.category}</span>
                  <span className={styles.searchName}>{product.name}</span>
                  <span className={styles.searchPrice}>{product.price} EGP</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.searchEmpty}>No plants found</p>
      )}
      {searchTerm.trim() && (
        <button
          type="button"
          className={styles.searchAll}
          onClick={() => {
            navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
            closeSearch();
          }}
        >
          View all results for “{searchTerm.trim()}”
        </button>
      )}
    </div>
  );

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
          <div
            ref={searchRef}
            className={`${styles.search} ${searchOpen ? styles.searchOpen : ''}`}
          >
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Search"
              onClick={() => setSearchOpen((o) => !o)}
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            <div className={styles.searchPanel}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
              </form>
              {showDesktopResults && resultsList(searchResults, goToProduct)}
            </div>
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
            onClick={openCart}
            aria-label="Cart"
          >
            <img src={cartIcon} alt="" />
            {cartCount > 0 && (
              <span className={styles.badge}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`section-pad ${styles.mobile}`}>
          <div ref={mobileSearchRef} className={styles.mobileSearchWrap}>
            <form onSubmit={handleSearch} className={styles.mobileSearch}>
              <input
                type="search"
                placeholder="Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" aria-label="Search">
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </form>
            {showMobileResults && resultsList(searchResults, goToProduct)}
          </div>

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
