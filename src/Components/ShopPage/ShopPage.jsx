import React, { useState } from 'react';
import classes from '../ShopPage/ShopPage.module.css';
import { getProducts } from '../ProductData/ProductData';
import { useNavigate } from 'react-router-dom';
import AddToCartButton from '../AddToCartButton/AddToCartButton';

export default function ShopPage() {
  const { products } = getProducts();
  const navigate = useNavigate();

  // Check if products is an array
  if (!Array.isArray(products)) {
    console.error('products is not an array:', products);
    return null; // or return a fallback UI
  }

  // New state variables for filters
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [category, setCategory] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredProductId, setHoveredProductId] = useState(null);

  // Filtered products based on criteria
  const filteredProducts = products.filter((product) => {
    const withinPriceRange =
      product.price >= minPrice && product.price <= maxPrice;
    const matchesCategory = category ? product.category === category : true;
    const matchesSale = onSale ? product.onSale : true;
    // Updated search condition to include partial matches
    const matchesSearch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return withinPriceRange && matchesCategory && matchesSale && matchesSearch;
  });

  // Reset filters
  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(Infinity);
    setCategory('');
    setOnSale(false);
    setSearchTerm('');
  };

  // Handle breadcrumb click to filter by category
  const handleBreadcrumbClick = (selectedCategory) => {
    setCategory(selectedCategory);
    // Reset other filters except category
    setMinPrice(0);
    setMaxPrice(Infinity);
    setOnSale(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* Banner Section */}
      <section className={`${classes.pageBanner} px-32`}>
        <div className="h-[20rem] flex flex-col items-center justify-center">
          <h3 className="text-7xl font-bold text-white z-10">Shop</h3>
          <ul className="flex gap-5 mt-4 z-10">
            {['Indoor Plants', 'Outdoor Plants', 'Succulent'].map((categoryItem) => (
              <li 
                key={categoryItem}
                className="text-xl text-white cursor-pointer hover:underline"
                onClick={() => handleBreadcrumbClick(categoryItem)}
              >
                {categoryItem}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Filter Inputs */}
      <div className="px-32 flex items-center p-5 rounded-md space-x-4">
        <input
          type="number"
          placeholder="Min Price"
          className="p-2 border"
          value={minPrice === 0 ? '' : minPrice}
          onChange={(e) => setMinPrice(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Max Price"
          className="p-2 border"
          value={maxPrice === Infinity ? '' : maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />

        <select
          className="p-2 border"
          onChange={(e) => setCategory(e.target.value)}
          value={category}
        >
          <option value="">Select Category</option>
          <option value="Succulent">Succulent</option>
          <option value="Indoor Plants">Indoor Plants</option>
          <option value="Outdoor Plants">Outdoor Plants</option>
          <option value="Outdoor Plants">Pots</option>
          <option value="Outdoor Plants">Care Tools</option>
        </select>

        <label className="flex items-center font-bold">
          On Sale
          <input
            type="checkbox"
            className="ml-2"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
          />
        </label>

        <input
          type="text"
          placeholder="Search by Name"
          className="p-2 border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          onClick={resetFilters}
          className="p-2 bg-green-800 px-7 py-1 text-white font-bold"
        >
          Reset
        </button>
      </div>

      <section>
        <div className="flex flex-wrap px-32 py-3 bg-gray-100">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="w-1/3 p-5 transition-all ease-in hover:-translate-y-3 group"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <div className="border shadow-lg p-3 bg-white relative">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-[21rem] w-full object-cover cursor-pointer"
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
                  <div className="pt-3 px-1 pb-2">
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <h2 className="text-2xl my-1 text-gray-900 font-[Raleway]">
                      {product.name}
                    </h2>
                    <p className="text-lg text-gray-900">{product.price} EGP</p>
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
            ))
          ) : (
            <p>No products found matching the criteria.</p>
          )}
        </div>
      </section>
    </>
  );
}