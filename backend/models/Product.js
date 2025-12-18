import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Core identification
  category: { type: String },
  product: { type: String, required: true },
  print: { type: String },
  color: { type: String },
  
  // Fabric details
  fabricType: { type: String },
  fabricPattern: { type: String },
  fabricDescription: { type: String },
  
  // Product categorization
  productType: { type: String },
  length: { type: String },
  lengthInInches: { type: Number },
  sleeves: { type: String },
  closure: { type: String },
  
  // Descriptions
  productDescription: { type: String },
  
  // New fields requested: features (list), sizeNfit (alternate field) and material
  features: [{ type: String }],
  sizeAndFit: { type: String },
  material: { type: String },
  
  // Pricing
  mrp: { type: Number, required: true },
  discountedPrice: { type: Number },
  
  // Stock management
  totalQuantity: { type: Number, default: 0 },
  sizeSQuantity: { type: Number, default: 0 },
  sizeMQuantity: { type: Number, default: 0 },
  sizeLQuantity: { type: Number, default: 0 },
  sizeXLQuantity: { type: Number, default: 0 },
  
  // Additional fields
  slug: { type: String, index: true, unique: true },
  images: [{ type: String }],
  isShownInHomepage: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Virtual for display price
productSchema.virtual('price').get(function() {
  return this.discountedPrice || this.mrp;
});

// Virtual for total stock
productSchema.virtual('stock').get(function() {
  return this.sizeSQuantity + this.sizeMQuantity + this.sizeLQuantity + this.sizeXLQuantity;
});

export default mongoose.model('Product', productSchema);
