import asyncHandler from 'express-async-handler';
import * as razorpayService from '../services/razorpayService.js';
import * as delhiveryService from '../services/delhiveryService.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// POST /api/payment/razorpay/create-order - Create Razorpay order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, orderId, customerDetails } = req.body;
  
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid amount');
  }

  try {
    const razorpayOrder = await razorpayService.createRazorpayOrder({
      amount: amount,
      receipt: orderId || `ORDER_${Date.now()}`,
      notes: {
        userId: req.user?._id?.toString(),
        customerName: customerDetails?.name || '',
        customerEmail: customerDetails?.email || '',
      },
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to create Razorpay order: ' + error.message);
  }
});

// POST /api/payment/razorpay/verify - Verify Razorpay payment
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Missing payment verification details');
  }

  try {
    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      res.status(400);
      throw new Error('Invalid payment signature');
    }

    // Fetch payment details
    const payment = await razorpayService.fetchPayment(razorpay_payment_id);

    // Update order if orderId is provided
    if (orderId) {
      const order = await Order.findById(orderId).populate('user', 'name email phone');
      if (order) {
        order.paymentResult = {
          id: razorpay_payment_id,
          status: payment.status,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          method: payment.method,
          amount: payment.amount / 100, // Convert paise to INR
          captured: payment.captured,
          email: payment.email,
          contact: payment.contact,
        };
        order.status = 'paid';
        order.paymentMethod = 'Razorpay';
        await order.save();

        res.json({
          success: true,
          message: 'Payment verified successfully',
          payment: {
            id: payment.id,
            status: payment.status,
            method: payment.method,
            amount: payment.amount / 100,
            currency: payment.currency,
          },
        });
        return;
      }
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        status: payment.status,
        method: payment.method,
        amount: payment.amount / 100,
        currency: payment.currency,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Payment verification failed: ' + error.message);
  }
});

// POST /api/payment/razorpay/refund - Refund a payment
const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId, amount, orderId } = req.body;

  if (!paymentId) {
    res.status(400);
    throw new Error('Payment ID is required');
  }

  // Validate payment ID format
  if (!paymentId.startsWith('pay_')) {
    res.status(400);
    throw new Error('Invalid payment ID format. Payment ID should start with "pay_"');
  }

  try {
    console.log('Processing refund request:', { paymentId, amount, orderId });
    
    const refund = await razorpayService.refundPayment(paymentId, amount);

    console.log('Refund response:', refund);

    // Check if refund was successful
    if (!refund || !refund.id) {
      throw new Error('Refund response is invalid');
    }

    // Update order status if orderId is provided
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = 'cancelled';
        if (!order.paymentResult) {
          order.paymentResult = {};
        }
        order.paymentResult.refund = {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          createdAt: refund.created_at,
        };
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error('Refund failed:', error);
    res.status(500);
    throw new Error('Refund failed: ' + error.message);
  }
});

// GET /api/payment/razorpay/payment/:paymentId - Get payment details
const getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await razorpayService.fetchPayment(paymentId);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        captured: payment.captured,
        created_at: payment.created_at,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch payment details');
  }
});

export {
  createRazorpayOrder,
  verifyRazorpayPayment,
  refundPayment,
  getPaymentDetails,
};
