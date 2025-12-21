import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, getProducts } from "../services/productService";
import toast from 'react-hot-toast';
import { updateCart as apiUpdateCart } from '../services/cartService';

// default sizes if product doesn't include sizes
const DEFAULT_SIZES = ["S", "M", "L", "XL"];

const rupee = (n) => `₹${n}`;

const ProductPage = () => {
  const { productId } = useParams();

  const [rawProduct, setRawProduct] = useState(null);
  const [product, setProduct] = useState(null); // normalized UI product
  const [suggestions, setSuggestions] = useState([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch (e) {
      return [];
    }
  });
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  const addToCart = async () => {
    try {
      // read localStorage cart
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex(i => String(i.productId || i.id || i.product) === String(rawProduct._id) && (i.size === selectedSize));
      if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || cart[existingIndex].qty || 0) + qty;
      } else {
        cart.push({ productId: rawProduct._id, product: rawProduct.product || rawProduct.title, image: rawProduct.images?.[0] || '', size: selectedSize, quantity: qty, price: rawProduct.discountedPrice || rawProduct.mrp || rawProduct.price || 0 });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      // notify other components and open sidebar
      window.dispatchEvent(new Event('cart:updated'));

      // if user logged in, sync to backend
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (user && token) {
        try { await apiUpdateCart(cart); } catch (e) { console.error('cart sync failed', e); }
      }

      // show sliding toast coming from right
      toast.custom((t) => (
        <div className={`toast-slide-right ${t.visible ? '': ''}`} style={{
          background: '#111', color: '#fff', padding: '12px 16px', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontWeight: 600 }}>{rawProduct.product || rawProduct.title}</div>
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={() => toast.dismiss(t.id)} style={{ background: 'transparent', border: 'none', color: '#fff', opacity: 0.85 }}>Close</button>
            </div>
          </div>
        </div>
      ));
    } catch (err) {
      console.error(err);
      toast.error("Could not add to cart");
    }
  };

  const toggleWishlist = () => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      const next = exists
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id];
      try {
        localStorage.setItem("wishlist", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const navigate = useNavigate();

  const toggleWishlistItem = (id) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem("wishlist", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const percentOff = product
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // fetch product and suggestions
  useEffect(() => {
    let mounted = true;
    setRawProduct(null);
    setProduct(null);
    setSuggestions([]);

    // fetch main product
    getProduct(productId)
      .then((data) => {
        if (!mounted) return;
        // support two possible shapes: { product, suggestions } or plain product
        const payload = data.product ? data : { product: data, suggestions: [] };
        setRawProduct(payload.product);
        const d = payload.product;
        const ui = {
          id: d._id,
          title: d.product || d.title || 'Product',
          description: d.productDescription || d.description || '',
          price: d.discountedPrice ?? d.mrp ?? 0,
          originalPrice: d.mrp ?? d.price ?? 0,
          images: Array.isArray(d.images) && d.images.length ? d.images : [''],
          sizes: Array.isArray(d.sizes) && d.sizes.length ? d.sizes : (d.sizes || DEFAULT_SIZES),
        };
        setProduct(ui);
        setSelectedSize(ui.sizes[0] || DEFAULT_SIZES[0]);

        // suggestions from API response if present
        if (Array.isArray(payload.suggestions) && payload.suggestions.length) {
          const mapped = payload.suggestions.map((s) => ({
            id: s._id,
            title: s.product || s.title || '',
            images: Array.isArray(s.images) && s.images.length ? s.images : [''],
          }));
          setSuggestions(mapped);
        } else {
          // fallback: fetch other products
          getProducts()
            .then((list) => {
              if (!mounted || !Array.isArray(list)) return;
              const others = list
                .filter((p) => String(p._id) !== String(productId))
                .slice(0, 6)
                .map((d) => ({
                  id: d._id,
                  title: d.product || d.title || '',
                  images: Array.isArray(d.images) && d.images.length ? d.images : [''],
                }));
              setSuggestions(others);
            })
            .catch((e) => console.error('suggestions error', e));
        }
      })
      .catch((err) => {
        console.error('Failed to load product', err);
        toast.error('Failed to load product');
      });

    // fetch suggestions: prefer suggestions returned with product API
    // if not present, fall back to fetching products list
    // handled after getProduct resolves (see below)

    return () => { mounted = false; };
  }, [productId]);

  if (!product) {
    return <div className="w-full py-32 text-center">Loading...</div>;
  }

  return (
    <div className="w-full mx-0 px-0 py-8 text-left font-bdogrotesk">
      <div className="flex flex-col-reverse md:flex-row w-full gap-3 px-2">
        {/* Left: Images */}
        <div className="w-full md:w-1/2">
          {/* Thumbnails below main image: fixed height box with vertical scroll */}
          <div className="mt-3 max-w-full h-[85vh] no-scrollbar overflow-y-auto">
            <div className="flex flex-col gap-3 px-1">
              {product.images.map((img, idx) => (
                <div key={idx} className="w-full aspect-[3/4] overflow-hidden">
                  <img
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 pt-2 flex flex-col min-h-[85vh]">
          <div className="relative">
            <button
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              onClick={toggleWishlist}
              className="absolute right-0 top-0 p-2 rounded-full flex items-center justify-center"
              style={{ background: "transparent" }}
            >
              {/* Heart SVG - fills red when wishlisted */}
              {isWishlisted ? (
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 19 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 3H0.5V8H2V9.5H3.5V11H5V12.5H6.5V14H8V15.5H9V16.5H10V15.5H11V14H12.5V12.5H14V11H15.5V9.5H17V8H18.5V3H17V1.5H15.5V0.5H11.5V2H10V3H8.5V2H7V0.5H3V1.5H1.5V3Z"
                    fill="#F31717"
                    stroke="#F31717"
                  />
                </svg>
              ) : (
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 19 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.5 3H0.5V8H2V9.5H3.5V11H5V12.5H6.5V14H8V15.5H9V16.5H10V15.5H11V14H12.5V12.5H14V11H15.5V9.5H17V8H18.5V3H17V1.5H15.5V0.5H11.5V2H10V3H8.5V2H7V0.5H3V1.5H1.5V3Z"
                    fill="white"
                    stroke="black"
                  />
                </svg>
              )}
            </button>
            <p className="text-base text-black font-medium text-left w-full md:w-5/6">
              {product.description}
            </p>
            <h1 className="text-5xl md:text-8xl text-black font-semibold leading-tight mt-4 text-left">
              {product.title}
            </h1>
          </div>

          <div className="mt-6">
            <div className="flex items-start gap-3 text-sm text-gray-500 text-left">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-2 text-left border bg-white ${
                    selectedSize === s
                      ? "border-black font-semibold text-black"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  <span
                    className={
                      selectedSize === s
                        ? "inline-block pb-3 border-b-2 border-black"
                        : ""
                    }
                  >
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6 text-left">
            <div className="flex items-center border border-black w-max">
              <button
                className="px-2 py-2 text-left"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <div className="px-2 text-left">{qty}</div>
              <button
                className="px-2 text-left"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline gap-2 text-left">
              <div className="text-gray-400 text-xl line-through">
                {rupee(product.originalPrice)}
              </div>
              <div className="text-xl font-semibold">
                {rupee(product.price)}
              </div>
              <div className="text-xl text-red-500">({percentOff}% Off)</div>
            </div>
          </div>

          {/* thumbnails removed from here — now rendered under the main image */}

          <div className="mt-auto bg-white pt-4 pb-2 flex flex-col gap-3 text-left z-10">
            <button
              type="button"
              onClick={addToCart}
              className="group mt-0 w-full bg-black text-white px-3 py-3 flex items-center justify-between text-[15px] font-semibold tracking-wide box-border"
            >
              <div className="relative h-5 overflow-hidden">
                <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                  <span className="flex font-bdogrotesk h-5 items-center">
                    Add To Cart
                  </span>
                  <span className="flex h-5 items-center">Add To Cart</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={toggleWishlist}
              style={{
                border: "1px solid #000",
                boxSizing: "border-box",
                backgroundColor: "#fff",
              }}
              className="group mt-0 w-full text-black bg-white px-3 py-3 flex items-center justify-between text-[15px] font-semibold tracking-wide "
            >
              <div className="relative h-5 overflow-hidden">
                <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                  <span className="flex h-5 items-center">Add To Wishlist</span>
                  <span className="flex h-5 items-center">Add To Wishlist</span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 text-left">SKU: {productId}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 px-2">
        <h3 className=" text-base py-5 px-2 font-medium">Details</h3>
        <div className="max-w-screen px-2 mx-auto space-y-6">
          <section className="flex flex-col md:flex-row md:items-start gap-64 py-4">
            <div className="flex-shrink-0 w-12 md:w-20 text-sm text-black">
              001
            </div>
            <h2 className="flex-1 text-4xl md:text-6xl text-black font-semibold leading-tight md:-mr-2">
              Features
            </h2>
            <div className="flex-shrink-0 md:w-1/3 text-sm text-black">
              Feel the luxurious blend embrace your silhouette while the
              timeless A-line cut flatters every figure. The rich emerald shade
              catches light beautifully, making you the center of attention
              without trying too hard.
            </div>
          </section>
          <div className="border-t border-black" />

          <section className="flex flex-col md:flex-row md:items-start gap-64 py-4">
            <div className="flex-shrink-0 w-12 md:w-20 text-sm text-black">
              002
            </div>
            <h2 className="flex-1 text-4xl md:text-6xl text-black font-semibold leading-tight md:-mr-2">
              Size & Fit
            </h2>
            <div className="flex-shrink-0 md:w-1/3 text-sm text-black">
              72"h x 36"w x 12"d
              <br />
              Please refer to the size chart for garment measurement
            </div>
          </section>
          <div className="border-t border-black" />

          <section className="flex flex-col md:flex-row md:items-start gap-64 py-4">
            <div className="flex-shrink-0 w-12 md:w-20 text-sm text-black">
              003
            </div>
            <h2 className="flex-1 text-4xl md:text-6xl text-black font-semibold leading-tight md:-mr-2">
              Material
            </h2>
            <div className="flex-shrink-0 md:w-1/3 text-sm text-black">
              Material used: Cotton, Linenan
              <br />
              We assure you bla bla
            </div>
          </section>
          <div className="border-t border-black" />
        </div>
      </div>
      <div className="mt-8 px-2 font-bdogrotesk">
        <h3 className="text-base py-2 px-2 font-medium">Check these out</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          {suggestions.map((p) => {
            const isInWishlist = wishlist.includes(p.id);
            return (
              <div key={p.id} className="group text-left space-y-4">
                <div
                  className="w-full bg-gray-200 aspect-[3/4] overflow-hidden relative cursor-pointer"
                  onClick={() => toggleWishlistItem(p.id)}
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2">
                    {isInWishlist ? (
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 19 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.5 3H0.5V8H2V9.5H3.5V11H5V12.5H6.5V14H8V15.5H9V16.5H10V15.5H11V14H12.5V12.5H14V11H15.5V9.5H17V8H18.5V3H17V1.5H15.5V0.5H11.5V2H10V3H8.5V2H7V0.5H3V1.5H1.5V3Z"
                          fill="#F31717"
                          stroke="#F31717"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 19 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.5 3H0.5V8H2V9.5H3.5V11H5V12.5H6.5V14H8V15.5H9V16.5H10V15.5H11V14H12.5V12.5H14V11H15.5V9.5H17V8H18.5V3H17V1.5H15.5V0.5H11.5V2H10V3H8.5V2H7V0.5H3V1.5H1.5V3Z"
                          fill="white"
                          stroke="black"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm">{p.title}</div>
                <button
                  type="button"
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="group mt-0 w-full bg-black text-white px-3 py-2 flex items-center justify-between text-[15px] font-semibold tracking-wide box-border"
                >
                  <div className="relative h-5 overflow-hidden">
                    <div className="relative text-base flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                      <span className="flex font-medium font-bdogrotesk h-5 items-center">
                        Shop Now
                      </span>
                      <span className="flex font-bdogrotesk font-medium h-5 items-center">
                        Shop Now
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
