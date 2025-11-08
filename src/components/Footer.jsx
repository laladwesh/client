import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full h-[70vh] bg-black text-white flex flex-col justify-between px-12 py-8 z-10 overflow-hidden">
      <div className="flex items-start justify-between w-full pt-8">
        <div className="flex flex-col gap-1">
          <Link to="/" className="text-sm hover:opacity-70 transition-opacity">Home</Link>
          <Link to="/store" className="text-sm hover:opacity-70 transition-opacity">Store</Link>
          <Link to="/store" className="text-sm hover:opacity-70 transition-opacity">Collection</Link>
          <Link to="/about" className="text-sm hover:opacity-70 transition-opacity">About</Link>
          <Link to="/contact" className="text-sm hover:opacity-70 transition-opacity">Contact</Link>
        </div>
        
        <div className="flex flex-col gap-1">
          <a href="https://instagram.com/nufab.in" target="_blank" rel="noopener noreferrer" className="text-sm hover:opacity-70 transition-opacity">Instagram</a>
          <a href="mailto:contact@nufab.in" className="text-sm hover:opacity-70 transition-opacity">Email</a>
        </div>
        
        <div className="flex flex-col gap-1">
          <Link to="/info/license" className="text-sm hover:opacity-70 transition-opacity">Licence</Link>
          <Link to="/info/change-log" className="text-sm hover:opacity-70 transition-opacity">Changelog</Link>
          <Link to="/info/design-system" className="text-sm hover:opacity-70 transition-opacity">Design system</Link>
        </div>
      </div>
      
      <h1 className="text-[35vw] font-bold leading-[0.8] text-white relative z-[99] m-0 w-screen -mx-12">Nufab</h1>
    </footer>
  );
};

export default Footer;
