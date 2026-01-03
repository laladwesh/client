import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
// configure cloudinary from env or CLOUDINARY_URL
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/products
// Optional query: ?shownInHome=true
// Behavior: if shownInHome=true -> return only products with isShownInHomepage=true
// Otherwise return all products (store/other pages should not pass shownInHome=false to filter)
const getProducts = asyncHandler(async (req, res) => {
  const { shownInHome } = req.query;
  const filter = {};
  if (String(shownInHome) === 'true') {
    filter.isShownInHomepage = true;
  }
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

// GET /api/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  // pick 3 random other products as suggestions
  const suggestions = await Product.aggregate([
    { $match: { _id: { $ne: product._id } } },
    { $sample: { size: 3 } },
    { $project: { _id: 1, product: 1, productDescription: 1, images: 1, mrp: 1, discountedPrice: 1, slug: 1 } }
  ]);

  res.json({ product, suggestions });
});

// POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const data = req.body;
  // require product and mrp
  if (!data.product || !data.mrp) {
    res.status(400);
    throw new Error('Product name and MRP are required');
  }
  // generate slug if not provided
  if (!data.slug) {
    const slugBase = `${data.product}-${data.print || ''}-${data.color || ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    data.slug = slugBase;
  }

  const product = await Product.create(data);
  res.status(201).json(product);
});

// PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  Object.assign(product, req.body, { updatedAt: Date.now() });
  await product.save();
  res.json(product);
});

// DELETE /api/products/:id (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.remove();
  res.json({ message: 'Product removed' });
});

export { getProducts, getProduct, createProduct, updateProduct, deleteProduct };

// POST /api/products/:id/images (admin)
const uploadProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!req.file || !req.file.buffer) {
    res.status(400);
    throw new Error('Image file is required');
  }

  // Convert buffer to base64 data URI
  const b64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(b64, { folder: 'products' });

  // Save cloudinary url to product images array
  product.images = product.images || [];
  product.images.push(result.secure_url);
  product.updatedAt = Date.now();
  await product.save();

  res.json({ imageUrl: result.secure_url, product });
});

export { uploadProductImage };

// DELETE /api/products/:id/images (admin)
const removeProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const imageUrl = req.body.imageUrl || req.query.imageUrl;
  if (!imageUrl) {
    res.status(400);
    throw new Error('imageUrl is required');
  }

  product.images = (product.images || []).filter(img => img !== imageUrl);
  product.updatedAt = Date.now();
  await product.save();

  res.json({ message: 'Image removed', product });
});

export { removeProductImage };

// PUT /api/products/:id/images/reorder (admin)
const reorderProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { images } = req.body;
  if (!Array.isArray(images)) {
    res.status(400);
    throw new Error('Images array is required');
  }

  // Update the images array with the new order
  product.images = images;
  product.updatedAt = Date.now();
  await product.save();

  res.json({ message: 'Images reordered successfully', product });
});

export { reorderProductImages };
