import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Demo from "../components/Demo";
import New from "../components/New";
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const logoRef = useRef(null);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const scrollSection1 = useRef(null);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // reset scroll for all browsers
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  useEffect(() => {
    // Disable scroll initially
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    let scrollAmount = 0;
    const maxScroll = 150;
    let animationFrame = null;
    let isComplete = false;

    const logo = logoRef.current;
    const navbar = document.querySelector(".navbar-logo-wrapper-home");
    const navbarImg = navbar?.querySelector("img");

    if (!logo || !navbar || !navbarImg) return;

    // Function to get accurate navbar position
    const getNavbarPosition = () => {
      const rect = navbarImg.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    // Set initial position
    gsap.set(logo, {
      position: "fixed",
      left: startX,
      top: startY,
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      zIndex: 10000,
    });

    const handleWheel = (e) => {
      e.preventDefault();

      if (isComplete) return;

      // Increase scroll amount
      scrollAmount += Math.abs(e.deltaY) * 0.3;
      scrollAmount = Math.min(scrollAmount, maxScroll);

      // Calculate progress (0 to 1)
      const progress = scrollAmount / maxScroll;

      // Get current navbar position (in case of any shifts)
      const navbarPos = getNavbarPosition();
      const targetX = navbarPos.x;
      const targetY = navbarPos.y;

      // Cancel previous animation frame
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      // Use GSAP for smooth animation
      animationFrame = requestAnimationFrame(() => {
        const targetScale = 1 - 0.39 * progress;
        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress;

        gsap.to(logo, {
          duration: 0.3,
          ease: "power2.out",
          left: currentX,
          top: currentY,
          scale: targetScale,
          xPercent: -50,
          yPercent: -50,
        });
      });

      // Hide navbar logo during animation
      navbar.style.opacity = "0";

      // Check for completion
      if (progress >= 0.99 && !isComplete) {
        isComplete = true;

        setTimeout(() => {
          // Hide center logo, show navbar logo
          gsap.set(logo, { visibility: "hidden" });
          navbar.style.opacity = "1";

          document.body.style.overflow = "auto";
          document.body.style.height = "auto";
          window.removeEventListener("wheel", handleWheel);
          setScrollEnabled(true);
        }, 300);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    };
  }, []);

  // Scroll-based animations using GSAP ScrollTrigger
  // Scroll-based animations using GSAP ScrollTrigger
  useEffect(() => {
    if (!scrollEnabled) return;

    // Horizontal scroll animation - Images slide in from behind center image
    if (scrollSection1.current) {
      // --- FIX 1: GET NAVBAR HEIGHT ---
      // Get the navbar element (using the same selector as your intro animation)
      const navbar = document.querySelector(".navbar-logo-wrapper-home");
      // Get its height, provide a fallback (e.g., 80px) if it's not found
      const navbarHeight = navbar ? navbar.offsetHeight : 80;
      // --- END OF FIX 1 ---

      const leftImage = scrollSection1.current.querySelector(".left-image");
      const rightImage = scrollSection1.current.querySelector(".right-image");
      const productInfos =
        scrollSection1.current.querySelectorAll(".product-info");

      // Create timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollSection1.current,
          // --- FIX 1 (CONTINUED): SET NEW START POSITION ---
          // Start when the top of the section hits the BOTTOM of the navbar
          start: `top ${navbarHeight}px`,
          // --- END OF FIX 1 ---
          end: "+=2000", // Shorter scroll for quicker animation
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      // --- FIX 2: USE RESPONSIVE 'vw' UNITS ---
      // Phase 1: Left image slides out from center to left
      tl.fromTo(
        leftImage,
        { x: 0, opacity: 1 },
        // Use '-33.33vw' to move it left by one-third of the viewport width
        { x: "-33.33vw", opacity: 1, duration: 1, ease: "power2.out" },
        0
      );

      // Phase 2: Right image slides out from center to right (same time as left)
      tl.fromTo(
        rightImage,
        { x: 0, opacity: 1 },
        // Use '33.33vw' to move it right by one-third of the viewport width
        { x: "33.33vw", opacity: 1, duration: 1, ease: "power2.out" },
        0
      );
      // --- END OF FIX 2 ---

      // Phase 3: Show buttons (This is correct and will work as you want)
      // The .product-info is already inside each image div, so it will
      // move with its parent image.
      tl.to(
        productInfos,
        { opacity: 1, duration: 0.3, stagger: 0 },
        1 // Starts right when images finish moving
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scrollEnabled]);

  return (
    <div>
      {/* Centered Logo (appears on load) */}
      <div
        ref={logoRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          transition: "opacity 0.3s",
        }}
      >
        <img
          width="200"
          loading="lazy"
          alt="Nufab Logo"
          src="/images/Logo--White.svg"
        />
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
              style={{
                backgroundImage:
                  'url("/videos/5821504-hd_1920_1080_25fps-poster-00001.jpg")',
              }}
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
            We make everyday clothes for people who like dres-
            <br />
            -sing up everyday. We free culture of the shackles of nostalgia, and
            let it take its place in today's everyday - in your everyday.
          </h1>

          <div className="mt-16 px-4 flex justify-start space-x-80 md:px-8 lg:px-12">
            <h3 className="text-xs font-bold mb-4 text-black uppercase tracking-wider">
              Vision
            </h3>
            <p className="text-sm leading-relaxed max-w-xl text-gray-900">
              Redefining minimalism through material authenticity and design
              order. Forma moves beyond simple forms to create considered
              designs that shape spaces.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Section - Material Driven */}
      <div
        ref={scrollSection1}
        className="min-h-screen bg-white overflow-hidden relative"
      >
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
            <div
              className="left-image absolute left-1/2 -translate-x-1/2 w-[33.33vw]"
              style={{ zIndex: 10 }}
            >
              <img
                src="/images/Experimental-Marketing_1Experimental Marketing.webp"
                alt="Arco Shelf Metal"
                className="w-full h-[75vh] object-cover"
              />
              <div className="product-info mt-6 opacity-0 px-6">
                <h3 className="text-base font-medium mb-3">Arco Shelf Metal</h3>
                {/* --- NEW ANIMATED BUTTON --- */}
                <button
                  type="button"
                  className="group mt-2 w-full bg-black text-white px-5 py-4 flex items-center justify-between text-[15px] font-semibold tracking-wide"
                >
                  <div className="relative h-5 overflow-hidden">
                    <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                      <span className="flex h-5 items-center">Shop now</span>
                      <span className="flex h-5 items-center">Shop now</span>
                    </div>
                  </div>
                  <div className="relative h-5 overflow-hidden">
                    <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                      <span className="flex h-5 items-center text-white/90">
                        $ 4,200.00 USD
                      </span>
                      <span className="flex h-5 items-center text-white/90">
                        $ 4,200.00 USD
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Center Image - Stays in center, fills 1/3 width */}
            <div
              className="center-image absolute left-1/2 -translate-x-1/2 w-[33.33vw]"
              style={{ zIndex: 20 }}
            >
              <img
                src="/images/Group-262_1Group 262.webp"
                alt="Arco Sofa Metal"
                className="w-full h-[75vh] object-cover"
              />
              <div className="product-info mt-6 opacity-0 px-6">
                <h3 className="text-base font-medium mb-3">Arco Sofa Metal</h3>
                {/* --- NEW ANIMATED BUTTON --- */}
                <button
                  type="button"
                  className="group mt-2 w-full bg-black text-white px-5 py-4 flex items-center justify-between text-[15px] font-semibold tracking-wide"
                >
                  <div className="relative h-5 overflow-hidden">
                    <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                      <span className="flex h-5 items-center">Shop now</span>
                      <span className="flex h-5 items-center">Shop now</span>
                    </div>
                  </div>
                  <div className="relative h-5 overflow-hidden">
                    <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                      <span className="flex h-5 items-center text-white/90">
                        $ 7,500.00 USD
                      </span>
                      <span className="flex h-5 items-center text-white/90">
                        $ 7,500.00 USD
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Image - Slides to right edge, fills 1/3 width */}
            <div
              className="right-image absolute left-1/2 -translate-x-1/2 w-[33.33vw]"
              style={{ zIndex: 10 }}
            >
              <img
                src="/images/Group-1009002131-1_1Group 1009002131 (1).webp"
                alt="Arco Stool Metal"
                className="w-full h-[75vh] object-cover"
              />
              <div className="product-info mt-6 opacity-0 px-6">
                <h3 className="text-base font-medium mb-3">Arco Stool Metal</h3>
                {/* --- NEW ANIMATED BUTTON --- */}
                <button
                  type="button"
                  className="group mt-2 w-full bg-black text-white px-5 py-4 flex items-center justify-between text-[15px] font-semibold tracking-wide"
                >
                  <div className="relative h-5 overflow-hidden">
                    <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                      <span className="flex h-5 items-center">Shop now</span>
                      <span className="flex h-5 items-center">Shop now</span>
                    </div>
                  </div>
                  <div className="relative h-5 overflow-hidden">
                    <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                      <span className="flex h-5 items-center text-white/90">
                        $ 1,500.00 USD
                      </span>
                      <span className="flex h-5 items-center text-white/90">
                        $ 1,500.00 USD
                      </span>
                    </div>
                  </div>
                </button>
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
        <Demo />
      </div>
<New/>
      {/* Section 05 - Product List */}
      {/* <div className="home-section-05">
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
                onClick={() => setActiveView("image")}
                className={`product-view-tab-link-home w-inline-block w-tab-link ${
                  activeView === "image" ? "w--current" : ""
                }`}
              >
                <div className="body-regular">Image</div>
              </button>
              <button
                onClick={() => setActiveView("list")}
                className={`product-view-tab-link-home w-inline-block w-tab-link ${
                  activeView === "list" ? "w--current" : ""
                }`}
              >
                <div className="body-regular">List</div>
              </button>
            </div>

            <div className="w-tab-content">
              {activeView === "image" && (
                <div className="w-tab-pane w--tab-active">
                  <div className="product-cms-image-home w-dyn-list">
                    <div className="w-dyn-empty">
                      <div>No items found.</div>
                    </div>
                  </div>
                </div>
              )}
              {activeView === "list" && (
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
      </div> */}

      {/* Section 06 - Final Section */}
      <div className="home-section-06">
        <div className="home-section-06-last">
          <div className="rt-portfolio-one-card-block-one">
            <div className="rt-portfolio-one-card-block-one-left rt-background-dark">
              <img
                width="600"
                height="727"
                alt="Portfolio"
                src="/images/Group-1009002131-1_1Group 1009002131 (1).webp"
                loading="lazy"
                className="rt-full-width-3 rt-full-height"
              />
              <div className="rt-portfolio-card-contain rt-active">
                <div className="rt-component-heading-five rt-text-white">
                  To Preserve and Evolve?
                </div>
                <div className="paragraph-last-section">
                  Nufab is a movement to preserve culture by allowing it to
                  evolve. We see local materials, motifs, and skills as
                  invaluable design resources. To honour them means keeping them
                  alive in practice, and letting them take shape with time.
                  Culture does not belong in a museum to be occasionally
                  recalled with nostalgia. It belongs where it was born: with
                  the people, in the everyday.
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
