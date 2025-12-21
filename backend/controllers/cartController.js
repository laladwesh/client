import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';

// GET /api/cart - get current user's cart
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product', 'product images discountedPrice mrp');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // map cart items to include original and discounted prices and percentage
  const mapped = (user.cart || []).map((it) => {
    const product = it.product || {};
    const unitPrice = Number(it.price ?? product.discountedPrice ?? product.mrp ?? 0);
    const originalUnit = Number(product.mrp ?? product.originalPrice ?? Math.round(unitPrice * 1.5));
    const discountPercent = originalUnit > 0 ? Math.round(((originalUnit - unitPrice) / originalUnit) * 100) : 0;
    return {
      product,
      qty: Number(it.qty ?? it.qty === 0 ? it.qty : it.qty),
      size: it.size || '',
      price: unitPrice,
      originalPrice: originalUnit,
      discountPercent,
      addedAt: it.addedAt,
    };
  });

  res.json(mapped);
});

// PUT /api/cart - replace user's cart with provided array
const updateCart = asyncHandler(async (req, res) => {
  const { cart } = req.body; // expect array of { product, qty, size, price }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Validate product ids
  const validCart = [];
  if (Array.isArray(cart)) {
    for (const item of cart) {
      const prodId = item.product ?? item.productId;
      if (!prodId) continue;
      const p = await Product.findById(prodId).select('_id product images discountedPrice mrp');
      if (!p) continue;
      const qty = Number(item.qty ?? item.quantity ?? 1);
      const size = item.size ?? '';
      const price = Number(item.price ?? p.discountedPrice ?? p.mrp ?? 0);
      validCart.push({ product: p._id, qty, size, price });
    }
  }

  user.cart = validCart;
  await user.save();
  const populated = await User.findById(user._id).populate('cart.product', 'product images discountedPrice mrp');

  const mapped = (populated.cart || []).map((it) => {
    const product = it.product || {};
    const unitPrice = Number(it.price ?? product.discountedPrice ?? product.mrp ?? 0);
    const originalUnit = Number(product.mrp ?? product.originalPrice ?? Math.round(unitPrice * 1.5));
    const discountPercent = originalUnit > 0 ? Math.round(((originalUnit - unitPrice) / originalUnit) * 100) : 0;
    return {
      product,
      qty: Number(it.qty ?? it.qty === 0 ? it.qty : it.qty),
      size: it.size || '',
      price: unitPrice,
      originalPrice: originalUnit,
      discountPercent,
      addedAt: it.addedAt,
    };
  });

  res.json(mapped);
});

export { getCart, updateCart };