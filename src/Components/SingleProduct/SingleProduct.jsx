import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon } from 'lucide-react';
import { getProducts } from '../ProductData/ProductData';
import classes from '../SingleProduct/SingleProduct.module.css';


const REVIEWS = [
  {
    author: 'Mark Emerson',
    rating: 5,
    text: "This is the best product I've ever bought. The quality is amazing and it looks exactly like the pictures!",
  },
  {
    author: 'Sarah Hunt',
    rating: 4,
    text: "Really happy with my purchase. The colors are vibrant and it's exactly what I was looking for.",
  },
  {
    author: 'Ben Baker',
    rating: 5,
    text: 'Great product, fast shipping, and excellent customer service. Would definitely buy again!',
  },
];

const HIGHLIGHTS = [
  'Hand-picked with care',
  'Premium quality plants',
  'Comes with care instructions',
  'Satisfaction guaranteed',
];

export default function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const { getProductById } = getProducts();
    const productData = getProductById(id);
    setProduct(productData);
    if (productData?.colorOptions?.length > 0) {
      setSelectedColor(productData.colorOptions[0]);
    }
  }, [id]);

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <>
      <div className={`${classes.pageBanner} px-32`}>
        <div className="h-[20rem] flex flex-col items-center justify-center">
          <h3 className="text-7xl font-bold text-white z-10">{product.name}</h3>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[100%] object-cover rounded-lg"
              />
            </div>
            <img
              src={product.image}
              alt={`${product.name} detail`}
              className="w-full h-[auto] object-cover rounded-lg"
            />
            <img
              src={product.image}
              alt={`${product.name} additional`}
              className="w-full h-[auto] object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2">
              <span className="text-2xl font-semibold">${product.price}</span>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <span className="font-medium">Category: </span>
              {product.category}
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={i < 4 ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">87 reviews</span>
            </div>

            {/* Color Selection */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium">Color</h3>
                <div className="flex space-x-2 mt-2">
                  {product.colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      }`}
                      style={{
                        backgroundColor: color === 'grey' ? '#888' : color,
                      }}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Size</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {product.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-4 text-sm font-medium rounded-md ${
                        selectedSize === size
                          ? 'bg-[var(--main-color)] text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Bag Button */}
            <button className="mt-8 w-full bg-[var(--main-color)] text-white py-3 px-4 rounded-md hover:bg-blue-700">
              Add to bag
            </button>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {product.description}
                </p>
              </div>
            )}

            {/* Highlights */}
            <div className="mt-8">
              <h3 className="text-sm font-medium">Highlights</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                {HIGHLIGHTS.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="mt-8">
              <h3 className="text-lg font-medium">Customer Reviews</h3>
              <div className="mt-4 space-y-6">
                {REVIEWS.map((review, index) => (
                  <div key={index} className="border-t border-gray-200 pt-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium">{review.author}</h4>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill={i < review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
