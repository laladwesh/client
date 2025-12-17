import React, { createContext, useState, useContext, useEffect } from 'react';

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
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartTotals(cartItems);
  }, [cartItems]);

  const updateCartTotals = (items) => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
        product: product.product,
        print: product.print,
        color: product.color,
        size,
        quantity,
        price: product.discountedPrice || product.mrp,
        image: product.images?.[0] || '',
        stock: getStockForSize(product, size)
      }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.productId === productId && item.size === size))
    );
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

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
