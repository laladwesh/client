import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Homeabout = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top", 
        end: "+=100%",
        scrub: 1,
        pin: true,
        anticipatePin: 1
      }
    });

    // Animate text moving up
    // Initial state is set in CSS/Tailwind (below the image)
    // Final state moves it up past the image
    tl.to(text, {
      y: "-120%", // Move up by 120% of its height
      ease: "none"
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen w-full bg-white overflow-hidden flex flex-col items-center justify-center">
      
      {/* Centered Image (Fixed Position visually due to pin) */}
      <div ref={imageRef} className="relative z-10 w-[300px] md:w-[400px] aspect-[3/4] shadow-xl">
        <img 
          src="https://cdn.prod.website-files.com/67a766fea7b4c145250bc504/67aeea2493e039a559fb6a2f_0_0%20(2).webp" 
          alt="Kei Rose Portrait" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Scrolling Text Layer */}
      {/* Positioned absolutely to overlay/underlay correctly */}
      <div 
        ref={textRef} 
        className="absolute top-[40%] left-0 w-full z-20 flex flex-col items-center text-center pointer-events-none"
      >
        {/* Large Name Text */}
        <h1 className="text-[15vw] leading-none font-medium text-black tracking-tighter mix-blend-difference md:mix-blend-normal">
          Kei Rose
        </h1>
        
        {/* Description Paragraph - positioned to scroll up with the name */}
        <div className="mt-[40vh] max-w-md px-6 text-left md:text-center md:ml-[300px]"> 
          <p className="text-sm md:text-base font-medium text-black leading-relaxed">
            Redefining minimalism through material authenticity and design order. 
            Forma moves beyond simple form, creating refined designs that shape spaces.
          </p>
        </div>
      </div>

      {/* Side Labels (Static) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wide z-20">
        Artists
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wide z-20">
        Designer
      </div>

    </div>
  );
};

export default Homeabout;