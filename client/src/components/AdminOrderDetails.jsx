import React, { useState, useEffect } from 'react';
import { getOrder, trackOrder, addDelhiveryWaybill, createDelhiveryShipment, cancelDelhiveryShipment, updateOrderStage } from '../services/orderService';
// Importing from your provided paymentService file
import { refundPayment, getPaymentDetails } from '../services/paymentService';
import toast from 'react-hot-toast';

// --- Icons (Clean Inline SVGs) ---
const Icons = {
  Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Box: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Truck: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  CreditCard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Copy: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Sync: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
};

const AdminOrderDetails = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Action States
  const [waybillInput, setWaybillInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
      
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
    } finally {
      setLoading(false);
    }
  };

  // --- Shipping Handlers ---
  const handleCreateShipment = async () => {
    setActionLoading(true);
    try {
      const result = await createDelhiveryShipment(orderId);
      toast.success(`Shipment created! Waybill: ${result.order.delhivery.waybill}`);
      await fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to create shipment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddWaybill = async () => {
    if (!waybillInput.trim()) return toast.error('Enter waybill number');
    setActionLoading(true);
    try {
      await addDelhiveryWaybill(orderId, waybillInput);
      toast.success('Waybill added');
      setWaybillInput('');
      await fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to add waybill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelShipment = async () => {
    setActionLoading(true);
    try {
      await cancelDelhiveryShipment(orderId);
      toast.success('Shipment cancelled');
      setShowCancelConfirm(false);
      await fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to cancel shipment');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Payment Handlers (New Integration) ---
  
  const handleSyncPayment = async () => {
    if (!order.paymentResult?.razorpay_payment_id) return;
    const toastId = toast.loading('Syncing with Razorpay...');
    try {
      // Using your service function
      const details = await getPaymentDetails(order.paymentResult.razorpay_payment_id);
      toast.success(`Status: ${details.payment.status}`, { id: toastId });
      console.log('Payment Details:', details.payment);
      // In a real app, you might want to update the database here if status changed
      // For now, we just refresh the local order view
      await fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to sync payment', { id: toastId });
      console.error(error);
    }
  };

  const handleRefund = async () => {
    if (!order.paymentResult?.razorpay_payment_id) return;
    
    setActionLoading(true);
    const toastId = toast.loading('Processing refund...');
    
    try {
      // Using your service function
      // Note: Passing total price as default amount, or you could add an input for partial
      await refundPayment(
        order.paymentResult.razorpay_payment_id, 
        order.totalPrice, 
        order._id
      );
      toast.success('Refund processed successfully', { id: toastId });
      setShowRefundConfirm(false);
      await fetchOrderDetails();
    } catch (error) {
      toast.error(error.message || 'Refund failed', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStageChange = async (newStage) => {
    setActionLoading(true);
    try {
      const result = await updateOrderStage(orderId, newStage);
      setOrder(result.order);
      toast.success(`Order stage updated to ${newStage.replace('_', ' ')}`);
      await fetchOrderDetails();
    } catch (error) {
      toast.error('Failed to update order stage');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Utility Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (!order) return <div className="p-8 text-center text-gray-500">Order not found</div>;

  return (
    <div className="bg-white h-full flex flex-col text-sm text-gray-800">
      
      {/* 1. Header Section */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h2>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-gray-500 text-xs mt-1">Placed on {formatDate(order.createdAt)} via {order.paymentMethod}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={fetchOrderDetails} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
            <Icons.Refresh />
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <Icons.Close />
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="px-6 border-b border-gray-100">
        <div className="flex gap-6">
          {['overview', 'items', 'shipping', 'payment', 'customer'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)]">
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Financial Summary */}
            <div className="md:col-span-2 space-y-6">
              <SectionCard title="Financial Summary">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem label="Subtotal" value={`₹${order.itemsPrice?.toFixed(2)}`} />
                    <StatItem label="Tax" value={`₹${order.taxPrice?.toFixed(2)}`} />
                    <StatItem label="Shipping" value={order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`} />
                    <StatItem label="Total" value={`₹${order.totalPrice?.toFixed(2)}`} highlight />
                 </div>
              </SectionCard>

              {/* Order Items Preview */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium text-right">Qty</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items?.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded object-cover border border-gray-200" />}
                            <span className="font-medium text-gray-700">{item.productName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Actions & Status */}
            <div className="space-y-6">
              {/* Order Stage Management */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Order Stage</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Current Stage</div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {order.orderStage ? order.orderStage.replace('_', ' ') : 'Ordered'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Update Stage To:</div>
                    {order.orderStage !== 'being_made' && order.orderStage !== 'shipped' && order.orderStage !== 'delivered' && (
                      <button
                        onClick={() => handleStageChange('being_made')}
                        disabled={actionLoading}
                        className="w-full py-2 px-3 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 transition-all"
                      >
                        Being Made
                      </button>
                    )}
                    {order.orderStage === 'being_made' && !order.delhivery?.waybill && (
                      <div className="text-xs text-gray-500 italic p-2 bg-blue-50 rounded border border-blue-100">
                        Create shipment to move to "Shipped" stage
                      </div>
                    )}
                    {order.orderStage !== 'delivered' && order.orderStage !== 'cancelled' && (
                      <button
                        onClick={() => handleStageChange('cancelled')}
                        disabled={actionLoading}
                        className="w-full py-2 px-3 text-sm bg-white border border-red-200 rounded-lg hover:bg-red-50 text-red-600 font-medium disabled:opacity-50 transition-all"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Shipment Actions</h3>
                
                {!order.delhivery?.waybill ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleCreateShipment}
                      disabled={actionLoading}
                      className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {actionLoading ? 'Processing...' : 'Auto-Create Shipment'}
                    </button>
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink-0 mx-2 text-gray-400 text-xs">OR MANUAL</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={waybillInput}
                        onChange={(e) => setWaybillInput(e.target.value)}
                        placeholder="Waybill #"
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                      <button
                        onClick={handleAddWaybill}
                        disabled={actionLoading}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Active Shipment</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-medium text-gray-900">{order.delhivery.waybill}</span>
                        <button onClick={() => copyToClipboard(order.delhivery.waybill)} className="text-gray-400 hover:text-gray-600"><Icons.Copy /></button>
                      </div>
                    </div>
                    
                    {!showCancelConfirm ? (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        Cancel Shipment
                      </button>
                    ) : (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                        <p className="text-xs text-red-800 mb-2 font-medium">Are you sure?</p>
                        <div className="flex gap-2 justify-center">
                          <button onClick={handleCancelShipment} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">Yes</button>
                          <button onClick={() => setShowCancelConfirm(false)} className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50">No</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ITEMS */}
        {activeTab === 'items' && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {item.image ? (
                            <img className="h-10 w-10 rounded-lg object-cover border border-gray-200" src={item.image} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><Icons.Box /></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          <div className="text-xs text-gray-500 font-mono">{item.product}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-y-1">
                      {item.size && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">Size: {item.size}</span>}
                      {item.color && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Color: {item.color}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">₹{item.price?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: SHIPPING */}
        {activeTab === 'shipping' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6">
              {/* Address Card */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Destination</h4>
                {order.shippingAddress ? (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-900 text-lg">{order.shippingAddress.name}</p>
                    <div className="text-gray-600 leading-relaxed">
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 space-y-1">
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="text-gray-400">P:</span> {order.shippingAddress.phone}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="text-gray-400">E:</span> {order.shippingAddress.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No address provided.</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Shipment Progress</h4>
              {trackingData?.order?.delhivery?.scans?.length > 0 ? (
                 <div className="relative pl-4 border-l-2 border-gray-100 space-y-8 my-4">
                  {trackingData.order.delhivery.scans.map((scan, idx) => (
                    <div key={idx} className="relative">
                      {/* Dot */}
                      <div className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-white ring-1 ${idx === 0 ? 'bg-indigo-600 ring-indigo-600' : 'bg-gray-200 ring-gray-200'}`}></div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                        <p className={`text-sm font-medium ${idx === 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                          {scan.ScanDetail?.Scan}
                        </p>
                        <span className="text-xs text-gray-400 font-mono">
                          {formatDate(scan.ScanDetail?.ScanDateTime)}
                        </span>
                      </div>
                      
                      {scan.ScanDetail?.ScannedLocation && (
                        <p className="text-xs text-gray-400 mt-0.5">{scan.ScanDetail.ScannedLocation}</p>
                      )}
                    </div>
                  ))}
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="text-gray-300 mb-2"><Icons.Truck /></div>
                  <p className="text-gray-500 text-sm">No tracking events available yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PAYMENT (New Refund & Details Logic) */}
        {activeTab === 'payment' && (
          <div className="space-y-6 max-w-2xl">
            <SectionCard title="Payment Overview">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <StatItem label="Method" value={order.paymentMethod} />
                <StatItem label="Status" value={order.status} isBadge />
                
                {order.paymentResult && (
                  <>
                    <div className="col-span-2 border-t border-gray-100 my-2"></div>
                    <div className="col-span-2 flex items-center justify-between group">
                      <div>
                         <p className="text-xs text-gray-500 mb-1">Razorpay Payment ID</p>
                         <div className="flex items-center gap-2">
                           <p className="font-mono text-sm font-medium text-gray-900">{order.paymentResult.razorpay_payment_id}</p>
                           <button onClick={() => copyToClipboard(order.paymentResult.razorpay_payment_id)} className="text-gray-300 hover:text-gray-500"><Icons.Copy /></button>
                         </div>
                      </div>
                      <button 
                        onClick={handleSyncPayment}
                        className="text-xs flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                      >
                        <Icons.Sync /> Sync Status
                      </button>
                    </div>
                    
                    <StatItem label="Razorpay Order ID" value={order.paymentResult.razorpay_order_id} mono />
                    <StatItem label="Payer Email" value={order.paymentResult.email} />
                  </>
                )}
              </div>
            </SectionCard>

            {/* Refund Section - Only visible if paid via Razorpay and not COD */}
            {order.paymentResult?.razorpay_payment_id && order.status === 'paid' && !order.isRefunded && (
               <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                 <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide opacity-70">Refund Management</h3>
                 
                 {!showRefundConfirm ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Need to refund this order?</p>
                      <button 
                        onClick={() => setShowRefundConfirm(true)}
                        className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-100 border border-transparent transition-all"
                      >
                        Initiate Refund
                      </button>
                    </div>
                 ) : (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          <p className="text-sm font-bold text-red-800">Confirm Full Refund?</p>
                          <p className="text-xs text-red-600 mt-1">This will return ₹{order.totalPrice} to the customer.</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button 
                            onClick={handleRefund}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none text-xs bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm disabled:opacity-50"
                          >
                            {actionLoading ? 'Processing...' : 'Yes, Refund'}
                          </button>
                          <button 
                            onClick={() => setShowRefundConfirm(false)}
                            disabled={actionLoading}
                            className="flex-1 sm:flex-none text-xs bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                 )}
               </div>
            )}

            {/* Refund Details (If already refunded) */}
            {(order.paymentResult?.refund || order.isRefunded) && (
               <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                 <h4 className="text-red-800 font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Refund Processed
                 </h4>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    {order.paymentResult?.refund && (
                      <>
                        <div>
                          <span className="block text-red-400 text-xs">Refund ID</span>
                          <span className="font-mono text-red-700">{order.paymentResult.refund.id}</span>
                        </div>
                        <div>
                          <span className="block text-red-400 text-xs">Amount</span>
                          <span className="font-bold text-red-700">₹{order.paymentResult.refund.amount}</span>
                        </div>
                      </>
                    )}
                 </div>
               </div>
            )}
          </div>
        )}

        {/* TAB: CUSTOMER */}
        {activeTab === 'customer' && (
          <div className="max-w-xl">
             <div className="flex items-center gap-4 mb-6">
               <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <Icons.User />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-gray-900">{order.user?.name || 'Guest User'}</h3>
                 <p className="text-gray-500">Customer ID: <span className="font-mono text-xs">{order.user?._id || 'N/A'}</span></p>
               </div>
             </div>
             
             <SectionCard title="Contact Info">
               <div className="space-y-3">
                 <StatItem label="Email Address" value={order.user?.email} />
                 <StatItem label="Phone Number" value={order.user?.phone} />
               </div>
             </SectionCard>
          </div>
        )}

      </div>
    </div>
  );
};

// --- Subcomponents for Clean UI ---

const SectionCard = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
    <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide opacity-70">{title}</h3>
    {children}
  </div>
);

const StatItem = ({ label, value, highlight, mono, isBadge }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    {isBadge ? (
      <StatusBadge status={value} />
    ) : (
      <p className={`font-medium text-gray-900 ${highlight ? 'text-lg' : 'text-sm'} ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </p>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-emerald-100 text-emerald-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const defaultStyle = 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || defaultStyle}`}>
      {status}
    </span>
  );
};

export default AdminOrderDetails;