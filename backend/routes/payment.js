import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  refundPayment,
  getPaymentDetails,
} from '../controllers/paymentController.js';

const router = express.Router();

// Customer routes
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Admin routes
router.post('/razorpay/refund', protect, admin, refundPayment);
router.get('/razorpay/payment/:paymentId', protect, admin, getPaymentDetails);

export default router;
