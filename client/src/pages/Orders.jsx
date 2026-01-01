import React, { useState, useEffect } from 'react';
import { getMyOrders, trackOrder } from '../services/orderService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BillSidebar from '../components/BillSidebar';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [billSidebarOpen, setBillSidebarOpen] = useState(false);
  const [billOrder, setBillOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (order) => {
    setSelectedOrder(order);
    if (order.delhivery?.waybill) {
      try {
        const tracking = await trackOrder(order._id);
        setTrackingData(tracking);
      } catch (error) {
        console.error('Failed to fetch tracking:', error);
      }
    }
  };

  const handleViewBill = (order) => {
    setBillOrder(order);
    setBillSidebarOpen(true);
  };

  const getStageColor = (stage) => {
    const colors = {
      ordered: 'bg-blue-100 text-blue-800',
      being_made: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <BillSidebar 
        isOpen={billSidebarOpen} 
        onClose={() => setBillSidebarOpen(false)} 
        order={billOrder}
      />
      
      <div className="max-w-full font-bdogrotesk mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-normal text-black">Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('/store')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
            >
              Browse Store
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {orders.map((order) => {
              const currentStageIndex = ['ordered', 'being_made', 'shipped', 'delivered'].indexOf(order.orderStage || 'ordered');
              
              return (
                <div key={order._id} className="border-t border-black pt-8">
                  <div className="flex gap-8">
                    {/* Left: Stage Indicator */}
                    <div className="flex flex-col justify-between items-start w-32 flex-shrink-0">
                      <div className="relative">
                        {/* Stage Labels */}
                        <div className="relative space-y-8 pl-3">
                          {/* Vertical Line - only spans from first to last stage */}
                          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-black"></div>
                          
                          {['Ordered', 'Being Made', 'Shipped', 'Delivered'].map((stage, index) => {
                            const isCurrent = index === currentStageIndex;
                            
                            return (
                              <div key={stage} className="flex items-center relative">
                                <span className={`text-sm transition-colors duration-300 ${
                                  isCurrent ? 'text-black font-medium' : 'text-gray-400'
                                }`}>
                                  {stage}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Amount Paid Section */}
                      <div className="pl-3">
                        <div className="text-sm text-black mb-1">Amount Paid.</div>
                        <div className="text-lg font-medium text-black">
                          {order.totalPrice?.toLocaleString('en-IN')}
                        </div>
                        <button 
                          onClick={() => handleViewBill(order)}
                          className="text-sm text-black underline mt-2"
                        >
                          VIEW BILL
                        </button>
                      </div>
                    </div>

                    {/* Right: Order Details */}
                    <div className="flex-1">
                      {/* Order Header Info */}
                      <div className="flex mb-8">
                        <div className="flex justify-around w-full">
                          <div>
                            <div className="text-sm text-black font-medium mb-1">Order Number</div>
                            <div className="text-base text-black">#{order._id.slice(-5).toUpperCase()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-black font-medium mb-1">Order Date</div>
                            <div className="text-base text-black">{formatDate(order.createdAt)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-black font-medium mb-1">Delivery Date</div>
                            <div className="text-base text-black">
                              {order.orderStage === 'delivered' ? formatDate(order.updatedAt) : '5 Jan 2025'}
                            </div>
                          </div>
                          <div className="text-right">
                          <div className="text-sm text-black font-medium mb-1">Ship To</div>
                          <div className="text-base text-black">
                            {order.shippingAddress?.city || 'Gopal Nagar, Indore'}
                          </div>
                        </div>
                        </div>
                        
                      </div>

                      {/* Order Items */}
                      <div className="space-y-6 mb-8">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-6">
                            {/* Product Image */}
                            <div className="w-56 h-64 bg-gray-100 flex-shrink-0 overflow-hidden">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                              <h3 className="text-6xl font-semibold text-black mb-2">
                                {item.productName} - {item.size}
                              </h3>
                              <button 
                                onClick={() => handleTrackOrder(order)}
                                className="text-sm text-black underline mb-4"
                              >
                                Track Order
                              </button>

                              <div className="mt-8">
                                {order.orderStage === 'delivered' ? (
                                  <div className="space-y-2">
                                    <div className="flex gap-4 text-sm text-gray-500">
                                      <span>Cancel</span>
                                      <span>Cancellation window closed on {formatDate(order.updatedAt)}</span>
                                    </div>
                                    <button className="text-sm text-black underline">
                                      Return/Exchange
                                    </button>
                                  </div>
                                ) : order.orderStage === 'cancelled' ? (
                                  <div className="text-sm text-gray-500">
                                    Order cancelled
                                  </div>
                                ) : (
                                  <button className="text-sm text-black underline">
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tracking Details (if available) */}
                      {order.delhivery?.waybill && selectedOrder?._id === order._id && trackingData && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-600 mb-2">
                            Tracking: {order.delhivery.waybill}
                          </div>
                          {trackingData?.trackingData?.ShipmentData?.[0]?.Shipment?.Scans?.length > 0 && (
                            <div className="space-y-1 text-xs text-gray-500 max-h-32 overflow-y-auto">
                              {trackingData.trackingData.ShipmentData[0].Shipment.Scans.slice(0, 3).reverse().map((scan, idx) => (
                                <div key={idx}>
                                  {scan.ScanDetail?.Scan} - {scan.ScanDetail?.ScannedLocation}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Amount and View Bill */}
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
