import React, { useState } from 'react';
import { getProducts } from '../ProductData/ProductData';
import { useNavigate } from 'react-router-dom';
import AddToCartButton from '../AddToCartButton/AddToCartButton';
import pageBanner from '../../assets/images/pagebanner.png';

export default function ShopPage() {
  const { products } = getProducts();
  const navigate = useNavigate();

  if (!Array.isArray(products)) {
    console.error('products is not an array:', products);
    return null;
  }

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [category, setCategory] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredProductId, setHoveredProductId] = useState(null);

  const filteredProducts = products.filter((product) => {
    const withinPriceRange =
      product.price >= minPrice && product.price <= maxPrice;
    const matchesCategory = category ? product.category === category : true;
    const matchesSale = onSale ? product.onSale : true;
    const matchesSearch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return withinPriceRange && matchesCategory && matchesSale && matchesSearch;
  });

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(Infinity);
    setCategory('');
    setOnSale(false);
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (selectedCategory) => {
    setCategory(selectedCategory);
    setMinPrice(0);
    setMaxPrice(Infinity);
    setOnSale(false);
    setSearchTerm('');
  };

  return (
    <>
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
          <ul className="mt-4 flex flex-wrap gap-4">
            {['Indoor Plants', 'Outdoor Plants', 'Succulent'].map((item) => (
              <li
                key={item}
                className="cursor-pointer font-nav text-[11px] uppercase tracking-[0.14em] text-white/80 hover:text-white"
                onClick={() => handleBreadcrumbClick(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="section-pad py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
          <aside className="space-y-6 border-b border-nabat-border pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <div>
              <h2 className="section-label">Filter</h2>
              <p className="font-heading text-xl font-medium text-nabat-text">
                Refine
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-nav text-[10px] uppercase tracking-wider text-nabat-muted">
                    Min
                  </label>
                  <input
                    type="number"
                    className="input-box"
                    placeholder="0"
                    value={minPrice === 0 ? '' : minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-nav text-[10px] uppercase tracking-wider text-nabat-muted">
                    Max
                  </label>
                  <input
                    type="number"
                    className="input-box"
                    placeholder="Any"
                    value={maxPrice === Infinity ? '' : maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-nav text-[10px] uppercase tracking-wider text-nabat-muted">
                  Category
                </label>
                <select
                  className="input-box"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Succulent">Succulent</option>
                  <option value="Indoor Plants">Indoor Plants</option>
                  <option value="Outdoor Plants">Outdoor Plants</option>
                </select>
              </div>

              <label className="flex items-center gap-2 font-nav text-sm text-nabat-text">
                <input
                  type="checkbox"
                  className="accent-nabat-accent"
                  checked={onSale}
                  onChange={(e) => setOnSale(e.target.checked)}
                />
                On sale
              </label>

              <input
                type="text"
                className="input-box"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button type="button" onClick={resetFilters} className="btn-outline w-full">
                Reset
              </button>
            </div>
          </aside>

          <div>
            <p className="mb-8 font-nav text-xs uppercase tracking-[0.14em] text-nabat-muted">
              {filteredProducts.length} plants
            </p>
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="product-card"
                    onMouseEnter={() => setHoveredProductId(product.id)}
                    onMouseLeave={() => setHoveredProductId(null)}
                  >
                    <div className="product-card-image-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-card-image cursor-pointer"
                        onClick={() => navigate(`/singleproduct/${product.id}`)}
                      />
                      <div
                        className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${
                          hoveredProductId === product.id
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-full opacity-0'
                        }`}
                      >
                        <AddToCartButton product={product} />
                      </div>
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="font-nav text-[10px] uppercase tracking-[0.18em] text-nabat-accent">
                        {product.category}
                      </p>
                      <h2 className="font-heading text-lg font-medium text-nabat-text">
                        {product.name}
                      </h2>
                      <p className="font-nav text-sm text-nabat-text">
                        {product.price} EGP
                      </p>
                      <div className="flex gap-1.5 pt-2">
                        {product.colorOptions.map((color, index) => (
                          <div
                            key={index}
                            className="h-3 w-3 border border-nabat-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p className="col-span-full font-body text-nabat-muted">
                  No products found matching the criteria.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
