import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
      className={`navbar-logo-center-home ${isHomePage && isSticky ? 'nav_bg' : ''}`}
      style={isHomePage && isSticky ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        backgroundColor: '#000',
        transition: 'all 0.4s ease-in-out',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
      } : {}}
    >
      <div 
        className="navbar-logo-center-container-home w-nav"
        style={isHomePage && isSticky ? {
          backgroundColor: '#000',
          width: '100%'
        } : {}}
      >
        <div 
          className="container-navbar-home"
          style={isHomePage && isSticky ? {
            backgroundColor: '#000'
          } : {}}
        >
          <div className="navbar-wrapper-home">
            <Link to="/" className="navbar-logo-wrapper-home w-nav-brand" style={isHomePage && !isSticky ? { opacity: 0 } : { opacity: 1 }}>
              <img width="122" loading="lazy" alt="Nufab Logo" src="/images/Logo--White.svg" />
            </Link>
            
            <nav role="navigation" className={`nav-menu-wrapper-three-home w-nav-menu ${isMenuOpen ? 'w--open' : ''}`}>
              <div className="nav-menu-three-home">
                <ul className="nav-menu-block-home w-list-unstyled">
                  <li>
                    <Link to="/about" className="nav-link-3-home">About us</Link>
                  </li>
                  <li>
                    <Link to="/blogs" className="nav-link-3-home">Blog</Link>
                  </li>
                  <li>
                    <Link to="/photo-booth" className="nav-link-3-home">Photobook</Link>
                  </li>
                  <li>
                    <Link to="/store" className="nav-link-3-home">Collections</Link>
                  </li>
                </ul>
                <div>
                  <ul className="nav-menu-block-home-2 nav_blck_gap w-list-unstyled">
                    <li>
                      <Link to="/cart" className="nav-link w-inline-block">
                        <div className="nav-icon_wrapper-home">
                          <img width="24" loading="lazy" alt="Shopping Bag" src="/images/shopping-bag_1.svg" className="nav-icon" />
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link to="/sign-up" className="nav-link w-inline-block">
                        <div className="nav-icon_wrapper-home">
                          <img loading="lazy" src="/images/user-circle.svg" alt="User" className="nav-icon" />
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
    </div>
  );
};

export default Navbar;
