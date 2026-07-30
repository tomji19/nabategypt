import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon } from 'lucide-react';
import { getProducts } from '../ProductData/ProductData';
import AddToCartButton from '../AddToCartButton/AddToCartButton';
import pageBanner from '../../assets/images/pagebanner.png';

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
    return (
      <p className="section-pad py-24 text-center font-body text-nabat-muted">
        Product not found
      </p>
    );
  }

  return (
    <>
      <section className="page-banner !min-h-[8rem] !pb-8 !pt-20 md:!min-h-[9rem]">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/55" />
        <h1 className="page-banner-title !text-[clamp(1.5rem,3vw,2.5rem)]">
          {product.name}
        </h1>
      </section>

      <div className="section-pad py-12 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-3">
            <div className="aspect-[4/5] overflow-hidden bg-nabat-mist">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <img
                src={product.image}
                alt=""
                className="aspect-square object-cover bg-nabat-mist"
              />
              <img
                src={product.image}
                alt=""
                className="aspect-square object-cover bg-nabat-mist"
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-nav text-[10px] uppercase tracking-[0.2em] text-nabat-accent">
              {product.category}
            </p>
            <h1 className="mt-2 font-heading text-[clamp(2rem,4vw,3rem)] font-medium tracking-tight">
              {product.name}
            </h1>
            <p className="mt-4 font-nav text-2xl text-nabat-text">
              ${product.price}
            </p>

            <div className="mt-4 flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${i < 4 ? 'text-amber-400' : 'text-nabat-border'}`}
                  fill={i < 4 ? 'currentColor' : 'none'}
                />
              ))}
              <span className="font-nav text-xs text-nabat-muted">87 reviews</span>
            </div>

            {product.colorOptions?.length > 0 && (
              <div className="mt-8">
                <h3 className="font-nav text-[10px] uppercase tracking-[0.16em] text-nabat-muted">
                  Color
                </h3>
                <div className="mt-3 flex gap-2">
                  {product.colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-8 w-8 border-2 ${
                        selectedColor === color
                          ? 'border-nabat-primary'
                          : 'border-transparent outline outline-1 outline-nabat-border'
                      }`}
                      style={{
                        backgroundColor: color === 'grey' ? '#888' : color,
                      }}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizeOptions?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-nav text-[10px] uppercase tracking-[0.16em] text-nabat-muted">
                  Size
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-4 py-2 font-nav text-sm ${
                        selectedSize === size
                          ? 'bg-nabat-primary text-white'
                          : 'bg-nabat-mist text-nabat-text hover:bg-nabat-border'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              <AddToCartButton product={product} />
            </div>

            {product.description && (
              <div className="mt-10 border-t border-nabat-border pt-8">
                <h3 className="section-label">About</h3>
                <p className="font-body text-sm leading-relaxed text-nabat-muted">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8">
              <h3 className="section-label">Highlights</h3>
              <ul className="space-y-2 font-body text-sm text-nabat-muted">
                {HIGHLIGHTS.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-nabat-accent">—</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 border-t border-nabat-border pt-8">
              <h3 className="font-heading text-xl font-medium">Reviews</h3>
              <div className="mt-6 space-y-6">
                {REVIEWS.map((review, index) => (
                  <div key={index} className="border-t border-nabat-border pt-5 first:border-0 first:pt-0">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-3.5 w-3.5 ${i < review.rating ? 'text-amber-400' : 'text-nabat-border'}`}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <p className="mt-2 font-nav text-sm font-medium text-nabat-text">
                      {review.author}
                    </p>
                    <p className="mt-1 font-body text-sm text-nabat-muted">
                      {review.text}
                    </p>
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
