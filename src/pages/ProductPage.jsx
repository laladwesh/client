import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

const sharedImage = 'https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad9c39d7574971aad10695_9.webp';
const sharedImage2 = 'https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67b1d61e5c80ce0e3e4394c1_3-2-p-500.webp';
const mockProducts = [
  {
    id: '1',
    title: 'Flared Pantzo In Thar',
    description: 'Somewhere between flared pants and a pallazo, we found the most flattering silhouette for all body types. Makes you look like a goddess within the comfort of pyjamas.',
    price: 800,
    originalPrice: 1200,
    images: [sharedImage, sharedImage2, sharedImage],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom']
  },
  {
    id: '2',
    title: 'Classic White T-Shirt',
    description: 'A wardrobe essential — soft cotton, regular fit.',
    price: 999,
    originalPrice: 1299,
    images: [sharedImage, sharedImage],
    sizes: ['XS', 'S', 'M', 'L']
  }
]

const rupee = (n) => `₹${n}`;

const ProductPage = () => {
  const { productId } = useParams();
  const product = mockProducts.find(p => p.id === productId) || mockProducts[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] || product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch (e) {
      return [];
    }
  });
  const isWishlisted = wishlist.includes(product.id);

  const addToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex(i => i.id === product.id && i.size === selectedSize);
      if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
      } else {
        cart.push({ id: product.id, title: product.title, price: product.price, size: selectedSize, qty });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Added to cart');
    } catch (err) {
      console.error(err);
      alert('Could not add to cart');
    }
  }

  const toggleWishlist = () => {
    setWishlist(prev => {
      const exists = prev.includes(product.id);
      const next = exists ? prev.filter(id => id !== product.id) : [...prev, product.id];
      try { localStorage.setItem('wishlist', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }

  const percentOff = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="w-full mx-0 px-0 py-8 text-left font-bdogrotesk">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Images */}
        <div>
          <div className="bg-gray-100 p-0 flex items-center justify-center h-[85vh] w-full overflow-hidden">
            <img src={product.images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
          </div>

          {/* thumbnails removed from left column - rendered below price on the right column */}
        </div>

        {/* Right: Details */}
        <div>
          <div className="relative">
            <button
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={toggleWishlist}
              className="absolute right-0 top-0 p-2 rounded-full flex items-center justify-center"
              style={{ background: 'transparent' }}
            >
              {/* Heart SVG - fills red when wishlisted */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={isWishlisted ? 'text-red-600' : 'text-gray-700'} xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <p className="text-base text-black text-left w-full md:w-4/6">{product.description}</p>
            <h1 className="text-5xl md:text-8xl text-black font-semibold leading-tight mt-4 text-left">{product.title}</h1>
          </div>

          <div className="mt-6">
            <div className="flex items-start gap-3 text-sm text-gray-500 text-left">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-2 text-left border ${selectedSize === s ? 'border-black font-semibold' : 'border-gray-300'} bg-white`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6 text-left">
            <div className="flex items-center border border-black w-max">
              <button className="px-2 py-2 text-left" onClick={() => setQty(q => Math.max(1, q-1))}>-</button>
              <div className="px-2 text-left">{qty}</div>
              <button className="px-2 text-left" onClick={() => setQty(q => q+1)}>+</button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline gap-4 text-left">
              <div className="text-gray-400 line-through">{rupee(product.originalPrice)}</div>
              <div className="text-2xl font-semibold">{rupee(product.price)}</div>
              <div className="text-sm text-red-500">({percentOff}% Off)</div>
            </div>
          </div>

          {/* Thumbnails moved below the price */}
          <div className="mt-6 ml-0 max-w-xl grid grid-cols-3 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={img + idx}
                onClick={() => setSelectedImage(idx)}
                className={`h-24 bg-gray-100 flex items-center justify-center border ${selectedImage === idx ? 'border-black' : 'border-transparent'}`}
              >
                <img src={img} alt={`${product.title} ${idx+1}`} className="h-full object-contain" />
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-1 text-left">
            <button
              type="button"
              onClick={addToCart}
              className="group mt-0 w-full bg-black text-white px-3 py-3 flex items-center justify-between text-[15px] font-semibold tracking-wide box-border rounded-sm"
            >
              <div className="relative h-5 overflow-hidden">
                <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                  <span className="flex font-bdogrotesk h-5 items-center">Add To Cart</span>
                  <span className="flex h-5 items-center">Add To Cart</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={toggleWishlist}
              style={{ border: '1px solid #000', boxSizing: 'border-box', backgroundColor: '#fff' }}
              className="group mt-0 w-full text-black bg-white px-3 py-3 flex items-center justify-between text-[15px] font-semibold tracking-wide rounded-sm"
            >
              <div className="relative h-5 overflow-hidden">
                <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                  <span className="flex h-5 items-center">Add To Wishlist</span>
                  <span className="flex h-5 items-center">Add To Wishlist</span>
                </div>
              </div>
              <div className="relative h-5 overflow-hidden">
                <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                  <span className="flex h-5 items-center text-black/90">♡</span>
                  <span className="flex h-5 items-center text-black/90">♡</span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 text-left">SKU: {productId}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage