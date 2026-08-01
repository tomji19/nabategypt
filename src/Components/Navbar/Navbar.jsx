import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import cartIcon from '../../assets/images/cart.svg';
import userIcon from '../../assets/images/user.svg';
import { useCart } from '../CartContext/CartContext';
import { useAuth } from '../AuthContext/AuthContext';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useWishlist } from '../WishlistContext/WishlistContext';
import BrandLogo from '../BrandLogo/BrandLogo';
import { PROMO } from '../../config/store';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { toast } from 'react-toastify';
import { getProductName } from '../../utils/productLocale';
import { useCategories } from '../CategoriesContext/CategoriesContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, clearCart, openCart } = useCart();
  const { currentUser, userDetails, userLoggedIn, logout } = useAuth();
  const { products } = useProducts();
  const { wishlistCount, clearWishlist } = useWishlist();
  const { t, toggle, isAr } = useLanguage();
  const { activeCategories } = useCategories();

  const categoryLinks = (activeCategories || []).map((cat) => ({
    id: cat.id,
    to: `/shop?category=${encodeURIComponent(cat.name)}`,
    label: isAr ? cat.nameAr || cat.name : cat.name,
  }));

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
      .filter((product) => {
        const name = getProductName(product, { isAr, t }).toLowerCase();
        return (
          name.includes(q) ||
          product.name?.toLowerCase().includes(q) ||
          product.nameAr?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [products, searchTerm, isAr, t]);

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
      clearCart({ clearRemote: false });
      clearWishlist();
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      clearCart({ clearRemote: false });
      clearWishlist();
      toast.error('Signed out locally, but something went wrong clearing the server session.');
      navigate('/login');
    }
  };

  const getUserDisplayName = () => {
    if (!userLoggedIn) return null;
    if (userDetails?.name) return userDetails.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Account';
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
                  <span className={styles.searchName}>
                    {getProductName(product, { isAr, t })}
                  </span>
                  <span className={styles.searchPrice}>
                    {product.price} {t('egp')}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.searchEmpty}>{t('noPlantsFound')}</p>
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
          <p className={styles.promoText}>
            <span className={styles.promoLabel}>{t('promoLabel')}</span>
            <span className={styles.promoSepDot} aria-hidden>
              ·
            </span>
            <span className={styles.promoOffer}>{t('promoOfferShort')}</span>
            <span className={styles.promoCode} title={t('promoCodeHint')}>
              {PROMO.code}
            </span>
          </p>
          <div className={styles.promoAuth}>
            {userLoggedIn ? (
              <>
                <span className={styles.promoHello}>
                  {t('hello')}, {displayName}
                </span>
                <button type="button" onClick={handleLogout} className={styles.promoLink}>
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.promoLink}>
                  {t('login')}
                </Link>
                <span className={styles.promoSep} aria-hidden>
                  /
                </span>
                <Link to="/register" className={styles.promoLink}>
                  {t('register')}
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
          aria-label={t('menu')}
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
              <span className={styles.catEyebrow}>{t('shopBy')}</span>
              <span className={styles.catLabel}>
                {t('categories')}
                <i className={`fa-solid fa-chevron-down ${styles.catChevron}`} />
              </span>
            </button>
            {categoriesOpen && (
              <ul className={styles.dropdown}>
                {categoryLinks.map((cat) => (
                  <li key={cat.id}>
                    <NavLink
                      to={cat.to}
                      className={styles.dropdownLink}
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {cat.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <NavLink to="/" end className={linkClass}>
            {t('home')}
          </NavLink>
          <NavLink to="/shop" className={linkClass}>
            {t('shop')}
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            {t('about')}
          </NavLink>
          <NavLink to="/contact" className={linkClass}>
            {t('contact')}
          </NavLink>
        </nav>

        <BrandLogo to="/" className={styles.logo} imgClassName="" />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.langBtn}
            onClick={toggle}
            aria-label={t('switchToLangHint')}
            title={t('switchToLangHint')}
          >
            <span className={styles.langBtnLabel}>
              {t('switchToLang')}
            </span>
          </button>

          <div
            ref={searchRef}
            className={`${styles.search} ${searchOpen ? styles.searchOpen : ''}`}
          >
            <button
              type="button"
              className={styles.iconBtn}
              aria-label={t('search')}
              onClick={() => setSearchOpen((o) => !o)}
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            <div className={styles.searchPanel}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder={t('searchPlants')}
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
            onClick={() => navigate('/wishlist')}
            aria-label={t('openWishlist')}
          >
            <i className="fa-regular fa-heart" />
            {wishlistCount > 0 && (
              <span className={styles.badge}>{wishlistCount}</span>
            )}
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => navigate('/accountdetails')}
            aria-label={t('account')}
          >
            <img src={userIcon} alt="" />
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={openCart}
            aria-label={t('openCart')}
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
                placeholder={t('searchPlants')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" aria-label={t('search')}>
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
                <span className={styles.catEyebrow}>{t('shopBy')}</span>
                {t('categories')}
              </button>
              {categoriesOpen && (
                <ul className={styles.mobileCats}>
                  {categoryLinks.map((cat) => (
                    <li key={cat.id}>
                      <NavLink
                        to={cat.to}
                        className={styles.mobileSubLink}
                        onClick={() => setMobileOpen(false)}
                      >
                        {cat.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {[
              ['/', t('home'), true],
              ['/shop', t('shop'), false],
              ['/wishlist', t('wishlist'), false],
              ['/about', t('about'), false],
              ['/contact', t('contact'), false],
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
