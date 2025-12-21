import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div>
      <div className="navbar-logo-center-2 nav_bg">
        <div className="navbar-logo-center-container-2 w-nav">
          <div className="container-4">
            <div className="navbar-wrapper-three-2">
              <Link to="/" className="navbar-brand-three-2 w-nav-brand">
                <img width="122" loading="lazy" alt="Nufab" src="/images/logo-black.png" />
              </Link>
              <nav role="navigation" className="nav-menu-wrapper-three-2 w-nav-menu">
                <div className="nav-menu-three-2">
                  <ul className="nav-menu-block-2 w-list-unstyled">
                    <li>
                      <Link to="/about" className="nav-link-3 w--current">About Us</Link>
                    </li>
                    <li>
                      <Link to="/blogs" className="nav-link-3">Blog</Link>
                    </li>
                    <li>
                      <Link to="/photo-booth" className="nav-link-3">Photobook</Link>
                    </li>
                    <li>
                      <Link to="/store" className="nav-link-3">Collection</Link>
                    </li>
                  </ul>
                  <ul className="nav-menu-block-2 nav_blck_gap w-list-unstyled">
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('signup:toggle', { detail: { open: true } })); }} className="nav-link w-inline-block">
                        <div className="nav-icon_wrapper">
                          <img loading="lazy" src="/images/user-circle_black.svg" alt="User" className="nav-icon" />
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <section className="section-about">
        <div className="container">
          <h1 className="heading-large">About Nufab</h1>
          <p className="paragraph-large">
            Nufab is a movement to preserve culture by allowing it to evolve. We see local materials, 
            motifs, and skills as invaluable design resources. To honour them means keeping them alive 
            in practice, and letting them take shape with time.
          </p>
          <p className="paragraph-large">
            Culture does not belong in a museum to be occasionally recalled with nostalgia. It belongs 
            where it was born: with the people, in the everyday.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
