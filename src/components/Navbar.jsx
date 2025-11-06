import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="navbar-logo-center-home">
      <div className="navbar-logo-center-container-home w-nav">
        <div className="container-navbar-home">
          <div className="navbar-wrapper-home">
            <Link to="/" className="navbar-logo-wrapper-home w-nav-brand" style={{ opacity: 0 }}>
              <img width="122" loading="lazy" alt="Nufab Logo" src="/images/Logo--White.svg" />
            </Link>
            
            <nav role="navigation" className={`nav-menu-wrapper-three-home w-nav-menu ${isMenuOpen ? 'w--open' : ''}`}>
              <div className="nav-menu-three-home">
                <ul role="list" className="nav-menu-block-home w-list-unstyled">
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
                  <ul role="list" className="nav-menu-block-home-2 nav_blck_gap w-list-unstyled">
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
