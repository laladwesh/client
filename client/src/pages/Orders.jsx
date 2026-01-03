import React, { useState, useEffect } from "react";
import { getMyOrders, trackOrder } from "../services/orderService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import BillSidebar from "../components/BillSidebar";

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
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
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
        console.error("Failed to fetch tracking:", error);
      }
    }
  };

  const handleViewBill = (order) => {
    setBillOrder(order);
    setBillSidebarOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
            {/* ... (Empty state remains same) ... */}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders yet
            </h3>
            <button
              onClick={() => navigate("/store")}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
            >
              Browse Store
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {orders.map((order) => {
              const currentStageIndex = [
                "ordered",
                "being_made",
                "shipped",
                "delivered",
              ].indexOf(order.orderStage || "ordered");

              return (
                <div key={order._id} className="border-t border-black pt-8">
                  <div className="flex gap-8">
                    {/* Left: Stage Indicator */}
                    <div className="flex flex-col justify-between items-start w-32 flex-shrink-0">
                      <div className="relative">
                        <div className="relative space-y-8 pl-3">
                          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-black"></div>
                          {[
                            "Ordered",
                            "Being Made",
                            "Shipped",
                            "Delivered",
                          ].map((stage, index) => {
                            const isCurrent = index === currentStageIndex;
                            return (
                              <div
                                key={stage}
                                className="flex items-center relative"
                              >
                                <span
                                  className={`text-sm transition-colors duration-300 ${
                                    isCurrent
                                      ? "text-black font-medium"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {stage}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pl-3">
                        <div className="text-sm text-black mb-1">
                          Amount Paid.
                        </div>
                        <div className="text-lg font-medium text-black">
                          {order.totalPrice?.toLocaleString("en-IN")}
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
                    <div className="px-8 w-full">
                      {/* Order Header Info */}
                      <div className="mb-8 flex justify-between gap-8">
                        <div className="">
                          <div className="text-sm text-black font-medium mb-1">
                            Order Number
                          </div>
                          <div className="text-base text-black">
                            #{order._id.slice(-5).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-black font-medium mb-1">
                            Order Date
                          </div>
                          <div className="text-base text-black">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-black font-medium mb-1">
                            Delivery Date
                          </div>
                          <div className="text-base text-black">
                            {order.orderStage === "delivered"
                              ? formatDate(order.updatedAt)
                              : "5 Jan 2025"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-black font-medium mb-1">
                            Ship To
                          </div>
                          <div className="text-base text-black uppercase">
                        {order.shippingAddress.line1}, {order.shippingAddress.line2}, {order.shippingAddress?.city}, <br />{order.shippingAddress?.state} - {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex gap-6">
                            {/* Product Image - Aligned with Order Number column */}
                            <div className="w-60 h-72 bg-gray-100 flex-shrink-0 overflow-hidden">
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
                                {order.orderStage === "delivered" ? (
                                  <div className="space-y-2">
                                    <div className="flex gap-4 text-sm text-gray-500">
                                      <span>Cancel</span>
                                      <span>
                                        Cancellation window closed on{" "}
                                        {formatDate(order.updatedAt)}
                                      </span>
                                    </div>
                                    <button className="text-sm text-black underline">
                                      Return/Exchange
                                    </button>
                                  </div>
                                ) : order.orderStage === "cancelled" ? (
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

                      {/* Tracking Details */}
                      {order.delhivery?.waybill &&
                        selectedOrder?._id === order._id &&
                        trackingData && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {/* ... (Tracking UI remains same) ... */}
                            <div className="text-sm text-gray-600 mb-2">
                              Tracking: {order.delhivery.waybill}
                            </div>
                            {/* ... */}
                          </div>
                        )}
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
