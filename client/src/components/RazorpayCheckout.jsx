import React, { useState } from 'react';
import { createRazorpayOrder, displayRazorpay, verifyRazorpayPayment } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RazorpayCheckout = ({ 
  amount, 
  orderId, 
  onSuccess, 
  onError,
  buttonText = 'Pay Now',
  buttonClassName = 'bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors',
  disabled = false,
  customerDetails = {},
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Razorpay order
      const orderData = await createRazorpayOrder({
        amount,
        orderId: orderId || `ORDER_${Date.now()}`,
        customerDetails: {
          name: customerDetails.name || user?.name || '',
          email: customerDetails.email || user?.email || '',
          contact: customerDetails.contact || '',
        },
      });

      // Step 2: Display Razorpay payment modal
      await displayRazorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        orderId: orderData.orderId,
        name: 'Nufab Store',
        description: `Payment for Order ${orderId || ''}`,
        image: '/logo.png', // Update with your logo path
        prefill: {
          name: customerDetails.name || user?.name || '',
          email: customerDetails.email || user?.email || '',
          contact: customerDetails.contact || '',
        },
        theme: {
          color: '#3399cc',
        },
        handler: async (response) => {
          // Step 3: Verify payment on backend
          try {
            const verificationResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            });

            toast.success('Payment successful!');
            
            if (onSuccess) {
              onSuccess(verificationResult);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
            
            if (onError) {
              onError(error);
            }
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          },
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setLoading(false);
      
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={`${buttonClassName} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default RazorpayCheckout;
