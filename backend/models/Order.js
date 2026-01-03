import mongoose from 'mongoose';

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
  // Order stages for tracking
  orderStage: { 
    type: String, 
    enum: ['ordered', 'being_made', 'shipped', 'delivered', 'cancelled'], 
    default: 'ordered' 
  },
  stageHistory: [{
    stage: { type: String },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String }
  }],
  // Delhivery tracking fields
  delhivery: {
    waybill: { type: String }, // Delhivery tracking/waybill number
    orderId: { type: String }, // Your reference order ID
    shipmentStatus: { type: String }, // Latest status from Delhivery
    scans: [{ type: Object }], // Tracking scan history
    lastUpdated: { type: Date }, // Last time tracking was updated
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);
