import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProducts } from '../ProductsContext/ProductsContext';
import AddToCartButton from '../AddToCartButton/AddToCartButton';
import pageBanner from '../../assets/images/pagebanner.png';

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query') || '';
  const { products } = useProducts();
  const [hoveredProductId, setHoveredProductId] = useState(null);

  const searchResults = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Search
          </p>
          <h1 className="page-banner-title">
            &ldquo;{searchQuery}&rdquo;
          </h1>
        </div>
      </section>

      <div className="section-pad py-12 md:py-16">
        {searchResults.length === 0 ? (
          <p className="font-body text-nabat-muted">
            No products found matching &ldquo;{searchQuery}&rdquo;
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((product) => (
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
                  <h2 className="font-heading text-lg font-medium">{product.name}</h2>
                  <p className="font-nav text-sm">{product.price} EGP</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
