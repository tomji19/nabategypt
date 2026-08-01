import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PlantCard from '../PlantCard/PlantCard';
import styles from './ShopPage.module.css';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
// import { useSiteContent } from '../SiteContentContext/SiteContentContext';
import { useCategories } from '../CategoriesContext/CategoriesContext';
import { getProductName } from '../../utils/productLocale';
// import { cmsImage, SECTION_IMAGE_FALLBACKS } from '../../config/cmsFallbacks';

function FilterDropdown({ id, label, value, options, openId, setOpenId, onChange }) {
  const ref = useRef(null);
  const open = openId === id;
  const current = options.find((o) => o.value === value)?.label || label;

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenId(null);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open, setOpenId]);

  return (
    <div className={styles.dropdown} ref={ref}>
      <button
        type="button"
        className={`${styles.dropdownBtn} ${open ? styles.dropdownBtnOpen : ''}`}
        onClick={() => setOpenId(open ? null : id)}
      >
        <span className={styles.dropdownLabel}>{label}</span>
        <span className={styles.dropdownValue}>{current}</span>
        <i className={`fa-solid fa-chevron-down ${styles.chevron}`} aria-hidden />
      </button>
      {open && (
        <ul className={styles.menu}>
          {options.map((opt) => (
            <li key={opt.value || 'all'}>
              <button
                type="button"
                className={`${styles.menuItem} ${
                  value === opt.value ? styles.menuItemActive : ''
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpenId(null);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OptionGroup({ label, options, value, onChange }) {
  return (
    <div className={styles.group}>
      <p className={styles.rowLabel}>{label}</p>
      <div className={styles.optionList} role="listbox" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value || 'all'}
            type="button"
            role="option"
            aria-selected={value === opt.value}
            className={`${styles.option} ${
              value === opt.value ? styles.optionActive : ''
            }`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { products, loading, error, refreshProducts } = useProducts();
  const { t, isAr } = useLanguage();
  // const { content } = useSiteContent();
  const { activeCategories } = useCategories();
  // const shop = content?.shop || {};
  // const bannerSrc = cmsImage(
  //   shop.bannerImage,
  //   SECTION_IMAGE_FALLBACKS.pageBannerImage
  // );
  const [searchParams] = useSearchParams();
  const [openId, setOpenId] = useState(null);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [light, setLight] = useState('');
  const [care, setCare] = useState(searchParams.get('care') || '');
  const [sort, setSort] = useState('featured');
  const [onSale, setOnSale] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setCare(searchParams.get('care') || '');
  }, [searchParams]);

  const CATEGORIES = useMemo(
    () => [
      { value: '', label: t('catAll') },
      ...(activeCategories || []).map((cat) => ({
        value: cat.name,
        label: isAr ? cat.nameAr || cat.name : cat.name,
      })),
    ],
    [activeCategories, isAr, t]
  );

  const LIGHT_OPTIONS = [
    { value: '', label: t('anyLight') },
    { value: 'low', label: t('lowLight') },
    { value: 'medium', label: t('mediumLight') },
    { value: 'bright', label: t('brightLight') },
  ];

  const CARE_OPTIONS = [
    { value: '', label: t('anyCare') },
    { value: 'easy', label: t('easyCare') },
    { value: 'moderate', label: t('moderateCare') },
    { value: 'expert', label: t('expertCare') },
  ];

  const SORT_OPTIONS = [
    { value: 'featured', label: t('sortFeatured') },
    { value: 'price-asc', label: t('sortPriceAsc') },
    { value: 'price-desc', label: t('sortPriceDesc') },
    { value: 'name-asc', label: t('sortNameAsc') },
  ];

  const list = Array.isArray(products) ? products : [];

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let next = list.filter((product) => {
      const min = minPrice === '' ? 0 : Number(minPrice);
      const max = maxPrice === '' ? Infinity : Number(maxPrice);
      const withinPrice = product.price >= min && product.price <= max;
      const matchesCategory = category ? product.category === category : true;
      const matchesSale = onSale ? Boolean(product.onSale) : true;
      const displayName = getProductName(product, { isAr, t }).toLowerCase();
      const matchesSearch = q
        ? displayName.includes(q) ||
          product.name?.toLowerCase().includes(q) ||
          product.nameAr?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q)
        : true;
      const matchesLight = light ? product.light === light : true;
      const matchesCare = care ? product.care === care : true;
      const inStock = product.stock == null || product.stock > 0;

      return (
        withinPrice &&
        matchesCategory &&
        matchesSale &&
        matchesSearch &&
        matchesLight &&
        matchesCare &&
        inStock
      );
    });

    next = [...next];
    if (sort === 'featured') {
      next.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
    }
    if (sort === 'price-asc') next.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') next.sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') {
      next.sort((a, b) =>
        getProductName(a, { isAr, t }).localeCompare(
          getProductName(b, { isAr, t }),
          isAr ? 'ar' : 'en'
        )
      );
    }
    return next;
  }, [
    list,
    category,
    light,
    care,
    sort,
    onSale,
    minPrice,
    maxPrice,
    searchTerm,
    isAr,
    t,
  ]);

  const activeCount = [
    category,
    light,
    care,
    onSale,
    minPrice !== '',
    maxPrice !== '',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategory('');
    setLight('');
    setCare('');
    setSort('featured');
    setOnSale(false);
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setOpenId(null);
  };

  const sidebar = (
    <aside
      className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`}
      aria-label={t('filters')}
    >
      <div className={styles.sidebarHead}>
        <h2 className={styles.sidebarTitle}>{t('filters')}</h2>
        {activeCount > 0 && (
          <button type="button" className={styles.reset} onClick={resetFilters}>
            {t('resetFilters')}
          </button>
        )}
      </div>

      <OptionGroup
        label={t('category')}
        options={CATEGORIES}
        value={category}
        onChange={setCategory}
      />
      <OptionGroup
        label={t('light')}
        options={LIGHT_OPTIONS}
        value={light}
        onChange={setLight}
      />
      <OptionGroup
        label={t('care')}
        options={CARE_OPTIONS}
        value={care}
        onChange={setCare}
      />

      <div className={styles.group}>
        <p className={styles.rowLabel}>{t('priceEgp')}</p>
        <div className={styles.priceInputs}>
          <input
            type="number"
            min="0"
            placeholder={t('min')}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={styles.priceInput}
            aria-label={t('min')}
          />
          <span className={styles.priceSep}>—</span>
          <input
            type="number"
            min="0"
            placeholder={t('max')}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={styles.priceInput}
            aria-label={t('max')}
          />
        </div>
      </div>

      <label className={styles.saleToggle}>
        <input
          type="checkbox"
          checked={onSale}
          onChange={(e) => setOnSale(e.target.checked)}
        />
        <span>{t('onSale')}</span>
      </label>
    </aside>
  );

  return (
    <div className={styles.page}>
      {/* Shop banner — temporarily hidden
      <section className="page-banner">
        <img
          src={bannerSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/60" />
        <div className="relative z-10">
          <p className="mb-2 font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
            {shop.bannerEyebrow || t('collection')}
          </p>
          <h1 className="page-banner-title">
            {shop.bannerTitle || t('shopBanner')}
          </h1>
        </div>
      </section>
      */}

      <div className={`section-pad ${styles.layout}`}>
        {sidebar}

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden />
              <input
                type="search"
                placeholder={t('searchPlants')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.search}
              />
            </div>

            <button
              type="button"
              className={`${styles.filtersToggle} ${
                filtersOpen ? styles.filtersToggleOpen : ''
              }`}
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
            >
              {t('filters')}
              {activeCount > 0 && (
                <span className={styles.filterCount}>{activeCount}</span>
              )}
              <i
                className={`fa-solid ${
                  filtersOpen ? 'fa-xmark' : 'fa-sliders'
                } ${styles.sliders}`}
              />
            </button>

            <FilterDropdown
              id="sort"
              label={t('sortFeatured')}
              value={sort}
              options={SORT_OPTIONS}
              openId={openId}
              setOpenId={setOpenId}
              onChange={setSort}
            />
          </div>

          {loading ? (
            <div className={styles.empty}>
              <p>{t('loadingPlants')}</p>
            </div>
          ) : error ? (
            <div className={styles.empty}>
              <p>{t('shopLoadError')}</p>
              <p className={styles.count}>{error}</p>
              <button
                type="button"
                className={styles.reset}
                onClick={refreshProducts}
              >
                {t('tryAgain')}
              </button>
            </div>
          ) : (
            <>
              <p className={styles.count}>
                {t('plantsCount', { count: filteredProducts.length })}
              </p>
              {filteredProducts.length > 0 ? (
                <div className={styles.grid}>
                  {filteredProducts.map((product) => (
                    <PlantCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <p>{list.length === 0 ? t('emptyCatalog') : t('noResults')}</p>
                  {list.length > 0 && (
                    <button
                      type="button"
                      className={styles.reset}
                      onClick={resetFilters}
                    >
                      {t('resetFilters')}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
