import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyAddresses,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
} from "../services/userService";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/paymentService";
import { createOrder } from "../services/orderService";
import { updateCart as apiUpdateCart } from "../services/cartService";
import ConfirmModal from "../components/ConfirmModal";
import BillSidebar from "../components/BillSidebar";
import toast from "react-hot-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "",
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddr, setEditAddr] = useState(null);
  const [confirm, setConfirm] = useState({ open: false });
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // New state for personal details editing
  const [editingPersonalDetails, setEditingPersonalDetails] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempPhone, setTempPhone] = useState("");

  // User details
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  // Bill sidebar state
  const [billSidebarOpen, setBillSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      toast.error("Please login to continue");
      navigate("/");
      return;
    }

    // Get user details
    try {
      const userData = JSON.parse(user);
      setUserDetails({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
      setTempName(userData.name || "");
      setTempPhone(userData.phone || "");
    } catch (e) {
      console.error("Error parsing user data", e);
    }

    // Load cart from localStorage
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (cart.length === 0) {
        toast.error("Your cart is empty");
        navigate("/");
        return;
      }
      setItems(cart);
    } catch (e) {
      toast.error("Error loading cart");
      navigate("/");
      return;
    }

    // Load addresses
    loadAddresses();
  }, [navigate]);

  const loadAddresses = async () => {
    try {
      const list = await getMyAddresses();
      setAddresses(list || []);
      if ((list || []).length && !selectedAddressId) {
        setSelectedAddressId(list[0]._id);
      }
    } catch (e) {
      console.error("could not load addresses", e);
      setAddresses([]);
    }
  };

  const handleAddAddress = async () => {
    try {
      await addMyAddress(newAddr);
      setNewAddr({
        label: "",
        name: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        phone: "",
        isDefault: false,
      });
      setAdding(false);
      await loadAddresses();
      toast.success("Address added");
    } catch (e) {
      toast.error("Could not add address");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const syncToServer = async (next) => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      try {
        const formattedCart = next.map((item) => ({
          product: item.productId || item.product,
          qty: item.quantity || item.qty,
          size: item.size,
          price: item.price
        }));
        await apiUpdateCart(formattedCart);
      } catch (e) {
        console.error("sync cart failed", e);
      }
    }
  };

  const subtotal = items.reduce(
    (s, i) => s + (i.price || 0) * (i.quantity || 0),
    0
  );
  const discountAmount = appliedDiscount
    ? Math.round((subtotal * appliedDiscount.percent) / 100)
    : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxRate = 0.00; // 5% tax (matching backend)
  const taxAmount = Number((subtotalAfterDiscount * taxRate).toFixed(2));
  const shippingPrice = subtotal > 100 ? 0 : 10; // Free shipping above ₹100
  const total = subtotalAfterDiscount + taxAmount + shippingPrice;

  const applyDiscount = () => {
    // Simple discount code logic - you can customize this
    const validCodes = {
      NUFAB10: { percent: 10, label: "10% OFF" },
      NUFAB20: { percent: 20, label: "20% OFF" },
      WELCOME: { percent: 15, label: "15% OFF" },
    };

    const code = discountCode.toUpperCase();
    if (validCodes[code]) {
      setAppliedDiscount(validCodes[code]);
      toast.success(`Discount applied: ${validCodes[code].label}`);
    } else {
      toast.error("Invalid discount code");
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    toast.success("Discount removed");
  };

  const placeOrder = async () => {
    const addr = addresses.find(
      (a) => String(a._id) === String(selectedAddressId)
    );

    if (!addr) {
      return toast.error("Please select a shipping address");
    }

    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      toast.error("Please login to continue");
      return;
    }

    try {
      // Sync cart to server
      await apiUpdateCart(
        items.map((i) => ({
          product: i.productId,
          qty: i.quantity,
          size: i.size,
          price: i.price,
        }))
      );

      // Create order first
      const order = await createOrder({
        items: items.map((i) => ({
          product: i.productId,
          quantity: i.quantity,
          size: i.size,
        })),
        shippingAddress: addr,
        paymentMethod: "Razorpay",
      });

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      // Create Razorpay order
      const userData = JSON.parse(user);
      const razorpayOrderData = await createRazorpayOrder({
        amount: order.totalPrice, // Use backend calculated total
        orderId: order._id,
        customerDetails: {
          name: userData.name || addr.name,
          email: userData.email || "",
        },
      });

      // Razorpay checkout options
      const options = {
        key: razorpayOrderData.key,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency || "INR",
        name: "Nufab",
        description: "Order Payment",
        order_id: razorpayOrderData.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyData = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });

            if (verifyData.success) {
              toast.success("Payment successful! Order placed");
              // Clear cart
              setItems([]);
              localStorage.setItem("cart", JSON.stringify([]));
              syncToServer([]);
              window.dispatchEvent(new Event("cart:updated"));
              // Navigate to orders page
              navigate("/orders");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: userData.name || addr.name,
          email: userData.email || "",
          contact: addr.phone || "",
        },
        notes: {
          address: `${addr.line1}, ${addr.city}, ${addr.postalCode}`,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      toast.error("Could not place order");
    }
  };

  return (
    <div className="min-h-screen bg-white font-bdogrotesk">
      <div className="max-w-full mx-8 px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-black text-7xl font-medium mb-2">
            You're about to own a piece stitched just for you.
          </h1>
          <p className="text-black text-7xl font-medium">
            We're excited! Just a few more steps.
          </p>
        </div>

        {/* ======================= Step 01 - Bill ======================= */}
        <div className="w-full border-b border-gray-300 py-20 mb-12">
          <div className="flex w-full items-start">
            {/* Column 1: Step Indicator (Fixed Width) */}
            <div className="w-32 shrink-0">
              <span className="text-base font-medium text-black">Step 01</span>
            </div>

            {/* Column 2: Big Title (Fills remaining space up to the right column) */}
            <div className="flex-1 pr-8">
              <h2 className="text-6xl font-medium text-black tracking-tight">
                Bill
              </h2>
            </div>

            {/* Column 3 & 4: Pricing & Actions (Fixed 50% width for alignment) */}
            <div className="w-1/2 shrink-0 flex justify-between pt-1">
              {/* Pricing Table */}
              <div className="grow max-w-xs space-y-3">
                {/* Order Value */}
                <div className="flex justify-between items-center text-black">
                  <span className="text-base font-medium">Order Value</span>
                  <span className="text-base font-bold">₹{subtotal}</span>
                </div>

                {/* Delivery Charges */}
                <div className="flex justify-between items-center text-black">
                  <span className="text-base font-medium">
                    Delivery Charges
                  </span>
                  <span className="text-base font-bold">₹{shippingPrice}</span>
                </div>

                {/* Tax (Optional) */}
                {taxAmount > 0 && (
                  <div className="flex justify-between items-center text-black">
                    <span className="text-base font-medium">Tax (GST)</span>
                    <span className="text-base font-bold">₹{taxAmount}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-6 mt-2">
                  <span className="text-base font-bold text-black">Total</span>
                  <span className="text-base font-bold text-black">
                    ₹{total}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 px-16">
                <button 
                  onClick={() => setBillSidebarOpen(true)}
                  className="text-sm font-bold text-black underline underline-offset-4 decoration-1 hover:text-gray-700 uppercase"
                >
                  View Bill
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= Step 02 - Personal Details ======================= */}
        <div className="w-full border-b border-gray-300 pb-12 mb-12">
          <div className="flex w-full items-start">
            {/* Column 1 */}
            <div className="w-32 shrink-0 pt-3">
              <span className="text-sm font-medium text-black">Step 02</span>
            </div>

            {/* Column 2 */}
            <div className="flex-1 pr-8">
              <h2 className="text-6xl font-medium text-black -mt-2 tracking-tight leading-tight">
                Personal
                <br />
                Details
              </h2>
            </div>

            {/* Column 3 & 4 */}
            <div className="w-1/2 shrink-0 flex justify-between pt-3">
              {editingPersonalDetails ? (
                // EDIT STATE
                <>
                  <div className="grow max-w-sm space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">
                        Name
                      </label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full bg-gray-200 border-none p-2 text-sm focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userDetails.email}
                        disabled
                        className="w-full bg-gray-200 border-none p-2 text-sm text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-black">
                        Number
                      </label>
                      <input
                        type="tel"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        className="w-full bg-gray-200 border-none p-2 text-sm focus:ring-0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 items-start px-16 pt-8 shrink-0">
                    <button
                      onClick={() => {
                        setUserDetails({
                          ...userDetails,
                          name: tempName,
                          phone: tempPhone,
                        });
                        const user = localStorage.getItem("user");
                        if (user) {
                          const userData = JSON.parse(user);
                          userData.name = tempName;
                          userData.phone = tempPhone;
                          localStorage.setItem(
                            "user",
                            JSON.stringify(userData)
                          );
                        }
                        setEditingPersonalDetails(false);
                        toast.success("Details updated");
                      }}
                      className="text-sm font-bold text-black underline underline-offset-4 decoration-1 uppercase hover:text-gray-700"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => {
                        setTempName(userDetails.name);
                        setTempPhone(userDetails.phone);
                        setEditingPersonalDetails(false);
                      }}
                      className="text-sm font-bold text-black underline underline-offset-4 decoration-1 uppercase hover:text-gray-700"
                    >
                      CANCEL
                    </button>
                  </div>
                </>
              ) : (
                // VIEW STATE
                <>
                  <div className="space-y-1 text-black grow">
                    <div className="text-base font-medium">
                      {userDetails.name || "No name"}
                    </div>
                    <div className="text-base font-medium">
                      {userDetails.email || "No email"}
                    </div>
                    <div className="text-base font-medium">
                      {userDetails.phone || "No phone"}
                    </div>
                  </div>

                  <div className="px-16 shrink-0">
                    <button
                      onClick={() => setEditingPersonalDetails(true)}
                      className="text-sm font-bold text-black underline underline-offset-4 decoration-1 uppercase hover:text-gray-700"
                    >
                      EDIT
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ======================= Step 03 - Address ======================= */}
        <div className="w-full border-b border-gray-300 pb-12 mb-12">
          <div className="flex w-full items-start">
            {/* Column 1 */}
            <div className="w-32 shrink-0 ">
              <span className="text-sm font-medium text-black">Step 03</span>
            </div>

            {/* Column 2 */}
            <div className="flex-1 pr-8">
              <h2 className="text-6xl font-medium text-black -mt-3 tracking-tight">
                Address
              </h2>
            </div>

            {/* Column 3 & 4 */}
            <div className="w-1/2 shrink-0 flex justify-between pt-1">
              {addresses.length === 0 ? (
                // STATE: NO ADDRESS
                <div className="w-full">
                  <div className="text-base text-black mb-3 font-medium">
                    No address saved
                  </div>
                  <button
                    onClick={() => setAdding(true)}
                    className="text-sm font-bold text-black underline underline-offset-4 decoration-1 uppercase hover:text-gray-700"
                  >
                    ADD ADDRESS
                  </button>
                </div>
              ) : editingAddressId ? (
                // STATE: EDITING ADDRESS
                <>
                  <div className="grow max-w-sm space-y-4">
                    <input
                      className="w-full bg-gray-200 border-none p-2 text-sm focus:ring-0 placeholder-gray-500"
                      value={editAddr.name || ""}
                      onChange={(e) =>
                        setEditAddr({ ...editAddr, name: e.target.value })
                      }
                      placeholder="Full Name"
                    />
                    <input
                      className="w-full bg-gray-200 border-none p-2 text-sm focus:ring-0 placeholder-gray-500"
                      value={editAddr.phone || ""}
                      onChange={(e) =>
                        setEditAddr({ ...editAddr, phone: e.target.value })
                      }
                      placeholder="Phone"
                    />
                    <input
                      className="w-full bg-gray-200 border-none p-2 text-sm focus:ring-0 placeholder-gray-500"
                      value={editAddr.line1 || ""}
                      onChange={(e) =>
                        setEditAddr({ ...editAddr, line1: e.target.value })
                      }
                      placeholder="Address Line 1"
                    />
                    <input
                      className="w-full bg-gray-200 border-none p-2 text-sm focus:ring-0 placeholder-gray-500"
                      value={editAddr.line2 || ""}
                      onChange={(e) =>
                        setEditAddr({ ...editAddr, line2: e.target.value })
                      }
                      placeholder="Address Line 2 (Optional)"
                    />
                    <div className="flex gap-2">
                      <input
                        className="w-1/2 bg-gray-200 border-none p-2 text-sm focus:ring-0 placeholder-gray-500"
                        value={editAddr.city || ""}
                        onChange={(e) =>
                          setEditAddr({ ...editAddr, city: e.target.value })
                        }
                        placeholder="City"
                      />
                      <input
                        className="w-1/2 bg-gray-200 border-none p-2 text-sm focus:ring-0 placeholder-gray-500"
                        value={editAddr.state || ""}
                        onChange={(e) =>
                          setEditAddr({ ...editAddr, state: e.target.value })
                        }
                        placeholder="State"
                      />
                    </div>
                    <input
                      className="w-1/2 bg-gray-200 border-none p-2 text-sm focus:ring-0 placeholder-gray-500"
                      value={editAddr.postalCode || ""}
                      onChange={(e) =>
                        setEditAddr({ ...editAddr, postalCode: e.target.value })
                      }
                      placeholder="Postal Code"
                    />
                  </div>

                  <div className="flex gap-4 items-start px-16 pt-8 shrink-0">
                    <button
                      onClick={async () => {
                        try {
                          const addrToUpdate = addresses.find(
                            (a) => String(a._id) === String(editingAddressId)
                          );
                          await updateMyAddress(addrToUpdate._id, editAddr);
                          await loadAddresses();
                          setEditingAddressId(null);
                          toast.success("Address updated");
                        } catch (e) {
                          toast.error("Could not update address");
                        }
                      }}
                      className="text-sm font-bold text-black underline underline-offset-4 decoration-1 uppercase hover:text-gray-700"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => {
                        setEditingAddressId(null);
                        setEditAddr(null);
                      }}
                      className="text-sm font-bold text-black underline underline-offset-4 decoration-1 uppercase hover:text-gray-700"
                    >
                      CANCEL
                    </button>
                  </div>
                </>
              ) : (
                // STATE: VIEW ADDRESS
                (() => {
                  const addr =
                    addresses.find(
                      (a) => String(a._id) === String(selectedAddressId)
                    ) || addresses[0];

                  return (
                    <>
                      <div className="space-y-1 text-black grow">
                        <div className="text-base font-medium">
                          {addr?.name || userDetails.name}
                        </div>
                        <div className="text-base font-medium">
                          {addr?.phone || userDetails.phone}
                        </div>
                        <div className="text-base font-medium">
                          {addr?.line1}
                          {addr?.line2 ? ", " + addr?.line2 : ""}
                          {addr?.city && `, ${addr.city}`}
                        </div>
                        <div className="text-base font-medium">
                          {addr?.state} {addr?.postalCode}
                        </div>
                      </div>

                      <div className="px-16 shrink-0">
                        <button
                          onClick={() => {
                            setEditingAddressId(String(addr._id));
                            setEditAddr({
                              ...addr,
                              isDefault: !!addr.isDefault,
                            });
                          }}
                          className="text-sm font-bold text-black underline underline-offset-4 decoration-1 uppercase hover:text-gray-700"
                        >
                          EDIT
                        </button>
                      </div>
                    </>
                  );
                })()
              )}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={placeOrder}
            disabled={!selectedAddressId && addresses.length === 0}
            className="group bg-black text-white px-12 py-3 flex  justify-between text-base font-semibold tracking-wide disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <div className="relative h-5 overflow-hidden">
              <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                <span className="flex font-bdogrotesk h-5 items-center">
                  Continue
                </span>
                <span className="flex h-5 items-center">Continue</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modal for adding new address */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Address</h3>
            <div className="space-y-3">
              <input
                value={newAddr.name}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, name: e.target.value })
                }
                placeholder="Full name"
                className="w-full p-2 border rounded"
              />
              <input
                value={newAddr.phone}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, phone: e.target.value })
                }
                placeholder="Phone"
                className="w-full p-2 border rounded"
              />
              <input
                value={newAddr.line1}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, line1: e.target.value })
                }
                placeholder="Address line 1"
                className="w-full p-2 border rounded"
              />
              <input
                value={newAddr.line2}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, line2: e.target.value })
                }
                placeholder="Address line 2 (optional)"
                className="w-full p-2 border rounded"
              />
              <input
                value={newAddr.city}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, city: e.target.value })
                }
                placeholder="City"
                className="w-full p-2 border rounded"
              />
              <input
                value={newAddr.state}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, state: e.target.value })
                }
                placeholder="State"
                className="w-full p-2 border rounded"
              />
              <input
                value={newAddr.postalCode}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, postalCode: e.target.value })
                }
                placeholder="Postal code"
                className="w-full p-2 border rounded"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddAddress}
                  className="flex-1 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Save Address
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setNewAddr({
                      label: "",
                      name: "",
                      line1: "",
                      line2: "",
                      city: "",
                      state: "",
                      country: "",
                      postalCode: "",
                      phone: "",
                      isDefault: false,
                    });
                  }}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirm?.open && (
        <ConfirmModal
          open={confirm.open}
          title={confirm.title}
          description={confirm.description}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel}
        />
      )}
      
      <BillSidebar
        isOpen={billSidebarOpen}
        onClose={() => setBillSidebarOpen(false)}
        order={{
          _id: 'PREVIEW',
          shippingAddress: addresses.find(a => String(a._id) === String(selectedAddressId)) || { name: userDetails.name },
          items: items.map(item => ({
            productName: item.product,
            image: item.image,
            size: item.size,
            price: item.price,
            quantity: item.quantity
          })),
          itemsPrice: subtotal,
          shippingPrice: shippingPrice,
          taxPrice: taxAmount,
          totalPrice: total,
          createdAt: new Date().toISOString(),
          paymentMethod: 'Not Paid Yet'
        }}
      />
    </div>
  );
}
