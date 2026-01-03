import React from "react";

const BillSidebar = ({ isOpen, onClose, order }) => {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, 300);
    }
  }, [isOpen, mounted]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setMounted(false);
      setClosing(false);
      onClose();
    }, 300);
  };

  if (!mounted || !order) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[10000]"
        onClick={handleClose}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:max-w-md bg-white z-[10001] shadow-2xl flex flex-col drawer-panel ${
          closing ? "drawer-slide-out" : "drawer-slide-in"
        }`}
        style={{
          transformOrigin: "right center",
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-2 ">
            <h2 className="text-black text-base font-bdogrotesk font-medium">
              Order Receipt
            </h2>
            <button
              onClick={handleClose}
              className="text-black text-base font-bdogrotesk font-medium"
            >
              Close
            </button>
          </div>

          {/* Receipt Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3">
            <div
              className="max-w-sm mx-auto"
              style={{ fontFamily: "Courier New, monospace" }}
            >
              {/* Logo */}
              <div className="text-center mb-6">
                <img
                  src="/nufab_black.png"
                  alt="NUFAB"
                  className="h-12 mx-auto"
                />
                <div className="text-base font-bold tracking-wider">
                  RECEIPT
                </div>
              </div>

              {/* Billed To & Order Info */}
              <div className="flex justify-between text-base mb-4">
                <div>
                  <div className="font-semibold mb-1">BILLED TO:</div>
                  <div>ORDER NO.:</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold mb-1">
                    {order.shippingAddress?.name || "Customer"}
                  </div>
                  <div>#{order._id.slice(-6).toUpperCase()}</div>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-black my-4"></div>

              {/* Order Items */}
              <div className="space-y-6">
                {order.items?.map((item, index) => (
                  <div key={index}>
                    {/* Product Layout */}
                    <div className="flex gap-3">
                      {/* Product Image */}
                      {item.image && (
                        <div className="w-36 h-48 bg-gray-100  overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        {/* Top Section: Name and Size */}
                        <div>
                          <div className="text-base font-bold uppercase">
                            {item.productName}
                          </div>
                          {item.size && (
                            <div className="text-base">{item.size}</div>
                          )}
                        </div>

                        {/* Bottom Section: Price Details */}
                        <div className="text-base">
                          <div className="flex justify-between">
                            <span>UNIT PRICE:</span>
                            <span>{item.price?.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>QTY:</span>
                            <span>{item.quantity}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>NET AMOUNT:</span>
                            <span>
                              {(item.price * item.quantity)?.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < order.items.length - 1 && (
                      <div className="border-t-2 border-dashed border-black my-4"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-black my-4"></div>

              {/* Totals */}
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>SUB TOTAL:</span>
                  <span>{order.itemsPrice?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>TAX:</span>
                  <span>{order.taxPrice?.toLocaleString("en-IN") || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span>SHIPPING COST:</span>
                  <span>
                    {order.shippingPrice === 0
                      ? "0.00"
                      : order.shippingPrice?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-black my-4"></div>

              {/* Grand Total */}
              <div className="text-sm">
                <div className="flex justify-between font-bold text-base mb-1">
                  <span>TOTAL:</span>
                  <span>{order.totalPrice?.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-sm text-black">(Inc. of all taxes)</div>
              </div>

              <div className="border-t-2 border-dashed border-black my-4"></div>

              {/* Additional Info */}
              <div className="text-sm text-center text-black ">
                <div>Order Date: {formatDate(order.createdAt)}</div>
                <div>Payment Method: {order.paymentMethod}</div>
                {order.delhivery?.waybill && (
                  <div>Tracking: {order.delhivery.waybill}</div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-black mt-8">
                Thank you for shopping with us!
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="border-t border-gray-200 p-4 space-y-2">
            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Print Receipt
            </button>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div> */}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.right-0 * {
            visibility: visible;
          }
          .fixed.right-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
          }
        }
      `}</style>
    </>
  );
};

export default BillSidebar;
