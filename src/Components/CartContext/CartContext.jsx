import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from '../AuthContext/AuthContext';
import { useProducts } from '../ProductsContext/ProductsContext';
import {
  clearCartItems,
  fetchCartItems,
  removeCartItem,
  replaceCartItems,
  upsertCartItem,
} from '../../supabase/cart';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { currentUser, userLoggedIn } = useAuth();
  const { products, getProductById } = useProducts();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const loadedForUserRef = useRef(null);
  const pendingGuestRef = useRef([]);

  const mapRows = (rows) =>
    rows.map((row) => {
      const product = getProductById(row.product_slug);
      if (!product) {
        return {
          id: row.product_slug,
          name: row.product_slug,
          price: 0,
          image: null,
          quantity: row.quantity,
        };
      }
      return { ...product, quantity: row.quantity };
    });

  // Enrich cart when products load
  useEffect(() => {
    if (!products?.length) return;
    setCartItems((prev) =>
      prev.map((item) => {
        const product = getProductById(item.id);
        return product ? { ...product, quantity: item.quantity } : item;
      })
    );
  }, [products, getProductById]);

  // Load / clear cart based on real authenticated account only
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userLoggedIn || !currentUser?.uid) {
        // Keep any in-memory guest cart; do not sync to Supabase
        if (loadedForUserRef.current) {
          pendingGuestRef.current = [];
          loadedForUserRef.current = null;
          setCartItems([]);
        }
        setCartReady(true);
        return;
      }

      if (loadedForUserRef.current === currentUser.uid) {
        setCartReady(true);
        return;
      }

      setCartReady(false);
      try {
        const rows = await fetchCartItems(currentUser.uid);
        if (cancelled) return;

        const fromDb = mapRows(rows);
        const guest = pendingGuestRef.current;

        if (guest.length) {
          const merged = new Map();
          fromDb.forEach((item) => merged.set(item.id, { ...item }));
          guest.forEach((item) => {
            const existing = merged.get(item.id);
            if (existing) {
              merged.set(item.id, {
                ...existing,
                quantity: existing.quantity + item.quantity,
              });
            } else {
              merged.set(item.id, { ...item });
            }
          });
          const next = Array.from(merged.values());
          pendingGuestRef.current = [];
          setCartItems(next);
          await replaceCartItems(currentUser.uid, next);
        } else {
          setCartItems(fromDb);
        }
        loadedForUserRef.current = currentUser.uid;
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        if (!cancelled) setCartReady(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // Do not depend on getProductById — product enrich is a separate effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoggedIn, currentUser?.uid]);

  // Snapshot guest cart before login so it can merge (clear when empty)
  useEffect(() => {
    if (!userLoggedIn) {
      pendingGuestRef.current = cartItems.length ? [...cartItems] : [];
    }
  }, [userLoggedIn, cartItems]);

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isCartOpen]);

  const persistItem = async (productId, quantity) => {
    if (!userLoggedIn || !currentUser?.uid) return;
    try {
      if (quantity <= 0) await removeCartItem(currentUser.uid, productId);
      else await upsertCartItem(currentUser.uid, productId, quantity);
    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, { openDrawer = true } = {}) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      const nextQty = existingItem ? existingItem.quantity + 1 : 1;
      persistItem(product.id, nextQty);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    if (openDrawer) setIsCartOpen(true);
  };

  const updateQuantity = (id, quantity) => {
    const nextQty = parseInt(quantity, 10);
    if (Number.isNaN(nextQty) || nextQty <= 0) {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      persistItem(id, 0);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: nextQty } : item
      )
    );
    persistItem(id, nextQty);
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    persistItem(id, 0);
  };

  const clearCart = async ({ clearRemote = true } = {}) => {
    setCartItems([]);
    pendingGuestRef.current = [];

    if (!clearRemote) {
      return;
    }

    if (userLoggedIn && currentUser?.uid) {
      try {
        await clearCartItems(currentUser.uid);
        // Keep loaded marker so auth effect does not re-fetch stale lines
        loadedForUserRef.current = currentUser.uid;
      } catch (err) {
        console.error('Failed to clear cart:', err);
        loadedForUserRef.current = null;
        throw err;
      }
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        cartReady,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
