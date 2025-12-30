import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// products will be loaded from the backend API

// --- Price Formatting Helper ---
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(price);
};

// --- Arrow SVG Components ---
const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);
const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);


// --- Main Component ---
const ProductDisplay = ({isStore = false}) => {
  const navigate = useNavigate();
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All', 'Roz Roz', 'Kuch Kuch'

  // products loaded from backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // when on home (isStore=false) request only homepage products
    const shownInHome = !isStore; // true on home, false on store/other
    getProducts({ shownInHome })
      .then((data) => {
        if (!mounted) return;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load products');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [isStore]);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const itemsPerView = 3.1;
  const maxIndex = Math.max(0, filteredProducts.length - itemsPerView);

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  // Reset current index when category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
  };

  // Refresh ScrollTrigger when view changes to recalculate positions
  useEffect(() => {
    // Wait for DOM to update after view change
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [view]);

  return (
    <div className="w-full bg-white text-black font-sans min-h-screen flex flex-col">
      
      {/* --- Top Control Bar --- */}
      <div className="flex justify-between items-center py-4 px-6  sticky top-0 bg-white z-10">
        {/* Left Side: Filters */}
        <div className="flex items-center space-x-0">
          <button className="text-sm text-gray-500 hover:text-black transition-colors">Filter</button>
          <button 
            onClick={() => handleCategoryChange('All')}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
              selectedCategory === 'All' 
                ? ' text-black' 
                : '  text-gray-600'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => handleCategoryChange('Roz Roz')}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
              selectedCategory === 'Roz Roz' 
                ? ' text-black' 
                : '  text-gray-600'
            }`}
          >
            Roz Roz
          </button>
          <button 
            onClick={() => handleCategoryChange('Kuch Kuch')}
            className={`px-3 py-1 font-semibold text-sm rounded-full transition-colors ${
              selectedCategory === 'Kuch Kuch' 
                ? ' text-black' 
                : ' text-gray-600 '
            }`}
          >
            Kuch Kuch
          </button>
        </div>
        
        {/* Right Side: View Toggles & Arrows */}
        <div className="flex items-center space-x-4">

            {view === 'grid' && !isStore && (
            <div className="flex items-center space-x-2  pl-4">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="p-1 rounded-full  disabled:opacity-30 transition-colors"
              >
                <ArrowLeft />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex === maxIndex}
                className="p-1 rounded-full  disabled:opacity-30 transition-colors"
              >
                <ArrowRight />
              </button>
            </div>
          )}
          <button
            onClick={() => setView('grid')}
            className={`text-sm ${view === 'grid' ? 'text-black font-semibold' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            Image
          </button>
          <button
            onClick={() => setView('list')}
            className={`text-sm ${view === 'list' ? 'text-black font-semibold' : 'text-gray-400'} hover:text-black transition-colors`}
          >
            List
          </button>

          {/* Grid Arrows (Only show in grid view) */}
          
        </div>
      </div>
      
      {/* --- Products Area (Main Content) --- */}
      {view === 'grid' ? (
        // --- Grid View ---
        !isStore ? (
          // Slider-style view (used on Home)
          <>
          <div className="border-t-2 border-black mx-4 mb-4"></div>
          <div className="overflow-hidden flex-grow ">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="w-1/3 flex-shrink-0 ml-4  flex flex-col"
                  style={{ flexBasis: `${100 / itemsPerView}%` }}
                >
                  {/* 1. Image */}
                  <div className="flex-grow w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={(product.images && product.images[0]) || product.imageUrl || ''}
                      alt={product.product || product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="product-info mt-2 pb-6">
                    <h3 className="text-base font-medium mb-3 ml-1 px-0 font-bdogrotesk text-left">{product.product || product.name}</h3>
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${product._id || product.id}`)}
                      className="group w-full bg-black text-white px-3 py-3 flex items-start justify-between text-base font-medium tracking-wide font-bdogrotesk"
                    >
                      <div className="relative h-4 overflow-hidden">
                        <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                          <span className="flex h-4 items-center">Shop now</span>
                          <span className="flex h-4 items-center">Shop now</span>
                        </div>
                      </div>
                      <div className="relative h-4 overflow-hidden">
                        <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                          <span className="flex h-4 items-center text-white/90 text-base">{formatPrice(product.discountedPrice ?? product.mrp ?? product.price ?? 0)}</span>
                          <span className="flex h-4 items-center text-white/90 text-base">{formatPrice(product.discountedPrice ?? product.mrp ?? product.price ?? 0)}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
        ) : (
          // Store page grid: 3 items per row, non-scrollable
          <>
          <div className="border-t-2 border-black mx-4 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2">
            {filteredProducts.map((product) => (
              <div key={product._id || product.id} className="flex flex-col bg-white">
                <div className="w-full bg-gray-100 overflow-hidden">
                  <img src={(product.images && product.images[0]) || product.imageUrl || ''} alt={product.product || product.name} className="w-full h-56 md:h-72 lg:h-[75vh] object-cover" />
                </div>
                <div className="pb-2 pt-2 px-0 space-y-3">
                  <h3 className="text-base font-medium ml-1 px-0 font-bdogrotesk text-left">{product.product || product.name}</h3>
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${product._id || product.id}`)}
                    className="group w-full bg-black text-white px-3 py-3 flex items-start justify-between text-base font-medium tracking-wide font-bdogrotesk"
                  >
                    <div className="relative h-4 overflow-hidden">
                      <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                        <span className="flex h-4 items-center">Shop now</span>
                        <span className="flex h-4 items-center">Shop now</span>
                      </div>
                    </div>
                    <div className="relative h-4 overflow-hidden">
                      <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                        <span className="flex h-4 items-center text-white/90 text-base">{formatPrice(product.discountedPrice ?? product.mrp ?? product.price ?? 0)}</span>
                        <span className="flex h-4 items-center text-white/90 text-base">{formatPrice(product.discountedPrice ?? product.mrp ?? product.price ?? 0)}</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
        )
      ) : (
        // --- List View ---
        <div className="divide-y divide-black border-t-2 border-black flex-grow mx-6">
          {filteredProducts.map((product) => (
            <div key={product._id || product.id} className="flex justify-between items-stretch py-4 hover:bg-gray-50 transition-colors min-h-[40vh]">
              {/* Left: Title & Shop Now */}
              <div className="flex-1">
                <div className="flex flex-col justify-between h-full">
                  <h2 className="text-5xl font-semibold w-1/2">
                    {product.product || product.name}
                  </h2>
                  <button 
                    onClick={() => window.location.href = `/store/${product._id || product.id}`}
                    className="text-base font-medium hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer p-0 self-start"
                  >
                    Shop now
                  </button>
                </div>
              </div>
              
              {/* Middle: Image */}
              <div className="flex-1 flex justify-center ml-64 px-8">
                <img
                  src={(product.images && product.images[0]) || product.imageUrl || ''}
                  alt={product.product || product.name}
                  className="w-full h-[40vh] object-contain max-h-screen"
                />
              </div>

              {/* Right: Price */}
              <div className="flex-1 text-center flex items-end font-medium justify-end">
                <span className="text-sm hover:text-gray-600 transition-colors">{formatPrice(product.discountedPrice ?? product.mrp ?? product.price ?? 0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- View All Link --- */}
      {!isStore && (
        <div className="py-8 flex justify-center items-center">
          <Link 
            to="/store" 
            className="flex items-center space-x-2 text-sm text-black hover:underline transition-all group"
          >
            <span>View all</span>
            <ArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductDisplay;