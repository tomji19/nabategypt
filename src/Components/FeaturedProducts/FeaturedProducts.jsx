import React, { useState } from 'react';
import { getProducts } from '../ProductData/ProductData';
import { useNavigate } from 'react-router-dom';
import AddToCartButton from '../AddToCartButton/AddToCartButton';

function ProductRail({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  if (!Array.isArray(products) || products.length === 0) return null;

  const visible = 3;
  const maxIndex = Math.max(0, products.length - visible);

  const handlePrevious = () => {
    setCurrentIndex((i) => (i === 0 ? maxIndex : i - 1));
  };

  const handleNext = () => {
    setCurrentIndex((i) => (i >= maxIndex ? 0 : i + 1));
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / products.length)}%)`,
            width: `${(products.length * 100) / visible}%`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="shrink-0 px-2 md:px-3"
              style={{ width: `${100 / products.length}%` }}
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <article className="product-card">
                <div className="product-card-image-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-card-image cursor-pointer"
                    onClick={() => navigate(`/singleproduct/${product.id}`)}
                  />
                  <div
                    className={`absolute inset-x-0 bottom-0 transition-all duration-300 ${
                      hoveredId === product.id
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-full opacity-0'
                    }`}
                  >
                    <AddToCartButton product={product} />
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-left">
                  <p className="font-nav text-[10px] uppercase tracking-[0.18em] text-nabat-accent">
                    {product.category}
                  </p>
                  <h3
                    className="cursor-pointer font-heading text-lg font-medium text-nabat-text transition-colors hover:text-nabat-accent md:text-xl"
                    onClick={() => navigate(`/singleproduct/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="font-nav text-sm text-nabat-text">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="font-nav text-xs text-nabat-muted line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5 pt-2">
                    {product.colorOptions?.map((color, index) => (
                      <div
                        key={index}
                        className="h-3 w-3 border border-nabat-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handlePrevious}
        className="absolute -left-2 top-[35%] z-10 flex h-10 w-10 items-center justify-center bg-white/90 text-nabat-primary shadow-sm transition-colors hover:bg-nabat-primary hover:text-white md:-left-4"
        aria-label="Previous"
      >
        <i className="fa-solid fa-arrow-left text-sm" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute -right-2 top-[35%] z-10 flex h-10 w-10 items-center justify-center bg-white/90 text-nabat-primary shadow-sm transition-colors hover:bg-nabat-primary hover:text-white md:-right-4"
        aria-label="Next"
      >
        <i className="fa-solid fa-arrow-right text-sm" />
      </button>
    </div>
  );
}

export default function FeaturedProducts() {
  const { featuredProducts } = getProducts();

  return (
    <section className="leaf-wash section-pad py-20 md:py-28">
      <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-label">Favorites</p>
          <h2 className="section-title">Featured plants</h2>
        </div>
        <p className="max-w-xs font-body text-sm text-nabat-muted md:text-right">
          Our most loved greenery
        </p>
      </div>
      <ProductRail products={featuredProducts} />
    </section>
  );
}
