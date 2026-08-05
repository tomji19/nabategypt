import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PlantCard from '../PlantCard/PlantCard';
import styles from './ShopPage.module.css';
import { useProducts } from '../ProductsContext/ProductsContext';
import { useLanguage } from '../LanguageContext/LanguageContext';
import { useCategories } from '../CategoriesContext/CategoriesContext';
import { getProductName } from '../../utils/productLocale';

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

function readShopFilters(params) {
  return {
    category: params.get('category') || '',
    light: params.get('light') || '',
    care: params.get('care') || '',
    sort: params.get('sort') || 'featured',
    onSale: params.get('sale') === '1',
    availability: params.get('availability') || '',
    minPrice: params.get('min') || '',
    maxPrice: params.get('max') || '',
    searchTerm: params.get('q') || '',
  };
}

export default function ShopPage() {
  const { products, loading, error, refreshProducts } = useProducts();
  const { t, isAr } = useLanguage();
  const { activeCategories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openId, setOpenId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    category,
    light,
    care,
    sort,
    onSale,
    availability,
    minPrice,
    maxPrice,
    searchTerm,
  } = useMemo(() => readShopFilters(searchParams), [searchParams]);

  /** Keep shop filters in the URL so back from a product restores them. */
  const patchFilters = useCallback(
    (patch) => {
      setSearchParams(
        (prev) => {
          const current = readShopFilters(prev);
          const next = { ...current, ...patch };
          const params = new URLSearchParams();
          if (next.category) params.set('category', next.category);
          if (next.light) params.set('light', next.light);
          if (next.care) params.set('care', next.care);
          if (next.sort && next.sort !== 'featured') params.set('sort', next.sort);
          if (next.onSale) params.set('sale', '1');
          if (next.availability) params.set('availability', next.availability);
          if (next.minPrice !== '') params.set('min', String(next.minPrice));
          if (next.maxPrice !== '') params.set('max', String(next.maxPrice));
          if (next.searchTerm.trim()) params.set('q', next.searchTerm.trim());
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

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
    { value: 'bright-direct', label: t('brightLightDirect') },
    { value: 'bright-indirect', label: t('brightLightIndirect') },
  ];

  const CARE_OPTIONS = [
    { value: '', label: t('anyCare') },
    { value: 'easy', label: t('easyCare') },
    { value: 'moderate', label: t('moderateCare') },
    { value: 'expert', label: t('expertCare') },
  ];

  const AVAILABILITY_OPTIONS = [
    { value: '', label: t('anyAvailability') },
    { value: 'in', label: t('inStock') },
    { value: 'out', label: t('outOfStock') },
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
      const stockQty = Number(product.stock);
      const isInStock = Number.isFinite(stockQty) ? stockQty > 0 : true;
      const matchesAvailability =
        availability === 'in'
          ? isInStock
          : availability === 'out'
            ? !isInStock
            : true;

      return (
        withinPrice &&
        matchesCategory &&
        matchesSale &&
        matchesSearch &&
        matchesLight &&
        matchesCare &&
        matchesAvailability
      );
    });

    next = [...next];
    if (sort === 'featured') {
      next.sort((a, b) => {
        const bySort = (a.sortOrder || 0) - (b.sortOrder || 0);
        if (bySort !== 0) return bySort;
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return 0;
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
    availability,
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
    availability,
    minPrice !== '',
    maxPrice !== '',
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
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
        onChange={(value) => patchFilters({ category: value })}
      />
      <OptionGroup
        label={t('light')}
        options={LIGHT_OPTIONS}
        value={light}
        onChange={(value) => patchFilters({ light: value })}
      />
      <OptionGroup
        label={t('care')}
        options={CARE_OPTIONS}
        value={care}
        onChange={(value) => patchFilters({ care: value })}
      />
      <OptionGroup
        label={t('availability')}
        options={AVAILABILITY_OPTIONS}
        value={availability}
        onChange={(value) => patchFilters({ availability: value })}
      />

      <div className={styles.group}>
        <p className={styles.rowLabel}>{t('priceEgp')}</p>
        <div className={styles.priceInputs}>
          <input
            type="number"
            min="0"
            placeholder={t('min')}
            value={minPrice}
            onChange={(e) => patchFilters({ minPrice: e.target.value })}
            className={styles.priceInput}
            aria-label={t('min')}
          />
          <span className={styles.priceSep}>—</span>
          <input
            type="number"
            min="0"
            placeholder={t('max')}
            value={maxPrice}
            onChange={(e) => patchFilters({ maxPrice: e.target.value })}
            className={styles.priceInput}
            aria-label={t('max')}
          />
        </div>
      </div>

      <label className={styles.saleToggle}>
        <input
          type="checkbox"
          checked={onSale}
          onChange={(e) => patchFilters({ onSale: e.target.checked })}
        />
        <span>{t('onSale')}</span>
      </label>
    </aside>
  );

  return (
    <div className={styles.page}>
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
                onChange={(e) => patchFilters({ searchTerm: e.target.value })}
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
              onChange={(value) => patchFilters({ sort: value })}
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
