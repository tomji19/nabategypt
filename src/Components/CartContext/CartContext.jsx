/* @refresh reload */
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
import {
  getPriceForSelection,
  makeCartKey,
  normalizeSizeOptions,
  parseCartKey,
  productRequiresSize,
} from '../../utils/productSizes';

const CartContext = createContext();

function toCartLine(product, size, quantity) {
  const productId = product.id;
  const sizeValue = String(size || '').trim();
  const price = getPriceForSelection(product, sizeValue);
  return {
    ...product,
    id: makeCartKey(productId, sizeValue),
    productId,
    size: sizeValue,
    sizeType: product.sizeType || '',
    price,
    quantity,
  };
}

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
      const size = row.size || '';
      const product = getProductById(row.product_slug);
      if (!product) {
        return {
          id: makeCartKey(row.product_slug, size),
          productId: row.product_slug,
          name: row.product_slug,
          price: 0,
          image: null,
          size,
          sizeType: '',
          quantity: row.quantity,
        };
      }
      return toCartLine(product, size, row.quantity);
    });

  // Enrich cart when products load
  useEffect(() => {
    if (!products?.length) return;
    setCartItems((prev) =>
      prev.map((item) => {
        const productId = item.productId || parseCartKey(item.id).productId;
        const size = item.size ?? parseCartKey(item.id).size;
        const product = getProductById(productId);
        if (!product) return item;
        return toCartLine(product, size, item.quantity);
      })
    );
  }, [products, getProductById]);

  // Load / clear cart based on real authenticated account only
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userLoggedIn || !currentUser?.uid) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoggedIn, currentUser?.uid]);

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

  const persistItem = async (cartKey, quantity) => {
    if (!userLoggedIn || !currentUser?.uid) return;
    const { productId, size } = parseCartKey(cartKey);
    try {
      if (quantity <= 0) await removeCartItem(currentUser.uid, productId, size);
      else await upsertCartItem(currentUser.uid, productId, quantity, size);
    } catch (err) {
      console.error('Cart sync failed:', err);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, { openDrawer = true, size = '' } = {}) => {
    if (!product?.id) return false;

    let sizeValue = String(size || '').trim();
    const options = normalizeSizeOptions(product.sizeOptions, product.price);
    if (productRequiresSize(product)) {
      if (!sizeValue && options.length === 1) {
        sizeValue = options[0].value;
      }
      if (!sizeValue || !options.some((o) => o.value === sizeValue)) {
        return false;
      }
    }

    const cartKey = makeCartKey(product.id, sizeValue);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === cartKey);
      const nextQty = existingItem ? existingItem.quantity + 1 : 1;
      persistItem(cartKey, nextQty);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === cartKey ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prevItems, toCartLine(product, sizeValue, 1)];
    });

    if (openDrawer) setIsCartOpen(true);
    return true;
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
