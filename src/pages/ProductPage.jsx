import React, { useState } from "react";
import { useParams } from "react-router-dom";

const sharedImage =
  "https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad9c39d7574971aad10695_9.webp";
const sharedImage2 =
  "https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67b1d61e5c80ce0e3e4394c1_3-2-p-500.webp";
const mockProducts = [
  {
    id: "1",
    title: "Flared Pantzo In Thar",
    description:
      "Somewhere between flared pants and a pallazo, we found the most flattering silhouette for all body types. Makes you look like a goddess within the comfort of pyjamas.",
    price: 800,
    originalPrice: 1200,
    images: [sharedImage, sharedImage2, sharedImage],
    sizes: ["XS", "S", "M", "L", "XL", "Custom"],
  },
  {
    id: "2",
    title: "Classic White T-Shirt",
    description: "A wardrobe essential — soft cotton, regular fit.",
    price: 999,
    originalPrice: 1299,
    images: [sharedImage, sharedImage],
    sizes: ["XS", "S", "M", "L"],
  },
];

const rupee = (n) => `₹${n}`;

const ProductPage = () => {
  const { productId } = useParams();
  const product =
    mockProducts.find((p) => p.id === productId) || mockProducts[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[1] || product.sizes[0]
  );
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch (e) {
      return [];
    }
  });
  const isWishlisted = wishlist.includes(product.id);

  const addToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIndex = cart.findIndex(
        (i) => i.id === product.id && i.size === selectedSize
      );
      if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          size: selectedSize,
          qty,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Added to cart");
    } catch (err) {
      console.error(err);
      alert("Could not add to cart");
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

  const percentOff = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="w-full mx-0 px-0 py-8 text-left font-bdogrotesk">
      <div className="flex flex-col-reverse md:flex-row w-full gap-3 px-2">
        {/* Left: Images */}
        <div className="w-full md:w-1/2">
          {/* Thumbnails below main image: fixed height box with vertical scroll */}
          <div className="mt-3 max-w-full h-[85vh] no-scrollbar overflow-y-auto">
            <div className="flex flex-col gap-3 px-1">
              {product.images.map((img, idx) => (
                <img
                  src={img}
                  alt={`${product.title} ${idx + 1}`}
                  className="w-full h-[85vh] object-cover"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 pt-4 flex flex-col min-h-[85vh]">

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
                <img src="/wishlist.svg" alt="wishlishted icon" />
              ) : (
                <svg
                  width="32"
                  height="28"
                  viewBox="0 0 24 24"
                  fill={isWishlisted ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={isWishlisted ? "text-red-600" : "text-gray-700"}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
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

          <div className="mt-auto sticky bottom-0 bg-white pt-4 pb-2 flex flex-col gap-3 text-left z-10">

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

      <div className="mt-8 px-4">
        <h3 className=" text-base py-5 px-2 font-medium">Details</h3>
        <div className="max-w-screen px-2 mx-auto space-y-6">
          <section className="flex flex-col md:flex-row md:items-start gap-64 py-4">
            <div className="flex-shrink-0 w-12 md:w-20 text-sm text-black">001</div>
            <h2 className="flex-1 text-4xl md:text-6xl text-black font-semibold leading-tight md:-mr-2">Description</h2>
            <div className="flex-shrink-0 md:w-1/3 text-sm text-black">
              Feel the luxurious blend embrace your silhouette while the timeless A-line cut flatters every figure. The rich emerald shade catches light beautifully, making you the center of attention without trying too hard.
            </div>
          </section>
          <div className="border-t border-black" />

          <section className="flex flex-col md:flex-row md:items-start gap-64 py-4">
            <div className="flex-shrink-0 w-12 md:w-20 text-sm text-black">002</div>
            <h2 className="flex-1 text-4xl md:text-6xl text-black font-semibold leading-tight md:-mr-2">Dimensions</h2>
            <div className="flex-shrink-0 md:w-1/3 text-sm text-black">
              72"h x 36"w x 12"d
              <br />
              Please refer to the size chart for garment measurement
            </div>
          </section>
          <div className="border-t border-black" />

          <section className="flex flex-col md:flex-row md:items-start gap-64 py-4">
            <div className="flex-shrink-0 w-12 md:w-20 text-sm text-black">003</div>
            <h2 className="flex-1 text-4xl md:text-6xl text-black font-semibold leading-tight md:-mr-2">Promises</h2>
            <div className="flex-shrink-0 md:w-1/3 text-sm text-black">
              Material used: Cotton, Linenan
              <br />
              We assure you bla bla
            </div>
          </section>
          <div className="border-t border-black" />
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
