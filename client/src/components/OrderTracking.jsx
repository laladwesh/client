import React, { useState, useEffect } from 'react';
import { trackOrder } from '../services/orderService';

const OrderTracking = ({ orderId }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackOrder(orderId);
      setTrackingData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchTracking();
    }
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('delivered')) return 'bg-green-500';
    if (statusLower.includes('transit') || statusLower.includes('dispatched')) return 'bg-blue-500';
    if (statusLower.includes('picked')) return 'bg-yellow-500';
    if (statusLower.includes('pending')) return 'bg-gray-500';
    return 'bg-purple-500';
  };

  if (!orderId) {
    return <div className="text-gray-500">No order selected</div>;
  }

  if (loading && !trackingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button
          onClick={fetchTracking}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trackingData || !trackingData.order?.delhivery?.waybill) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
        <strong className="font-bold">Tracking Not Available</strong>
        <p className="text-sm mt-1">
          Your order is being processed. Tracking information will be available once the order is shipped.
        </p>
      </div>
    );
  }

  const { order, trackingData: delhiveryData } = trackingData;
  const shipment = delhiveryData?.ShipmentData?.[0]?.Shipment || {};
  const scans = shipment.Scans || order.delhivery?.scans || [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order Tracking</h2>
            <p className="text-gray-600 mt-1">Track your order status</p>
          </div>
          <button
            onClick={fetchTracking}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tracking Number</p>
            <p className="font-semibold text-lg">{order.delhivery.waybill}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-semibold text-lg">{order._id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Updated</p>
            <p className="font-semibold">{formatDate(order.delhivery.lastUpdated)}</p>
          </div>
        </div>

        {shipment.Status && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-600">Delhivery Status</p>
            <p className="font-semibold text-blue-800">{shipment.Status}</p>
          </div>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Shipment Journey</h3>
        
        {scans.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Timeline items */}
            <div className="space-y-6">
              {scans.map((scan, index) => (
                <div key={index} className="relative flex items-start pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-0 w-8 h-8 rounded-full ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'} flex items-center justify-center`}>
                    {index === 0 ? (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  
                  {/* Scan details */}
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{scan.ScanDetail?.Scan || 'Update'}</h4>
                        <span className="text-sm text-gray-500">{formatDate(scan.ScanDetail?.ScanDateTime)}</span>
                      </div>
                      {scan.ScanDetail?.ScannedLocation && (
                        <p className="text-sm text-gray-600">
                          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {scan.ScanDetail.ScannedLocation}
                        </p>
                      )}
                      {scan.ScanDetail?.Instructions && (
                        <p className="text-sm text-gray-500 mt-1">{scan.ScanDetail.Instructions}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No tracking events available yet</p>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      {order.shippingAddress && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h3>
          <div className="text-gray-700">
            <p className="font-semibold">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            {order.shippingAddress.phone && <p className="mt-2">Phone: {order.shippingAddress.phone}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
