import api from './api';

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order details
 * @param {number} orderData.amount - Amount in INR
 * @param {string} orderData.orderId - Your order ID
 * @param {Object} orderData.customerDetails - Customer details
 * @returns {Promise} Razorpay order data
 */
export const createRazorpayOrder = async (orderData) => {
  try {
    const response = await api.post('/payment/razorpay/create-order', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verify Razorpay payment
 * @param {Object} paymentData - Payment verification data
 * @returns {Promise} Verification result
 */
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await api.post('/payment/razorpay/verify', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Request refund for a payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (optional)
 * @param {string} orderId - Order ID
 * @returns {Promise} Refund result
 */
export const refundPayment = async (paymentId, amount, orderId) => {
  try {
    const response = await api.post('/payment/razorpay/refund', {
      paymentId,
      amount,
      orderId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/payment/razorpay/payment/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Load Razorpay script
 * @returns {Promise<boolean>} True if script loaded successfully
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initialize and display Razorpay payment modal
 * @param {Object} options - Razorpay options
 * @param {string} options.orderId - Razorpay order ID
 * @param {string} options.key - Razorpay key ID
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency code
 * @param {Object} options.prefill - Customer details to prefill
 * @param {Function} options.handler - Success callback
 * @param {Function} options.modal.ondismiss - Modal dismiss callback
 * @returns {Promise} Razorpay instance
 */
export const displayRazorpay = async (options) => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  const razorpayOptions = {
    key: options.key,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name || 'Your Store Name',
    description: options.description || 'Order Payment',
    image: options.image || '/logo.png',
    order_id: options.orderId,
    prefill: {
      name: options.prefill?.name || '',
      email: options.prefill?.email || '',
      contact: options.prefill?.contact || '',
    },
    notes: options.notes || {},
    theme: {
      color: options.theme?.color || '#3399cc',
    },
    handler: options.handler,
    modal: {
      ondismiss: options.modal?.ondismiss || function() {
        console.log('Payment cancelled');
      },
    },
  };

  const razorpayInstance = new window.Razorpay(razorpayOptions);
  razorpayInstance.open();
  
  return razorpayInstance;
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  refundPayment,
  getPaymentDetails,
  loadRazorpayScript,
  displayRazorpay,
};
