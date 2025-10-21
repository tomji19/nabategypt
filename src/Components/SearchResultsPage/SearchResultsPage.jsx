import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProducts } from '../ProductData/ProductData';
import AddToCartButton from '../AddToCartButton/AddToCartButton';
import classes from '../SearchResultsPage/SearchResultsPage.module.css';


export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query') || '';

  const { products } = getProducts();
  const [hoveredProductId, setHoveredProductId] = useState(null);

  // Filter products based on search query
  const searchResults = products.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='bg-gray-100'>
      <div className={`${classes.pageBanner} px-32`}>
        <div className="h-[20rem] flex flex-col items-center justify-center">
          <h3 className="text-5xl font-bold text-white z-10">Search Results for "{searchQuery}"</h3>
        </div>
      </div>
      
      <div className="container mx-auto px-32 py-10">
        {searchResults.length === 0 ? (
          <p className="text-2xl text-gray-600">
            No products found matching "{searchQuery}"
          </p>
        ) : (
          <div className="flex flex-wrap -mx-5">
            {searchResults.map((product) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}