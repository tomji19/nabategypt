/* @refresh reload */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext/AuthContext';
import { useProducts } from '../ProductsContext/ProductsContext';
import {
  addWishlistItem,
  fetchWishlistSlugs,
  removeWishlistItem,
} from '../../supabase/wishlist';
import { getAuthErrorMessage } from '../../supabase/authErrors';

const WishlistContext = createContext(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}

export function WishlistProvider({ children }) {
  const { currentUser, userLoggedIn } = useAuth();
  const { getProductById, products } = useProducts();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userLoggedIn || !currentUser?.uid) {
        setItems([]);
        return;
      }
      try {
        const slugs = await fetchWishlistSlugs(currentUser.uid);
        if (cancelled) return;
        setItems(
          slugs
            .map((slug) => {
              const product = getProductById(slug);
              if (!product) return null;
              return {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
              };
            })
            .filter(Boolean)
        );
      } catch (err) {
        console.error('Failed to load wishlist:', err);
        if (!cancelled) setItems([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userLoggedIn, currentUser?.uid, getProductById, products]);

  const isInWishlist = (productId) => items.some((i) => i.id === productId);

  const toggleWishlist = async (product) => {
    if (!userLoggedIn || !currentUser?.uid) {
      toast.error('Please sign in to use your wishlist.');
      return;
    }

    const exists = items.some((i) => i.id === product.id);

    setItems((prev) => {
      if (exists) return prev.filter((i) => i.id !== product.id);
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        },
      ];
    });

    try {
      if (exists) await removeWishlistItem(currentUser.uid, product.id);
      else await addWishlistItem(currentUser.uid, product.id);
    } catch (err) {
      console.error('Wishlist sync failed:', err);
      toast.error(getAuthErrorMessage(err, 'Could not update wishlist.'));
    }
  };

  const removeFromWishlist = async (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    if (!userLoggedIn || !currentUser?.uid) return;
    try {
      await removeWishlistItem(currentUser.uid, productId);
    } catch (err) {
      console.error('Wishlist remove failed:', err);
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
