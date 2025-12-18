import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

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
