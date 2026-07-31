import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../WishlistContext/WishlistContext';
import { useCart } from '../CartContext/CartContext';
import { formatEGP } from '../../utils/money';
import pageBanner from '../../assets/images/pagebanner.png';

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div>
      <section className="page-banner">
        <img
          src={pageBanner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-nabat-primary/60" />
        <h1 className="page-banner-title">Wishlist</h1>
      </section>

      <div className="section-pad leaf-wash py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {items.length === 0 ? (
            <div className="border border-nabat-border bg-white p-12 text-center">
              <p className="font-body text-nabat-muted">
                Your wishlist is empty.
              </p>
              <Link to="/shop" className="btn-primary mt-6 inline-flex">
                Browse plants
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 border border-nabat-border bg-white p-4 md:p-5"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/singleproduct/${item.id}`)}
                    className="flex flex-1 items-center gap-4 text-left"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 object-cover bg-nabat-mist"
                    />
                    <div>
                      <p className="font-nav text-xs uppercase tracking-wider text-nabat-muted">
                        {item.category}
                      </p>
                      <p className="font-heading text-lg font-medium">
                        {item.name}
                      </p>
                      <p className="mt-1 font-nav text-sm">
                        {formatEGP(item.price)}
                      </p>
                    </div>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-primary !px-4 !py-2.5"
                      onClick={() => {
                        addToCart(item);
                        removeFromWishlist(item.id);
                      }}
                    >
                      Add to bag
                    </button>
                    <button
                      type="button"
                      className="btn-outline !px-4 !py-2.5"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
