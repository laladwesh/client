import React, { useState, useEffect } from 'react';
import { getOrder, trackOrder, addDelhiveryWaybill, createDelhiveryShipment } from '../services/orderService';
import { refundPayment, getPaymentDetails } from '../services/paymentService';
import toast from 'react-hot-toast';

const AdminOrderDetails = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [waybillInput, setWaybillInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);

      // Fetch tracking if waybill exists
      if (orderData.delhivery?.waybill) {
        try {
          const tracking = await trackOrder(orderId);
          setTrackingData(tracking);
        } catch (err) {
          console.error('Tracking fetch failed:', err);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch order details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async () => {
    setActionLoading(true);
    try {
      const result = await createDelhiveryShipment(orderId);
      toast.success(`Shipment created! Waybill: ${result.order.delhivery.waybill}`);
      await fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to create shipment');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddWaybill = async () => {
    if (!waybillInput.trim()) {
      toast.error('Please enter waybill number');
      return;
    }
    setActionLoading(true);
    try {
      await addDelhiveryWaybill(orderId, waybillInput);
      toast.success('Waybill added successfully');
      setWaybillInput('');
      await fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to add waybill');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchOrderDetails();
    toast.success('Refreshed');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      shipped: 'bg-blue-100 text-blue-800 border-blue-300',
      delivered: 'bg-purple-100 text-purple-800 border-purple-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 -m-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">Order Details</h2>
            <p className="text-indigo-100 font-mono text-sm">#{order._id}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)} bg-white`}>
            {order.status.toUpperCase()}
          </span>
          <span className="px-3 py-1 rounded-full text-sm bg-white/20">
            {order.paymentMethod || 'N/A'}
          </span>
          <span className="px-3 py-1 rounded-full text-sm bg-white/20">
            ₹{order.totalPrice?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          {['overview', 'items', 'payment', 'shipping', 'customer'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-mono font-medium">{order._id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{order.items?.length || 0} items</span>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items Total</span>
                    <span>₹{order.itemsPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>₹{order.taxPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice?.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>₹{order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-3">
                {!order.delhivery?.waybill && (
                  <>
                    <button
                      onClick={handleCreateShipment}
                      disabled={actionLoading}
                      className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                      {actionLoading ? 'Creating...' : '📦 Auto-Create Delhivery Shipment'}
                    </button>
                    <div className="text-center text-sm text-gray-500">OR</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={waybillInput}
                        onChange={(e) => setWaybillInput(e.target.value)}
                        placeholder="Enter waybill number"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddWaybill}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </>
                )}
                {order.delhivery?.waybill && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Shipment Created
                    </div>
                    <p className="text-sm text-green-700">
                      Waybill: <span className="font-mono font-bold">{order.delhivery.waybill}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500 font-mono">{item.product}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.print && <span className="block text-gray-600">Print: {item.print}</span>}
                        {item.color && <span className="block text-gray-600">Color: {item.color}</span>}
                        {item.size && <span className="block font-medium">Size: {item.size}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">₹{item.price?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm font-bold">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="font-medium">{order.paymentMethod || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {order.paymentResult && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Razorpay Transaction Details</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                      <p className="font-mono text-sm">{order.paymentResult.razorpay_payment_id || order.paymentResult.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Order ID</p>
                      <p className="font-mono text-sm">{order.paymentResult.razorpay_order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="font-medium">{order.paymentResult.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Method</p>
                      <p className="font-medium capitalize">{order.paymentResult.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="font-bold">₹{order.paymentResult.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Captured</p>
                      <p className="font-medium">{order.paymentResult.captured ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    {order.paymentResult.email && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="text-sm">{order.paymentResult.email}</p>
                      </div>
                    )}
                    {order.paymentResult.contact && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Contact</p>
                        <p className="text-sm">{order.paymentResult.contact}</p>
                      </div>
                    )}
                  </div>
                  {order.paymentResult.razorpay_signature && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Signature (Verified)</p>
                      <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">{order.paymentResult.razorpay_signature}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {order.paymentResult?.refund && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-800 mb-4">Refund Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-red-600 mb-1">Refund ID</p>
                    <p className="font-mono text-sm">{order.paymentResult.refund.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-600 mb-1">Amount</p>
                    <p className="font-bold">₹{order.paymentResult.refund.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-600 mb-1">Status</p>
                    <p className="font-medium">{order.paymentResult.refund.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-600 mb-1">Created At</p>
                    <p className="text-sm">{formatDate(order.paymentResult.refund.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {!order.paymentResult && order.paymentMethod === 'COD' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-amber-800 mb-2">Cash on Delivery</h3>
                <p className="text-amber-700">Payment will be collected upon delivery. Amount: ₹{order.totalPrice?.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            {/* Delhivery Shipment Info */}
            {order.delhivery?.waybill ? (
              <>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Delhivery Shipment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Waybill / Tracking Number</p>
                      <p className="font-mono font-bold text-lg">{order.delhivery.waybill}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Shipment Status</p>
                      <p className="font-medium">{order.delhivery.shipmentStatus || 'In Process'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                      <p className="text-sm">{formatDate(order.delhivery.lastUpdated)}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                {trackingData && trackingData.order?.delhivery?.scans && trackingData.order.delhivery.scans.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4">Tracking Timeline</h3>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      <div className="space-y-4">
                        {trackingData.order.delhivery.scans.map((scan, index) => (
                          <div key={index} className="relative flex items-start pl-10">
                            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                            }`}>
                              {index === 0 ? (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900">{scan.ScanDetail?.Scan || 'Update'}</h4>
                                <span className="text-sm text-gray-500">{formatDate(scan.ScanDetail?.ScanDateTime)}</span>
                              </div>
                              {scan.ScanDetail?.ScannedLocation && (
                                <p className="text-sm text-gray-600">
                                  📍 {scan.ScanDetail.ScannedLocation}
                                </p>
                              )}
                              {scan.ScanDetail?.Instructions && (
                                <p className="text-sm text-gray-500 mt-1">{scan.ScanDetail.Instructions}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">No Shipment Created Yet</h3>
                <p className="text-yellow-700 mb-4">Create a Delhivery shipment to enable tracking.</p>
                <button
                  onClick={handleCreateShipment}
                  disabled={actionLoading}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  Create Shipment Now
                </button>
              </div>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Delivery Address</h3>
                <div className="space-y-2">
                  <p className="font-medium text-lg">{order.shippingAddress.name}</p>
                  <p className="text-gray-700">{order.shippingAddress.address}</p>
                  <p className="text-gray-700">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  {order.shippingAddress.country && (
                    <p className="text-gray-700">{order.shippingAddress.country}</p>
                  )}
                  {order.shippingAddress.phone && (
                    <p className="text-gray-700 font-medium">📱 {order.shippingAddress.phone}</p>
                  )}
                  {order.shippingAddress.email && (
                    <p className="text-gray-700">✉️ {order.shippingAddress.email}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Tab */}
        {activeTab === 'customer' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="font-medium text-lg">{order.user?.name || 'Guest'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">{order.user?.email || 'N/A'}</p>
              </div>
              {order.user?.phone && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-gray-900">{order.user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">User ID</p>
                <p className="font-mono text-sm">{order.user?._id || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetails;
