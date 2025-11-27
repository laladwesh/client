import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);

  // Dummy blog data
  const blogs = [
    {
      id: 1,
      title: "We make everyday clothes for people who like dressing up everyday. We free culture of the shackles of nostalgia, and let it take its place in today's everyday – in your everyday."
    },
    {
      id: 2,
      title: "Fashion is not just about following trends, it's about creating your own identity. Every piece tells a story, and we help you write yours with authenticity and style."
    },
    {
      id: 3,
      title: "Sustainable fashion isn't a choice anymore, it's a necessity. We believe in creating timeless pieces that respect both people and planet, one thread at a time."
    },
    {
      id: 4,
      title: "The future of fashion lies in minimalism and quality. We craft pieces that transcend seasons, celebrating simplicity and elegance in every stitch."
    },
    {
      id: 5,
      title: "Cultural heritage meets contemporary design. Our collections bridge the gap between traditional craftsmanship and modern aesthetics, creating something truly unique."
    }
  ];

  // Auto-scroll every 5-6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlogIndex((prevIndex) => (prevIndex + 1) % blogs.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [blogs.length]);

  return (
    <div className="bg-white py-12 relative" style={{ minHeight: '25vh', overflow: 'hidden' }}>
      <div className="w-screen px-4">
        {/* Top-right arrows to navigate blogs */}
        <div className="absolute right-4 top-4 z-20 flex gap-2">
          {/* Previous button */}
          <button
            aria-label="Previous blog"
            onClick={() => setCurrentBlogIndex((i) => (i - 1 + blogs.length) % blogs.length)}
            className="w-10 h-10 flex items-center justify-center  transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {/* Next button */}
          <button
            aria-label="Next blog"
            onClick={() => setCurrentBlogIndex((i) => (i + 1) % blogs.length)}
            className="w-10 h-10 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {/* Blog Display Area */}
        <div className="relative overflow-hidden" style={{ minHeight: '25vh' }}>
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentBlogIndex * 100}%)` }}
          >
            {blogs.map((blog) => (
              <div 
                key={blog.id}
                className="flex-shrink-0 w-full"
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] text-black pr-4">
                  {blog.title}
                </h2>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link 
            to="/blogs" 
            className="text-black text-base font-medium uppercase tracking-tight hover:underline transition-all duration-300"
          >
            Read This Blog
          </Link>
          
          <Link 
            to="/blogs" 
            className="text-black text-base font-medium uppercase tracking-tight hover:underline transition-all duration-300"
          >
            Read All Blogs
          </Link>
        </div>

        {/* Pagination Dots */}
        {/* <div className="flex justify-center gap-2 mt-8">
          {blogs.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBlogIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentBlogIndex ? 'w-8 bg-black' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default Blog;