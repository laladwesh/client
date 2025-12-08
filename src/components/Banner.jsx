import React, { useState } from 'react';

const Banner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <section className="uui-banner12_component ">
      <div className="uui-page-padding-3">
        <div className="uui-container-large-3">
          <div className="uui-banner12_wrapper">
            <div className="uui-banner12_content">
              <div className="uui-banner12_text-wrapper">
                <div className="uui-banner12_text">
                  Worldwide Shipping &amp; 24*7 Returns available | With love from Nufab team
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsVisible(false)} 
              className="uui-banner12_close-button w-inline-block"
            >
              <div className="uui-icon-1x1-xxsmall w-embed">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
