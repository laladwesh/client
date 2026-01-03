import React, { createContext, useState, useContext, useEffect } from 'react';
import { createOrder } from '../services/orderService';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const items = JSON.parse(storedCart);
      setCartItems(items);
      updateCartTotals(items);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage
    try { localStorage.setItem('cart', JSON.stringify(cartItems)); } catch (e) {}
    updateCartTotals(cartItems);
    // notify other tabs
    window.dispatchEvent(new Event('cart:updated'));
  }, [cartItems]);

  useEffect(() => {
    const onStorage = () => {
      try { const items = JSON.parse(localStorage.getItem('cart') || '[]'); setCartItems(items); updateCartTotals(items); } catch (e) {}
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('cart:updated', onStorage);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('cart:updated', onStorage); };
  }, []);

  const updateCartTotals = (items) => {
    const count = items.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);
    const total = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || item.qty || 0)), 0);
    setCartCount(count);
    setCartTotal(total);
  };

  const addToCart = (product, size, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.productId === product._id && item.size === size
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product._id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, {
        productId: product._id,
        product: product.product || product.title || '',
        print: product.print,
        color: product.color,
        size,
        quantity,
        price: product.discountedPrice || product.mrp || product.price || 0,
        image: product.images?.[0] || '',
        stock: getStockForSize(product, size)
      }];
    });
    const productName = product.product || product.title || 'Product';
    toast.success(`Added to cart: ${productName}`);
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.productId === productId && item.size === size))
    );
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getStockForSize = (product, size) => {
    const sizeMap = {
      'S': product.sizeSQuantity || 0,
      'M': product.sizeMQuantity || 0,
      'L': product.sizeLQuantity || 0,
      'XL': product.sizeXLQuantity || 0
    };
    return sizeMap[size] || 0;
  };

  const placeOrder = async (extra = {}) => {
    // build order payload
    const orderItems = cartItems.map(i => ({ product: i.productId, qty: i.quantity, price: i.price, size: i.size }));
    const payload = {
      items: orderItems,
      totalPrice: cartTotal,
      ...extra
    };
    try {
      const res = await createOrder(payload);
      toast.success('Order placed successfully');
      clearCart();
      setIsCartOpen(false);
      return res;
    } catch (err) {
      toast.error('Could not place order');
      throw err;
    }
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    placeOrder
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
