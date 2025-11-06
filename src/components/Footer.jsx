import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="footer">
      <section className="uui-section_cta04">
        <div className="uui-page-padding-4">
          <div className="uui-container-large-4">
            <div className="uui-padding-vertical-xhuge-3">
              <div className="uui-cta04_component">
                <div className="uui-cta04_content">
                  <div className="uui-max-width-large-3">
                    <h2 className="uui-heading-medium-2">Follow us on social for more</h2>
                    <div className="uui-space-xsmall-2"></div>
                    <div className="uui-text-size-large-3">
                      Sign up to our community and recieve early access to offers, collections and blogs. 
                      We only write to you when we have something worthwhile to say.
                    </div>
                  </div>
                </div>
                <div className="uui-button-row-2 is-reverse-mobile-landscape">
                  <div className="uui-button-wrapper-2 max-width-full-mobile-landscape-2">
                    <a href="https://instagram.com/nufab.in" target="_blank" rel="noopener noreferrer" className="uui-button-secondary-gray-2 w-inline-block">
                      <div>@nufab.in</div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="uui-footer02_component">
        <div className="uui-page-padding-5">
          <div className="uui-container-large-5">
            <div className="uui-padding-vertical-xlarge">
              <div className="w-layout-grid uui-footer02_top-wrapper">
                <div className="w-layout-grid uui-footer02_left-wrapper">
                  <div className="uui-footer02_link-list">
                    <div className="uui-footer02_link-list-heading">COMPANY</div>
                    <Link to="/about" className="uui-footer02_link w-inline-block">
                      <div>About Us</div>
                    </Link>
                    <a href="#" className="uui-footer02_link w-inline-block">
                      <div>Careers</div>
                    </a>
                    <a href="#" className="uui-footer02_link w-inline-block">
                      <div>Privacy Policy</div>
                    </a>
                    <a href="#" className="uui-footer02_link w-inline-block">
                      <div>Terms</div>
                    </a>
                  </div>
                  
                  <div className="uui-footer02_link-list">
                    <div className="uui-footer02_link-list-heading">CUSTOMERS</div>
                    <a href="#" className="uui-footer02_link w-inline-block">
                      <div>Start a Return</div>
                    </a>
                    <a href="#" className="uui-footer02_link w-inline-block">
                      <div>Return Policy</div>
                    </a>
                    <Link to="/faq" className="uui-footer02_link w-inline-block">
                      <div>FAQ</div>
                    </Link>
                    <Link to="/store" className="uui-footer02_link w-inline-block">
                      <div>Collections</div>
                    </Link>
                  </div>
                  
                  <div className="uui-footer02_link-list">
                    <div className="uui-footer02_link-list-heading">CONTACT US</div>
                    <a href="tel:+919009010100" className="uui-footer02_link w-inline-block">
                      <div>+91 9009010100</div>
                    </a>
                    <a href="mailto:contact@nufab.in" className="uui-footer02_link w-inline-block">
                      <div>Email Us@</div>
                    </a>
                    <a href="#" className="uui-footer02_link w-inline-block">
                      <div>Mon-Fri 9am-3pm</div>
                    </a>
                    
                    <div className="w-layout-grid uui-blogpost04_share">
                      <a href="https://twitter.com/nufab" target="_blank" rel="noopener noreferrer" className="uui-button-secondary-gray-3 is-button-small icon-only w-inline-block">
                        <div className="uui-button-icon-3 text-color-gray400 w-embed">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.2896 18.1256C13.8368 18.1256 17.9648 11.8728 17.9648 6.45035C17.9648 6.27275 17.9648 6.09595 17.9528 5.91995C18.7559 5.33908 19.4491 4.61986 20 3.79595C19.2512 4.12795 18.4567 4.34558 17.6432 4.44155C18.4998 3.92879 19.141 3.1222 19.4472 2.17195C18.6417 2.64996 17.7605 2.98681 16.8416 3.16795C16.2229 2.5101 15.4047 2.07449 14.5135 1.92852C13.6223 1.78256 12.7078 1.93438 11.9116 2.3605C11.1154 2.78661 10.4819 3.46326 10.109 4.28574C9.73605 5.10822 9.64462 6.03067 9.8488 6.91035C8.21741 6.82852 6.62146 6.40455 5.16455 5.66596C3.70763 4.92737 2.4223 3.89067 1.392 2.62315C0.867274 3.52648 0.70656 4.59584 0.942583 5.6135C1.17861 6.63117 1.79362 7.52061 2.6624 8.10075C2.00936 8.08162 1.37054 7.90545 0.8 7.58715V7.63915C0.800259 8.58653 1.12821 9.50465 1.72823 10.2378C2.32824 10.9709 3.16338 11.474 4.092 11.6616C3.4879 11.8263 2.85406 11.8504 2.2392 11.732C2.50151 12.5472 3.01202 13.2602 3.69937 13.7711C4.38671 14.282 5.21652 14.5654 6.0728 14.5816C5.22203 15.2503 4.24776 15.7447 3.20573 16.0366C2.16369 16.3284 1.07435 16.4119 0 16.2824C1.87653 17.4865 4.05994 18.1253 6.2896 18.1224" fill="currentColor"></path>
                          </svg>
                        </div>
                      </a>
                      <a href="https://facebook.com/nufab" target="_blank" rel="noopener noreferrer" className="uui-button-secondary-gray-3 is-button-small icon-only w-inline-block">
                        <div className="uui-button-icon-3 text-color-gray400 w-embed">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 10C20 4.47715 15.5229 0 10 0C4.47715 0 0 4.47715 0 10C0 14.9912 3.65684 19.1283 8.4375 19.8785V12.8906H5.89844V10H8.4375V7.79688C8.4375 5.29063 9.93047 3.90625 12.2146 3.90625C13.3084 3.90625 14.4531 4.10156 14.4531 4.10156V6.5625H13.1922C11.95 6.5625 11.5625 7.3334 11.5625 8.125V10H14.3359L13.8926 12.8906H11.5625V19.8785C16.3432 19.1283 20 14.9912 20 10Z" fill="currentColor"></path>
                          </svg>
                        </div>
                      </a>
                      <a href="https://linkedin.com/company/nufab" target="_blank" rel="noopener noreferrer" className="uui-button-secondary-gray-3 is-button-small icon-only w-inline-block">
                        <div className="uui-button-icon-3 text-color-gray400 w-embed">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.5236 0H1.47639C1.08483 0 0.709301 0.155548 0.432425 0.432425C0.155548 0.709301 0 1.08483 0 1.47639V18.5236C0 18.9152 0.155548 19.2907 0.432425 19.5676C0.709301 19.8445 1.08483 20 1.47639 20H18.5236C18.9152 20 19.2907 19.8445 19.5676 19.5676C19.8445 19.2907 20 18.9152 20 18.5236V1.47639C20 1.08483 19.8445 0.709301 19.5676 0.432425C19.2907 0.155548 18.9152 0 18.5236 0ZM5.96111 17.0375H2.95417V7.48611H5.96111V17.0375ZM4.45556 6.1625C4.11447 6.16058 3.7816 6.05766 3.49895 5.86674C3.21629 5.67582 2.99653 5.40544 2.8674 5.08974C2.73826 4.77404 2.70554 4.42716 2.77336 4.09288C2.84118 3.7586 3.0065 3.4519 3.24846 3.21148C3.49042 2.97107 3.79818 2.80772 4.13289 2.74205C4.4676 2.67638 4.81426 2.71133 5.12913 2.84249C5.44399 2.97365 5.71295 3.19514 5.90205 3.47901C6.09116 3.76288 6.19194 4.09641 6.19167 4.4375C6.19488 4.66586 6.15209 4.89253 6.06584 5.104C5.97959 5.31547 5.85165 5.50742 5.68964 5.66839C5.52763 5.82936 5.33487 5.95607 5.12285 6.04096C4.91083 6.12585 4.68389 6.16718 4.45556 6.1625ZM17.0444 17.0458H14.0389V11.8278C14.0389 10.2889 13.3847 9.81389 12.5403 9.81389C11.6486 9.81389 10.7736 10.4861 10.7736 11.8667V17.0458H7.76667V7.49306H10.6583V8.81667H10.6972C10.9875 8.22917 12.0042 7.225 13.5556 7.225C15.2333 7.225 17.0458 8.22083 17.0458 11.1375L17.0444 17.0458Z" fill="currentColor"></path>
                          </svg>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="uui-footer02_right-wrapper">
                  <div className="uui-footer02_heading">Join</div>
                  <div className="uui-footer02_form-block w-form">
                    <form className="uui-footer02_form">
                      <input 
                        className="uui-form_input w-input" 
                        maxLength="256" 
                        name="email" 
                        placeholder="Enter your email" 
                        type="email" 
                        required 
                      />
                      <input 
                        type="submit" 
                        className="uui-button-2 is-button-small w-button" 
                        value="Subscribe" 
                      />
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="uui-footer02_bottom-wrapper">
                <div className="uui-footer02_legal-list-wrapper">
                  <div className="uui-text-size-small-2 text-color-gray500">© 2025 Nufab</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
