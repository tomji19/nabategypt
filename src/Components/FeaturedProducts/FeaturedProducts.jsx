import React, { useState } from 'react';
import classes from '../FeaturedProducts/FeaturedProducts.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '../ProductData/ProductData';
import { useNavigate } from 'react-router-dom';
import AddToCartButton from '../AddToCartButton/AddToCartButton';

const ProductCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const navigate = useNavigate();

  const { featuredProducts } = getProducts();

  // Check if featuredProducts is an array
  if (!Array.isArray(featuredProducts)) {
    console.error('featuredProducts is not an array:', featuredProducts);
    return null; // or return a fallback UI
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? featuredProducts.length - 3 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === featuredProducts.length - 3 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 relative overflow-hidden">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / featuredProducts.length)}%)`,
            width: `${(featuredProducts.length * 100) / 3}%`,
          }}
        >
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="relative flex-shrink-0 p-2 group"
              style={{ width: `${100 / featuredProducts.length}%` }}
              onMouseEnter={() => setHoveredProductId(product.id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              <div className="m-2 bg-white p-4 shadow-lg">
                <div className="aspect-square mb-4 bg-gray-100 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => navigate(`/singleproduct/${product.id}`)}
                  />
                  {/* Sliding Button on Image */}
                  <div 
                    className={`absolute left-0 right-0 transition-all duration-300 ease-in-out 
                      ${hoveredProductId === product.id 
                        ? 'translate-y-0 opacity-100' 
                        : 'translate-y-full opacity-0'
                      } 
                      bottom-0 p-2 bg-white/100 z-10`}
                  >
                    <AddToCartButton 
                      product={product} 
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 text-start">
                    {product.category}
                  </p>
                  <h3 className="text-2xl my-1 text-gray-900 font-[Raleway] text-start">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {product.colorOptions.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

  <button
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 p-2"
      >
        <i className="fa-solid fa-chevron-left text-3xl text-black"></i>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 p-2"
      >
        <i className="fa-solid fa-chevron-right text-3xl text-black"></i>
      </button>
    </div>
  );
};

export default function FeaturedProducts() {
  return (
    <section className="text-center py-7 bg-gray-100">
      <h1 className="text-5xl my-5">Featured Products</h1>
      <ProductCarousel />
    </section>
  );
}