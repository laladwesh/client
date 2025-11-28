import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [user, setUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  // Collections data - you can modify this array to change categories
  const collections = [
    {
      id: 1,
      name: 'Luno',
      number: '001',
      image: '/images/Experimental-Marketing_1Experimental Marketing.webp'
    },
    {
      id: 2,
      name: 'Arco',
      number: '002',
      image: '/images/Group-262_1Group 262.webp'
    },
    {
      id: 3,
      name: 'Vera',
      number: '003',
      image: '/images/Group-1009002131-1_1Group 1009002131 (1).webp'
    }
  ];

  // Dummy products for search
  const dummyProducts = [
    { id: 1, name: 'Classic White T-Shirt', price: 999, image: '/images/product1.jpg' },
    { id: 2, name: 'Blue Denim Jacket', price: 2499, image: '/images/product2.jpg' },
    { id: 3, name: 'Black Hoodie', price: 1499, image: '/images/product3.jpg' },
    { id: 4, name: 'Grey Sweatpants', price: 1299, image: '/images/product4.jpg' },
    { id: 5, name: 'Red Cotton Shirt', price: 1799, image: '/images/product5.jpg' },
  ];

  const filteredProducts = dummyProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      // Get the mission statement section (the one with "We make everyday clothes...")
      const missionSection = document.querySelector('.bg-white.py-12');
      
      if (missionSection) {
        const missionRect = missionSection.getBoundingClientRect();
        // When the mission section reaches the top of the viewport, make navbar sticky
        if (missionRect.top <= 0) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  return (
    <div 
      className={`navbar-logo-center-home p-0 ${isHomePage && isSticky ? 'nav_bg fixed top-0 left-0 right-0 w-full z-[9999] bg-transparent transition-all duration-400 ease-in-out shadow-none' : ''} ${!isHomePage ? 'bg-white relative z-50' : ''}`}
    >
      <div 
        className={`navbar-logo-center-container-home w-nav px-0 ${isHomePage && isSticky ? 'bg-transparent w-full' : ''} ${!isHomePage ? 'bg-white' : ''}`}
      >
        <div 
          className={`container-navbar-home px-0 max-w-full ${isHomePage && isSticky ? 'bg-transparent' : ''}`}
        >
          <div className="navbar-wrapper-home px-0 m-0">
            <Link to="/" className={`navbar-logo-wrapper-home w-nav-brand ${isHomePage && !isSticky ? 'opacity-0' : 'opacity-100'}`}>
              <img width="122" loading="lazy" alt="Nufab Logo" src="/images/Logo--White.svg" />
            </Link>
            
            <nav role="navigation" className={`nav-menu-wrapper-three-home w-nav-menu pl-0 ml-0 ${isMenuOpen ? 'w--open' : ''}`}>
              <div className="nav-menu-three-home pl-0 ml-0">
                <ul className="nav-menu-block-home w-list-unstyled space-x-5 pl-0 ml-0 gap-0">
                  <li className="pl-0 ml-0">
                    <button 
                      onClick={() => setIsSearchOpen(true)}
                      className={`nav-link w-inline-block no-underline bg-transparent border-0 cursor-pointer p-0 m-0 flex items-center`}
                    >
                      <div className="nav-icon_wrapper-home">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isHomePage ? 'white' : 'black'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                      </div>
                    </button>
                  </li>
                  <li>
                    <Link to="/about" className={`${!isHomePage ? 'text-black' : 'text-white'} font-semibold text-base hover:underline`}>About us</Link>
                  </li>
                  <li>
                    <Link to="/blogs" className={`${!isHomePage ? 'text-black' : 'text-white'} font-semibold text-base hover:underline`}>Blog</Link>
                  </li>
                  <li>
                    <Link to="/photo-booth" className={`${!isHomePage ? 'text-black' : 'text-white'} font-semibold text-base hover:underline `}>Photobook</Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
                      className={`${!isHomePage ? 'text-black' : 'text-white'} font-semibold text-base hover:underline`}
                    >
                      Collections
                    </button>
                  </li>
                </ul>
                <div>
                  <ul className="nav-menu-block-home-2 nav_blck_gap w-list-unstyled">
                    <li>
                      <Link to="/cart" className="text-white font-semibold text-base hover:underline">
                        Cart <span className="text-[0.9em]">0</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/sign-up" className="text-white font-semibold text-base hover:underline">
                        <div className="nav-icon_wrapper-home relative">
                          {user ? (
                            <>
                              <img 
                                loading="lazy" 
                                src={user.avatar} 
                                alt={user.name} 
                                className="nav-icon rounded-full w-6 h-6 object-cover" 
                              />
                              {user.role === 'admin' && (
                                <span className="absolute -top-1 -right-1 bg-[#e74c3c] text-white text-[10px] px-1 py-0.5 rounded font-bold">
                                  A
                                </span>
                              )}
                            </>
                          ) : (
                            <img loading="lazy" src="/images/user-circle.svg" alt="User" className="nav-icon" />
                          )}
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
            
            <div 
              className="menu-button-home w-nav-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="nav-icon-home w-icon-nav-menu"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Sidebar */}
      {isSearchOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-[10000] transition-opacity duration-300 ease"
            onClick={() => setIsSearchOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 w-80 md:w-96 max-w-full bg-white z-[10001] shadow-[-2px_0_10px_rgba(0,0,0,0.1)] flex flex-col animate-[slideIn_0.3s_ease]">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="m-0 text-2xl text-gray-800">Search Products</h2>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="bg-transparent border-0 text-2xl cursor-pointer py-1 px-2.5 text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Search Input */}
            <div className="p-5 border-b border-gray-200">
              <input 
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full py-3 px-4 text-base border-2 border-gray-300 rounded-lg outline-none transition-colors duration-200 focus:border-blue-500"
              />
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-5">
              {searchQuery === '' ? (
                <p className="text-gray-500 text-center mt-5">
                  Start typing to search products...
                </p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-center mt-5">
                  No products found for "{searchQuery}"
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                      <div className="flex-1">
                        <h3 className="m-0 mb-2 text-base text-gray-800 font-medium">
                          {product.name}
                        </h3>
                        <p className="m-0 text-lg text-blue-500 font-semibold">
                          ₹{product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>
        </>
      )}

      {/* Collections Dropdown */}
      <div 
        className="fixed top-0 left-0 right-0 bg-white z-[9998] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
        style={{
          transform: isCollectionsOpen ? 'translateY(0)' : 'translateY(-100%)',
          boxShadow: isCollectionsOpen ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 md:px-8 py-4">
          <h1 className='font-bold text-black text-3xl md:text-5xl lg:text-6xl' >
            Nufab
          </h1>
          <button 
            onClick={() => setIsCollectionsOpen(false)}
            className='cursor-pointer font-semibold text-black text-base md:text-lg'
           
          >
            Close
          </button>
        </div>

        {/* Collections Grid */}
        <div className='flex flex-col md:flex-row justify-center lg:justify-end gap-6 md:gap-16 lg:gap-52 pb-4 md:pb-0 px-4 md:px-8 lg:pr-24'>
          {collections.map((collection) => (
            <div 
              key={collection.id}
              onClick={() => {
                setIsCollectionsOpen(false);
                navigate('/store');
              }}
              className="cursor-pointer flex items-end gap-3 md:gap-5 hover:opacity-95 transition-opacity duration-200"
            >
              {/* Image */}
              <div className="w-24 h-44 md:w-32 md:h-56 lg:w-36 lg:h-60 bg-gray-100 overflow-hidden">
                <img 
                  src={collection.image} 
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Text */}
              <div className="pb-0 flex flex-col justify-between h-44 md:h-56 lg:h-60">
                <h2 className="m-0 text-2xl md:text-3xl lg:text-5xl font-medium text-black">
                  {collection.name}
                </h2>
                <p className="m-0 text-xs md:text-sm text-gray-600">
                  {collection.number}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-5 pb-2 md:pb-0 flex justify-start text-black items-end">
          <p className="m-0 text-sm md:text-base lg:text-lg">
            © 2025 Nufab
          </p>
        </div>
      </div>

      {/* Collections Overlay */}
      {isCollectionsOpen && (
        <div 
          className="fixed inset-0 bg-gray-500/70 z-[9997] transition-opacity duration-300 ease"
          onClick={() => setIsCollectionsOpen(false)}
        />
      )}

      {/* Spacer so page content starts below navbar on non-home pages */}
      {!isHomePage && (
        <div aria-hidden="true" className="hidden h-20 md:h-24 lg:h-28" />
      )}
    </div>
  );
};

export default Navbar;
