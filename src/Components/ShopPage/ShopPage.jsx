import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getProducts } from '../ProductData/ProductData';
import PlantCard from '../PlantCard/PlantCard';
import pageBanner from '../../assets/images/pagebanner.png';
import styles from './ShopPage.module.css';

const CATEGORIES = [
  { value: '', label: 'All plants' },
  { value: 'Indoor Plants', label: 'Indoor' },
  { value: 'Outdoor Plants', label: 'Outdoor' },
  { value: 'Succulent', label: 'Succulents' },
];

const LIGHT_OPTIONS = [
  { value: '', label: 'Any light' },
  { value: 'low', label: 'Low light' },
  { value: 'medium', label: 'Medium light' },
  { value: 'bright', label: 'Bright light' },
];

const CARE_OPTIONS = [
  { value: '', label: 'Any care' },
  { value: 'easy', label: 'Easy care' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'expert', label: 'Expert' },
];

const SIZE_OPTIONS = [
  { value: '', label: 'Any size' },
  { value: 'S', label: 'Small' },
  { value: 'M', label: 'Medium' },
  { value: 'L', label: 'Large' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to high' },
  { value: 'price-desc', label: 'Price: High to low' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

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
        className={`${styles.dropdownBtn} ${open ? styles.dropdownBtnOpen : ''} ${
          value ? styles.dropdownBtnActive : ''
        }`}
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
      >
        <span className={styles.dropdownLabel}>{label}</span>
        <span className={styles.dropdownValue}>{current}</span>
        <i className={`fa-solid fa-chevron-down ${styles.chevron}`} />
      </button>
      {open && (
        <ul className={styles.menu} role="listbox">
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

export default function ShopPage() {
  const { products } = getProducts();
  const [openId, setOpenId] = useState(null);
  const [category, setCategory] = useState('');
  const [light, setLight] = useState('');
  const [care, setCare] = useState('');
  const [size, setSize] = useState('');
  const [sort, setSort] = useState('featured');
  const [onSale, setOnSale] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);

  const list = Array.isArray(products) ? products : [];

  const filteredProducts = useMemo(() => {
    let next = list.filter((product) => {
      const min = minPrice === '' ? 0 : Number(minPrice);
      const max = maxPrice === '' ? Infinity : Number(maxPrice);
      const withinPrice = product.price >= min && product.price <= max;
      const matchesCategory = category ? product.category === category : true;
      const matchesSale = onSale ? Boolean(product.onSale) : true;
      const matchesSearch = searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesLight = light ? product.light === light : true;
      const matchesCare = care ? product.care === care : true;
      const matchesSize = size
        ? Array.isArray(product.sizeOptions) && product.sizeOptions.includes(size)
        : true;

      return (
        withinPrice &&
        matchesCategory &&
        matchesSale &&
        matchesSearch &&
        matchesLight &&
        matchesCare &&
        matchesSize
      );
    });

    next = [...next];
    if (sort === 'price-asc') next.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') next.sort((a, b) => b.price - a.price);
    if (sort === 'name-asc') next.sort((a, b) => a.name.localeCompare(b.name));
    return next;
  }, [list, category, light, care, size, sort, onSale, minPrice, maxPrice, searchTerm]);

  const activeCount = [
    category,
    light,
    care,
    size,
    onSale,
    minPrice !== '',
    maxPrice !== '',
    searchTerm,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategory('');
    setLight('');
    setCare('');
    setSize('');
    setSort('featured');
    setOnSale(false);
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setOpenId(null);
  };

  return (
    <div className={styles.page}>
      <section className="page-banner">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/60" />
        <div className="relative z-10">
          <p className="mb-2 font-nav text-[11px] uppercase tracking-[0.2em] text-white/70">
            Collection
          </p>
          <h1 className="page-banner-title">Shop</h1>
        </div>
      </section>

      <div className={`section-pad ${styles.toolbar}`}>
        <div className={styles.toolbarTop}>
          <div className={styles.searchWrap}>
            <i className="fa-solid fa-magnifying-glass" aria-hidden />
            <input
              type="search"
              placeholder="Search plants…"
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
            {filtersOpen ? 'Hide filters' : 'Filters'}
            {activeCount > 0 && <span className={styles.filterCount}>{activeCount}</span>}
            <i
              className={`fa-solid ${filtersOpen ? 'fa-xmark' : 'fa-sliders'} ${styles.sliders}`}
            />
          </button>

          <FilterDropdown
            id="sort"
            label="Sort"
            value={sort}
            options={SORT_OPTIONS}
            openId={openId}
            setOpenId={setOpenId}
            onChange={setSort}
          />
        </div>

        <div className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ''}`}>
          <div className={styles.categoryRow}>
            <p className={styles.rowLabel}>Category</p>
            <div className={styles.chips}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  className={`${styles.chip} ${
                    category === cat.value ? styles.chipActive : ''
                  }`}
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.dropdownRow}>
            <FilterDropdown
              id="light"
              label="Light"
              value={light}
              options={LIGHT_OPTIONS}
              openId={openId}
              setOpenId={setOpenId}
              onChange={setLight}
            />
            <FilterDropdown
              id="care"
              label="Care"
              value={care}
              options={CARE_OPTIONS}
              openId={openId}
              setOpenId={setOpenId}
              onChange={setCare}
            />
            <FilterDropdown
              id="size"
              label="Size"
              value={size}
              options={SIZE_OPTIONS}
              openId={openId}
              setOpenId={setOpenId}
              onChange={setSize}
            />
          </div>

          <div className={styles.priceRow}>
            <p className={styles.rowLabel}>Price (EGP)</p>
            <div className={styles.priceInputs}>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={styles.priceInput}
              />
              <span className={styles.priceSep}>—</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={styles.priceInput}
              />
            </div>
            <label className={styles.saleToggle}>
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => setOnSale(e.target.checked)}
              />
              <span>On sale</span>
            </label>
            {activeCount > 0 && (
              <button type="button" className={styles.reset} onClick={resetFilters}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`section-pad ${styles.gridWrap}`}>
        <p className={styles.count}>{filteredProducts.length} plants</p>
        {filteredProducts.length > 0 ? (
          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <PlantCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No plants match these filters.</p>
            <button type="button" className={styles.reset} onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
