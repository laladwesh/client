const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders - create order
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Calculate totals (simple)
  let itemsPrice = 0;
  const orderItems = [];
  for (const it of items) {
    const product = await Product.findById(it.product);
    if (!product) {
      res.status(400);
      throw new Error('Product not found: ' + it.product);
    }
    const qty = it.quantity || 1;
    const price = product.discountedPrice || product.mrp;
    itemsPrice += price * qty;
    orderItems.push({ 
      product: product._id, 
      productName: product.product, 
      print: product.print,
      color: product.color,
      size: it.size || 'S',
      price: price, 
      quantity: qty, 
      image: product.images && product.images[0] 
    });
  }

  const taxPrice = Number((itemsPrice * 0.05).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  res.status(201).json(order);
});

// GET /api/orders/my - get orders for logged in user
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id - get order by id (user or admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  // allow owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  res.json(order);
});

// GET /api/orders (admin) - list all
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// PUT /api/orders/:id/status (admin) - update status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  order.status = req.body.status || order.status;
  await order.save();
  res.json(order);
});

module.exports = { createOrder, getMyOrders, getOrderById, getOrders, updateOrderStatus };
