import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Homeabout = () => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", 
          end: "+=100%",
          pin: true,
          scrub: 0.5, 
          refreshPriority: -1, 
        },
      });

      tl.fromTo(
        textRef.current,
        { y: "100%" }, 
        { y: "-85%", ease: "none" } 
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-white overflow-hidden flex justify-center items-center z-50 text-black"
    >
      {/* Side Labels */}
      <div className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 text-sm md:text-base font-medium z-20">
        Artists
      </div>
      <div className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2 text-sm md:text-base font-medium z-20">
        Designer
      </div>

      <div className="relative flex flex-col items-center justify-center">
        <div className="relative z-10 w-[250px] h-[350px] md:w-[350px] md:h-[450px]">
          <img
            src="https://cdn.prod.website-files.com/67a766fea7b4c145250bc504/67aeea2493e039a559fb6a2f_0_0%20(2).webp"
            alt="Kei Rose Portrait"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          ref={textRef}
          className="absolute top-0 w-full h-full pointer-events-none z-30"
        >
          <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-9xl font-normal tracking-tight text-black whitespace-nowrap">
            Kei Rose
          </h1>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-[120px] ml-[100px] md:mt-[130px] md:ml-[150px] w-64 md:w-80 text-sm md:text-base leading-relaxed font-medium text-black">
            <p>
              Redefining minimalism through material authenticity and design order. Forma moves beyond simple form, creating refined designs that shape spaces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homeabout;
