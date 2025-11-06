import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [activeTab, setActiveTab] = useState('Tab 2');
  const [activeView, setActiveView] = useState('image');
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const logoRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const scrollSection1 = useRef(null);
  const scrollSection2 = useRef(null);
  const scrollSection3 = useRef(null);

  useEffect(() => {
    // Disable scroll initially
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    let scrollCount = 0;
    let isAnimating = false;

    const handleWheel = (e) => {
      e.preventDefault();

      if (isAnimating) return;

      if (scrollCount === 0) {
        // First scroll: Move logo to CENTER of navbar (pixel-accurate)
        isAnimating = true;
        scrollCount++;

        const logo = logoRef.current;
        const navbar = document.querySelector('.navbar-logo-wrapper-home');
        const navbarImg = navbar?.querySelector('img');

        if (logo && navbar && navbarImg) {
          // Ensure navbar starts hidden and will fade in
          navbar.style.opacity = '0';
          navbar.style.transition = 'opacity 0.25s';

          // read bounding boxes
          const logoRect = logo.getBoundingClientRect();
          const navbarImgRect = navbarImg.getBoundingClientRect();

          // compute target pixel coordinates (top,left) so logo center lines with navbar image center
          const targetCenterX = navbarImgRect.left + navbarImgRect.width / 2;
          const targetCenterY = navbarImgRect.top + navbarImgRect.height / 2;
          const targetLeft = targetCenterX - logoRect.width / 2;
          const targetTop = targetCenterY - logoRect.height / 2;

          // Freeze the logo at current pixel coordinates by removing percent-centered transform
          // and setting top/left explicitly to current position.
          // (This avoids transform stacking issues.)
          logo.style.transform = 'none';
          logo.style.position = 'fixed';
          logo.style.top = `${logoRect.top}px`;
          logo.style.left = `${logoRect.left}px`;
          logo.style.margin = '0';
          // ensure it stays above navbar
          logo.style.zIndex = 10000;
          // make sure it has no CSS transitions that conflict
          logo.style.transition = 'none';
          // prepare for GPU acceleration & smoothness
          logo.style.willChange = 'top,left,transform,opacity';

          // Animate to exact pixel position target with scale
          gsap.to(logo, {
            duration: 2,
            ease: 'power2.inOut',
            top: targetTop,
            left: targetLeft,
            scale: 0.61,
            onUpdate: function () {
              const progress = this.progress();
              // fade navbar in smoothly as the logo arrives (starts when 70% done)
              if (progress > 0.7) {
                const navOpacity = (progress - 0.7) / 0.3;
                navbar.style.opacity = `${Math.min(1, navOpacity)}`;
              }
            },
            onComplete: () => {
              // fade out the centered logo gently, leaving the navbar visible
              gsap.to(logo, {
                duration: 0.18,
                opacity: 0,
                onComplete: () => {
                  // keep navbar fully visible
                  navbar.style.opacity = '1';
                  // optional: hide logo from pointer events and remove it from flow (but keep DOM)
                  logo.style.pointerEvents = 'none';
                  isAnimating = false;
                }
              });
            }
          });
        } else {
          // fallback: if selectors fail, just allow next scroll
          isAnimating = false;
        }
      } else if (scrollCount === 1) {
        // Second scroll: enable scrolling
        scrollCount++;

        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';

        // Smooth scroll to content
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
          setScrollEnabled(true);
          window.removeEventListener('wheel', handleWheel);
        }, 500);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);

  // Scroll-based animations using GSAP ScrollTrigger
  useEffect(() => {
    if (!scrollEnabled) return;

    // Horizontal scroll animation - Images slide in from behind center image
    if (scrollSection1.current) {
      const leftImage = scrollSection1.current.querySelector('.left-image');
      const centerImage = scrollSection1.current.querySelector('.center-image');
      const rightImage = scrollSection1.current.querySelector('.right-image');
      const productInfos = scrollSection1.current.querySelectorAll('.product-info');
      
      // Create timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollSection1.current,
          start: 'top top',
          end: '+=2000', // Shorter scroll for quicker animation
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Phase 1: Left image slides out from center to left
      tl.fromTo(
        leftImage,
        { x: 0, opacity: 1 },
        { x: -400, opacity: 1, duration: 1, ease: 'power2.out' },
        0
      );

      // Phase 2: Right image slides out from center to right (same time as left)
      tl.fromTo(
        rightImage,
        { x: 0, opacity: 1 },
        { x: 400, opacity: 1, duration: 1, ease: 'power2.out' },
        0
      );

      // Phase 3: Show buttons IMMEDIATELY when images reach position (at same time)
      tl.to(
        productInfos,
        { opacity: 1, duration: 0.3, stagger: 0 },
        1 // Starts right when images finish moving
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [scrollEnabled]);

  return (
    <div>
      {/* Centered Logo (appears on load) */}
      <div
        ref={logoRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          transition: 'opacity 0.3s',
        }}
      >
        <img width="200" loading="lazy" alt="Nufab Logo" src="/images/Logo--White.svg" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="section_hero">
        <div className="hero-background">
          <div className="background-video w-background-video w-background-video-atom">
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{ backgroundImage: 'url("/videos/5821504-hd_1920_1080_25fps-poster-00001.jpg")' }}
            >
              <source src="/videos/5821504-hd_1920_1080_25fps-transcode.mp4" />
              <source src="/videos/5821504-hd_1920_1080_25fps-transcode.webm" />
            </video>
            <div className="video-overlay"></div>
          </div>
        </div>
      </section>

      {/* Section 02 - Mission Statement */}
      <div ref={contentRef} className="bg-white py-12 overflow-hidden">
        <div className="w-screen">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] text-black px-4 md:px-4 lg:px-4 pr-0">
            We make everyday clothes for people who like dres-<br />-sing up everyday. We free culture of the shackles of nostalgia, and let it take its place in today's everyday - in your everyday.
          </h1>
          
          <div className="mt-16 px-4 flex justify-start space-x-80 md:px-8 lg:px-12">
            <h3 className="text-xs font-bold mb-4 text-black uppercase tracking-wider">Vision</h3>
            <p className="text-sm leading-relaxed max-w-xl text-gray-900">
              Redefining minimalism through material authenticity and design order. Forma moves beyond simple forms to create considered designs that shape spaces.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Section - Material Driven */}
      <div ref={scrollSection1} className="min-h-screen bg-white overflow-hidden relative">
        <div className="horizontal-scroll-container h-screen flex items-center justify-center relative px-0">
          {/* Fixed Text on sides - BEHIND images */}
          <div className="fixed left-8 top-1/2 -translate-y-1/2 text-sm font-medium z-0">
            Material
          </div>
          <div className="fixed right-8 top-1/2 -translate-y-1/2 text-sm font-medium z-0">
            Driven
          </div>

          {/* Image Container - All 3 images stacked, will spread to full width */}
          <div className="images-wrapper relative w-full h-full flex items-center justify-center">
            
            {/* Left Image - Slides to left edge, fills 1/3 width */}
            <div className="left-image absolute left-1/2 -translate-x-1/2 w-[33.33vw]" style={{ zIndex: 10 }}>
              <img
                src="/images/Experimental-Marketing_1Experimental Marketing.webp"
                alt="Arco Shelf Metal"
                className="w-full h-auto object-cover"
              />
              <div className="product-info mt-6 opacity-0 px-6">
                <h3 className="text-base font-medium mb-3">Arco Shelf Metal</h3>
                <div className="flex items-center gap-4">
                  <button className="bg-black text-white px-6 py-2.5 text-sm font-medium">Shop now</button>
                  <span className="text-sm">$ 4,200.00 USD</span>
                </div>
              </div>
            </div>

            {/* Center Image - Stays in center, fills 1/3 width */}
            <div className="center-image absolute left-1/2 -translate-x-1/2 w-[33.33vw]" style={{ zIndex: 20 }}>
              <img
                src="/images/Group-262_1Group 262.webp"
                alt="Arco Sofa Metal"
                className="w-full h-auto object-cover"
              />
              <div className="product-info mt-6 opacity-0 px-6">
                <h3 className="text-base font-medium mb-3">Arco Sofa Metal</h3>
                <div className="flex items-center gap-4">
                  <button className="bg-black text-white px-6 py-2.5 text-sm font-medium">Shop now</button>
                  <span className="text-sm">$ 7,500.00 USD</span>
                </div>
              </div>
            </div>

            {/* Right Image - Slides to right edge, fills 1/3 width */}
            <div className="right-image absolute left-1/2 -translate-x-1/2 w-[33.33vw]" style={{ zIndex: 10 }}>
              <img
                src="/images/Group-1009002131-1_1Group 1009002131 (1).webp"
                alt="Arco Stool Metal"
                className="w-full h-auto object-cover"
              />
              <div className="product-info mt-6 opacity-0 px-6">
                <h3 className="text-base font-medium mb-3">Arco Stool Metal</h3>
                <div className="flex items-center gap-4">
                  <button className="bg-black text-white px-6 py-2.5 text-sm font-medium">Shop now</button>
                  <span className="text-sm">$ 1,500.00 USD</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ... rest of component unchanged ... */}

      {/* Section 03 - About Us Cards */}
      {/* <div className="home-section-03">
        <div className="home-section-03-about-us">
          <div className="rt-portfolio-marquee">
            <div className="rt-portfolio-marquee-block">
              <div className="rt-collection-list-four">
                <div className="rt-service-three-portfolio-wrapper rt-underline-off rt-background-dark">
                  <img
                    className="rt-autofit-cover rt-responsive-full-width-image rt-change-height"
                    src="/images/Experimental-Marketing_1Experimental Marketing.webp"
                    width="478"
                    height="595"
                    alt="experimental marketing"
                    loading="lazy"
                  />
                  <div className="rt-service-three-portfolio-overlay"></div>
                  <div className="rt-service-three-portfolio-text">
                    <Link to="/about" className="button w-button">
                      About Us
                    </Link>
                  </div>
                </div>
                <div className="rt-service-three-portfolio-wrapper rt-underline-off rt-background-dark">
                  <img
                    className="rt-autofit-cover rt-responsive-full-width-image rt-change-height"
                    src="/images/Group-262_1Group 262.webp"
                    width="478"
                    height="595"
                    alt="mobile image"
                    loading="lazy"
                  />
                  <div className="rt-service-three-portfolio-overlay"></div>
                  <div className="rt-service-three-portfolio-text">
                    <Link to="/contact" className="button w-button">
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* ... remaining sections unchanged ... */}

      <div className="home-section-04">
        <div className="grid">
          <h1 className="heading01">
            Discover
            <br />
            Collection
          </h1>
        </div>
        <div className="grid">
          <div className="home-section-04-tab-wrap">
            <div className="collection-tab w-tabs">
              <div className="collection-tab-menu w-tab-menu">
                <button
                  onClick={() => setActiveTab('Tab 1')}
                  className={`collection-tab-link w-inline-block w-tab-link ${activeTab === 'Tab 1' ? 'w--current' : ''}`}
                >
                  <p className="body-regular">001</p>
                  <h3 className="heading03 small-height">Roz Roz</h3>
                </button>
                <button
                  onClick={() => setActiveTab('Tab 2')}
                  className={`collection-tab-link w-inline-block w-tab-link ${activeTab === 'Tab 2' ? 'w--current' : ''}`}
                >
                  <p className="body-regular">002</p>
                  <h3 className="heading03 small-height">Kuch Roz</h3>
                </button>
              </div>
              <div className="collection-content w-tab-content">
                {activeTab === 'Tab 1' && (
                  <div className="w-tab-pane w--tab-active">
                    <div className="collection-tab-inner">
                      <div className="w-dyn-list">
                        <div className="w-dyn-empty">
                          <div>No items found.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'Tab 2' && (
                  <div className="w-tab-pane w--tab-active">
                    <div className="collection-tab-inner">
                      <div className="w-dyn-list">
                        <div className="w-dyn-empty">
                          <div>No items found.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 05 - Product List */}
      <div className="home-section-05">
        <div className="product-list-wrap">
          <div className="product-category-wrap-home">
            <div className="product-category-list-wrap-home">
              <div className="body-regular">Sort By +</div>
              <Link to="/store" className="body-regular--home view-link">
                All
              </Link>
            </div>
          </div>

          <div className="product-view-home w-tabs">
            <div className="product-view-tab-menu-home w-tab-menu">
              <button
                onClick={() => setActiveView('image')}
                className={`product-view-tab-link-home w-inline-block w-tab-link ${activeView === 'image' ? 'w--current' : ''}`}
              >
                <div className="body-regular">Image</div>
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`product-view-tab-link-home w-inline-block w-tab-link ${activeView === 'list' ? 'w--current' : ''}`}
              >
                <div className="body-regular">List</div>
              </button>
            </div>

            <div className="w-tab-content">
              {activeView === 'image' && (
                <div className="w-tab-pane w--tab-active">
                  <div className="product-cms-image-home w-dyn-list">
                    <div className="w-dyn-empty">
                      <div>No items found.</div>
                    </div>
                  </div>
                </div>
              )}
              {activeView === 'list' && (
                <div className="w-tab-pane w--tab-active">
                  <div className="product-cms-list w-dyn-list">
                    <div className="w-dyn-empty">
                      <div>No items found.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="button-view-product">
            <Link to="/store" className="button-product w-button">
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* Section 06 - Final Section */}
      <div className="home-section-06">
        <div className="home-section-06-last">
          <div className="rt-portfolio-one-card-block-one">
            <div className="rt-portfolio-one-card-block-one-left rt-background-dark">
              <img
                width="600"
                height="727"
                alt="Portfolio Image"
                src="/images/Group-1009002131-1_1Group 1009002131 (1).webp"
                loading="lazy"
                className="rt-full-width-3 rt-full-height"
              />
              <div className="rt-portfolio-card-contain rt-active">
                <div className="rt-component-heading-five rt-text-white">To Preserve and Evolve?</div>
                <div className="paragraph-last-section">
                  Nufab is a movement to preserve culture by allowing it to evolve. We see local materials, motifs,
                  and skills as invaluable design resources. To honour them means keeping them alive in practice,
                  and letting them take shape with time. Culture does not belong in a museum to be occasionally
                  recalled with nostalgia. It belongs where it was born: with the people, in the everyday.
                </div>
                <Link to="/about" className="button-about w-button">
                  About Us
                </Link>
              </div>
            </div>

            <div className="rt-portfolio-one-card-block-one-right">
              <div className="rt-portfolio-one-card-block-one-right-bottom rt-background-dark">
                <img
                  width="597"
                  height="360"
                  alt="home-three-section-eight--scroll-banner"
                  src="/images/home-three-section-eight--scroll-banner.webp"
                  loading="lazy"
                  className="rt-full-width-3 rt-full-height"
                />
              </div>
              <div className="rt-portfolio-one-card-block-one-right-bottom rt-background-dark">
                <img
                  width="597"
                  height="360"
                  alt="Background"
                  src="/images/CTA-bg.webp"
                  loading="lazy"
                  className="rt-full-width-3 rt-full-height"
                />
                <div className="rt-portfolio-card-contain">
                  <div className="component-heading">Show all Dresses</div>
                  <Link to="/store" className="button-about-2 w-button">
                    Explore Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Home;
