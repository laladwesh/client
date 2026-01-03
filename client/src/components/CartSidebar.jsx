import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart as apiGetCart,
  updateCart as apiUpdateCart,
} from "../services/cartService";
import toast from "react-hot-toast";

export default function CartSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [items, setItems] = useState([]);

  const loadFromLocal = () => {
    try {
      const c = JSON.parse(localStorage.getItem("cart") || "[]");
      setItems(c);
    } catch (e) {
      setItems([]);
    }
  };

  useEffect(() => {
    loadFromLocal();
    const onToggle = (e) => {
      const open = e?.detail?.open ?? !isOpen;
      if (open) {
        setMounted(true);
        setClosing(false);
        setIsOpen(true);
        loadFromLocal();
      } else {
        setClosing(true);
        setIsOpen(false);
        setTimeout(() => {
          setMounted(false);
          setClosing(false);
        }, 300);
      }
    };
    const onUpdated = () => loadFromLocal();

    window.addEventListener("cart:toggle", onToggle);
    window.addEventListener("cart:updated", onUpdated);

    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      apiGetCart()
        .then((serverCart) => {
          if (Array.isArray(serverCart) && serverCart.length > 0) {
            const mapped = serverCart.map((i) => ({
              productId: i.product._id,
              product: i.product.product,
              image: i.product.images?.[0] || "",
              size: i.size || "",
              quantity: i.qty ?? i.quantity ?? 1,
              price: i.price ?? i.product.discountedPrice ?? 0,
              originalPrice: i.originalPrice ?? i.product.mrp ?? null,
              discountPercent: i.discountPercent ?? 0,
            }));
            setItems(mapped);
            localStorage.setItem("cart", JSON.stringify(mapped));
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("cart:toggle", onToggle);
      window.removeEventListener("cart:updated", onUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = items.reduce(
    (s, i) => s + (i.price || 0) * (i.quantity || 0),
    0
  );
  const taxRate = 0.00; // Tax disabled
  const taxAmount = Number((subtotal * taxRate).toFixed(2));
  const shippingPrice = subtotal > 100 ? 0 : 10;
  const total = subtotal + taxAmount + shippingPrice;

  const syncToServer = async (next) => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      try {
        await apiUpdateCart(next);
      } catch (e) {
        console.error("sync cart failed", e);
      }
    }
  };

  const updateQty = (productId, size, qty) => {
    const next = items
      .map((it) =>
        it.productId === productId && it.size === size
          ? { ...it, quantity: qty }
          : it
      )
      .filter((i) => i.quantity > 0);
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart:updated"));
    syncToServer(next);
  };

  const updateSize = (productId, oldSize, newSize) => {
    if (oldSize === newSize) return;
    let next = [...items];
    const idx = next.findIndex(
      (it) => it.productId === productId && it.size === oldSize
    );
    if (idx === -1) return;
    const existingIdx = next.findIndex(
      (it) => it.productId === productId && it.size === newSize
    );
    if (existingIdx !== -1) {
      next[existingIdx] = {
        ...next[existingIdx],
        quantity: (next[existingIdx].quantity || 0) + (next[idx].quantity || 0),
      };
      next.splice(idx, 1);
    } else {
      next[idx] = { ...next[idx], size: newSize };
    }
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart:updated"));
    syncToServer(
      next.map((i) => ({
        product: i.productId,
        qty: i.quantity,
        size: i.size,
        price: i.price,
      }))
    );
  };

  const removeItem = (productId, size) => {
    const next = items.filter(
      (it) => !(it.productId === productId && it.size === size)
    );
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart:updated"));
    syncToServer(next);
    toast.success("Removed from cart");
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Check if user is logged in
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      toast.error("Please login to continue to checkout");
      try {
        window.dispatchEvent(
          new CustomEvent("signup:toggle", { detail: { open: true } })
        );
      } catch (e) {}
      return;
    }

    // Close cart sidebar
    setClosing(true);
    setIsOpen(false);
    setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 300);

    // Navigate to checkout page
    navigate("/checkout");
  };

  return (
    <>
      {mounted && (
        <>
          <div
            className="fixed inset-0 bg-black/40 font-bdogrotesk z-[10000]"
            onClick={() => {
              setClosing(true);
              setIsOpen(false);
              setTimeout(() => setMounted(false), 300);
            }}
          />

          <div
            className={`fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-[10001] shadow-2xl flex flex-col drawer-panel ${
              closing ? "drawer-slide-out" : "drawer-slide-in"
            }`}
          >
            <div className="p-2 flex items-center justify-between">
              <h3 className="text-base text-black font-bdogrotesk">
                Cart{" "}
                <span className="text-base font-bdogrotesk text-black">
                  {items.length}
                </span>
              </h3>
              <button
                onClick={() => {
                  setClosing(true);
                  setIsOpen(false);
                  setTimeout(() => setMounted(false), 300);
                }}
                className="text-base text-black font-bdogrotesk"
              >
                Close
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
              {items.length === 0 ? (
                <div className="text-center text-black py-48 font-bold text-2xl">
                  ...
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((it) => (
                    <div key={`${it.productId}-${it.size}`}>
                      <div className="flex gap-4 items-start">
                        <div className="w-40 h-48 bg-gray-100 flex-shrink-0 overflow-hidden">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col min-h-[12rem]">
                          <div className="flex justify-between items-start">
                            <div className="max-w-[220px]">
                              <div className="font-medium font-bdogrotesk text-base">
                                {it.product}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                {[
                                  "XXS",
                                  "XS",
                                  "S",
                                  "M",
                                  "L",
                                  "XL",
                                  "XXL",
                                  "Custom",
                                ].map((sz) => (
                                  <button
                                    key={sz}
                                    onClick={() =>
                                      updateSize(it.productId, it.size, sz)
                                    }
                                    className={`text-sm ${
                                      it.size === sz
                                        ? "font-semibold text-black border-b-2 border-solid border-black"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-3 mt-4">
                                <div className="flex items-center border-2 border-black">
                                  <button
                                    onClick={() =>
                                      updateQty(
                                        it.productId,
                                        it.size,
                                        Math.max(0, (it.quantity || 1) - 1)
                                      )
                                    }
                                    className="px-3 py-1 text-sm"
                                  >
                                    -
                                  </button>
                                  <div className="px-5 text-sm">
                                    {it.quantity}
                                  </div>
                                  <button
                                    onClick={() =>
                                      updateQty(
                                        it.productId,
                                        it.size,
                                        (it.quantity || 1) + 1
                                      )
                                    }
                                    className="px-3 py-1 text-sm"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    removeItem(it.productId, it.size)
                                  }
                                  className="px-4 py-1 border-2 font-bdogrotesk border-solid border-black text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <div className="text-sm font-semibold pr-3 text-right shrink-0">
                              ₹{(it.price || 0) * (it.quantity || 0)}
                            </div>
                          </div>
                          <div className="mt-auto flex items-end gap-2 pb-1">
                            <div className="text-sm text-gray-400 line-through">
                              ₹
                              {Math.round(
                                (it.originalPrice ??
                                  Math.round((it.price || 0) * 1.5)) *
                                  (it.quantity || 0)
                              )}
                            </div>
                            <div className="text-sm font-semibold">
                              ₹{(it.price || 0) * (it.quantity || 0)}
                              <span className="text-red-500 text-xs">
                                ({it.discountPercent ?? 0}% Off)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr className="my-4 border-black" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t">
                <div className="space-y-2 mb-4">
                  {/* <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tax (0% GST)</span>
                    <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
                  </div>
                  <hr className="my-2" /> */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bdogrotesk font-semibold">
                      Subtotal {items.length}
                    </span>
                    <span className="text-base font-bdogrotesk font-semibold">
                      ₹{subtotal.toFixed(0)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="group w-full bg-black text-white px-3 py-3 flex items-center justify-between text-base font-medium tracking-wide disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <div className="relative h-5 overflow-hidden">
                    <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                      <span className="flex font-bdogrotesk h-5 items-center">
                        Continue to Checkout
                      </span>
                      <span className="flex h-5 font-bdogrotesk items-center">
                        Continue to Checkout
                      </span>
                    </div>
                  </div>
                </button>
                {/* <div className="text-xs text-gray-500 text-center mt-2">
                  Prices include 5% GST
                </div> */}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
