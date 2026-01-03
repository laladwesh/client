import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * Create a Razorpay order
 * @param {Object} options - Order options
 * @param {number} options.amount - Amount in INR (will be converted to paise)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.receipt - Receipt/order ID
 * @param {Object} options.notes - Additional notes
 * @returns {Promise} Razorpay order object
 */
export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (1 INR = 100 paise)
      currency,
      receipt,
      notes,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error('Failed to create Razorpay order: ' + error.message);
  }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} data - Payment data
 * @param {string} data.razorpay_order_id - Razorpay order ID
 * @param {string} data.razorpay_payment_id - Razorpay payment ID
 * @param {string} data.razorpay_signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
export const verifyPaymentSignature = (data) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    
    // Create signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');
    
    return generated_signature === razorpay_signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise} Payment details
 */
export const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Fetch payment error:', error);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Fetch order details
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise} Order details
 */
export const fetchOrder = async (orderId) => {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error('Fetch order error:', error);
    throw new Error('Failed to fetch order details');
  }
};

/**
 * Refund a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in INR (optional, full refund if not provided)
 * @returns {Promise} Refund details
 */
export const refundPayment = async (paymentId, amount = null) => {
  try {
    // Validate payment ID
    if (!paymentId || typeof paymentId !== 'string' || !paymentId.startsWith('pay_')) {
      throw new Error('Invalid payment ID format');
    }

    const options = amount ? { amount: Math.round(amount * 100) } : {};
    
    console.log('Attempting refund for payment:', paymentId, 'with options:', options);
    
    const refund = await razorpay.payments.refund(paymentId, options);
    
    console.log('Refund successful:', refund);
    return refund;
  } catch (error) {
    console.error('Refund error details:', {
      message: error.message,
      description: error.description,
      statusCode: error.statusCode,
      error: error.error,
      paymentId,
    });
    
    // Throw more detailed error
    const errorMessage = error.description || error.message || 'Failed to process refund';
    throw new Error(errorMessage);
  }
};

/**
 * Capture a payment (if auto-capture is disabled)
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to capture in paise
 * @param {string} currency - Currency code
 * @returns {Promise} Captured payment details
 */
export const capturePayment = async (paymentId, amount, currency = 'INR') => {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount, currency);
    return payment;
  } catch (error) {
    console.error('Capture payment error:', error);
    throw new Error('Failed to capture payment');
  }
};

export default {
  createRazorpayOrder,
  verifyPaymentSignature,
  fetchPayment,
  fetchOrder,
  refundPayment,
  capturePayment,
};
