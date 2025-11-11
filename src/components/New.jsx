import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Product Data using your provided images ---
const products = [
  {
    id: 1,
    name: 'Vera Shelf Dummy',
    price: 3500.00,
    category: 'Roz Roz',
    imageUrl: 'https://cdn.prod.website-files.com/68558d427ad3bce190a51b77/68558d427ad3bce190a51b6e_8-2.webp',
  },
  {
    id: 2,
    name: 'Vera Stool Green',
    price: 1200.00,
    category: 'Roz Roz',
    imageUrl: 'https://cdn.prod.website-files.com/68558d427ad3bce190a51b77/68558d427ad3bce190a51b6f_7-2.webp',
  },
  {
    id: 3,
    name: 'Arca Sofa Metal',
    price: 7800.00,
    category: 'Kuch Kuch',
    imageUrl: 'https://cdn.prod.website-files.com/68558d427ad3bce190a51b77/68558d427ad3bce190a51b70_6-2.webp',
  },
  {
    id: 4,
    name: 'Luno Stool Blue',
    price: 1300.00,
    category: 'Kuch Kuch',
    imageUrl: 'https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad9b7fdaa7aa4b594f62f4_5.webp',
  },
  {
    id: 5,
    name: 'Luno Shelf Red',
    price: 3600.00,
    category: 'Roz Roz',
    imageUrl: 'https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad9b4f3bd234953e76f057_4.webp',
  },
  {
    id: 6,
    name: 'Luno Sofa Yellow',
    price: 9200.00,
    category: 'Kuch Kuch',
    imageUrl: 'https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad9afb0cd024e19c7378f8_3.webp',
  },
  {
    id: 7,
    name: 'Kux Stool White',
    price: 1100.00,
    category: 'Roz Roz',
    imageUrl: 'https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad96dcb08629ee808e5994_2.webp',
  },
  {
    id: 8,
    name: 'Rixo Shelf Black',
    price: 4100.00,
    category: 'Kuch Kuch',
    imageUrl: 'https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad96ab106d8fb7eb7c1eab_1.webp',
  },
];

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
const ProductDisplay = () => {
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All'); // 'All', 'Roz Roz', 'Kuch Kuch'

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const itemsPerView = 3;
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

  return (
    <div className="w-full bg-white text-black font-sans min-h-screen flex flex-col">
      
      {/* --- Top Control Bar --- */}
      <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200 sticky top-0 bg-white z-10">
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

            {view === 'grid' && (
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
        // --- Grid View (Slider) ---
        <div className="overflow-hidden flex-grow ">
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="w-1/3 flex-shrink-0 ml-4  flex flex-col"
                style={{ flexBasis: `${100 / itemsPerView}%` }}
              >
                {/* 1. Image */}
                <div className="flex-grow w-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* --- THIS IS THE NEW BLOCK YOU PROVIDED --- */}
                {/* I replaced the old <p> and <a> with this */}
                <div className="product-info mt-6  pb-6">
                  <h3 className="text-base font-medium mb-3 px-4">{product.name}</h3>
                  
                  <button
                    type="button"
                    className="group w-full bg-black text-white px-5 py-4 flex items-center justify-between text-[15px] font-semibold tracking-wide"
                  >
                    {/* Animated "Shop now" */}
                    <div className="relative h-5 overflow-hidden">
                      <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                        <span className="flex h-5 text-lg items-center">Shop now</span>
                        <span className="flex h-5 text-lg items-center">Shop now</span>
                      </div>
                    </div>
                    {/* Animated Price */}
                    <div className="relative h-5 overflow-hidden">
                      <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                        <span className="flex h-5 items-center text-lg text-white/90">
                          {formatPrice(product.price)}
                        </span>
                        <span className="flex h-5 items-center text-lg text-white/90">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
                {/* --- END OF NEW BLOCK --- */}

              </div>
            ))}
          </div>
        </div>
      ) : (
        // --- List View ---
        <div className="divide-y divide-gray-200 flex-grow">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex justify-between items-stretch p-6 hover:bg-gray-50 transition-colors min-h-[40vh]">
              {/* Left: Title & Shop Now */}
              <div className="flex-1">
                <div className="flex flex-col justify-between h-full">
                  <h2 className="text-5xl font-semibold w-1/2">
                    {product.name}
                  </h2>
                  <button 
                    onClick={() => window.location.href = `/store/${product.id}`}
                    className="text-base font-medium hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer p-0 self-start"
                  >
                    Shop now
                  </button>
                </div>
              </div>
              
              {/* Middle: Image */}
              <div className="flex-1 flex justify-center ml-64 px-8">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-[40vh] object-contain max-h-screen"
                />
              </div>

              {/* Right: Price */}
              <div className="flex-1 text-center flex items-end font-medium justify-end">
                <span className="text-sm hover:text-gray-600 transition-colors">{formatPrice(product.price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- View All Link --- */}
      <div className="py-8 flex justify-center items-center">
        <Link 
          to="/store" 
          className="flex items-center space-x-2 text-sm text-black hover:underline transition-all group"
        >
          <span>View all</span>
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default ProductDisplay;