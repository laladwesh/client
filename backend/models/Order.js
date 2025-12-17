const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String },
  print: { type: String },
  color: { type: String },
  size: { type: String }, // S, M, L, XL
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: { type: Object },
  paymentMethod: { type: String },
  paymentResult: { type: Object },
  itemsPrice: { type: Number },
  taxPrice: { type: Number },
  shippingPrice: { type: Number },
  totalPrice: { type: Number },
  status: { type: String, enum: ['pending','paid','shipped','delivered','cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
