import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// memory storage for multer - we'll upload to Cloudinary directly from buffer
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Upload image for product (form field name: 'image')
router.post('/:id/images', protect, admin, upload.single('image'), uploadProductImage);
// Remove image from product
router.delete('/:id/images', protect, admin, async (req, res, next) => {
  // express.json middleware should parse body; forward to controller
  const { removeProductImage } = await import('../controllers/productController.js');
  return removeProductImage(req, res, next);
});

export default router;
