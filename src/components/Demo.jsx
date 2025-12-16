// ProductShowcase.jsx
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

// ---------- Data ----------
const productData = {
  roz: {
    id: "roz",
    number: "001",
    name: "Roz Roz",
    productName: "Vera Shelf Red",
    mainImage:
      "https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad9bf7308dfcca86a383c9_8.webp",
    detailImage:
      "https://cdn.prod.website-files.com/68558d427ad3bce190a51b77/68558d427ad3bce190a51b6e_8-2.webp",
    description:
      "A deep red shelf that stands as a statement of timeless design.",
    price: "₹ 3,800.00 INR",
  },
  kuch: {
    id: "kuch",
    number: "002",
    name: "Kuch Roz",
    productName: "Arco Shelf Metal",
    mainImage:
      "https://cdn.prod.website-files.com/67a7721e638cc64a55110750/67ad9b7fdaa7aa4b594f62f4_5.webp",
    detailImage:
      "https://cdn.prod.website-files.com/68558d427ad3bce190a51b77/68558d427ad3bce190a51b71_5-2.webp",
    description: "A minimalist metal shelf with a refined industrial look.",
    price: "₹ 4,200.00 INR",
  },
};

export default function ProductShowcase() {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState("roz");
  const activeProduct = productData[activeTabId];

  const NavItem = ({ number, name, id }) => {
    const isActive = activeTabId === id;
    return (
      <div className={`w-full pb-4 ${isActive ? 'border-b-2 border-black' : 'border-b-2 border-gray-300'}`}>
        <button onClick={() => setActiveTabId(id)} className="w-full text-left flex items-center gap-8">
          <div
            className={`text-base tracking-wide font-semibold font-bdogrotesk whitespace-nowrap ${
              isActive ? "text-black" : "text-gray-400"
            }`}
          >
            {number}
          </div>
          <div
            className={`pt-8 text-6xl leading-[1.05] font-semibold font-bdogrotesk ${
              isActive ? "text-black" : "text-gray-400"
            }`}
          >
            {name}
          </div>
        </button>
      </div>
    );
  };

  return (
    <section className="mx-auto max-w-screen py-8">
      {/* Grid like the reference: left rail / hero / right panel */}
      <div className="grid grid-cols-12 gap-x-6 lg:gap-x-4">
        {/* Left rail */}
        <aside className="col-span-12 lg:col-span-4 pt-4">
          <div className="space-y-6">
            <NavItem
              number={productData.roz.number}
              name={productData.roz.name}
              id={productData.roz.id}
            />
            <NavItem
              number={productData.kuch.number}
              name={productData.kuch.name}
              id={productData.kuch.id}
            />
          </div>
        </aside>

        {/* Middle: hero + name + CTA bar */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-gray-100">
            <img
              src={activeProduct.mainImage}
              alt={activeProduct.productName}
              className=" h-[120vh] w-full object-cover" // <-- CHANGED TO w-full
              draggable={false}
            />
          </div>

          {/* Product name under image (small, grey) */}
          <div className="mt-6 text-[15px] text-gray-700 font-bdogrotesk">
            {activeProduct.productName}
          </div>

          {/* Full-width black CTA bar with price on right */}
          {/* Full-width black CTA bar with price on right */}
          <button
            type="button"
            onClick={() => navigate('/product/1')}
            // The 'group' class here will trigger BOTH animations
            className="group mt-2 w-full bg-black text-white px-3 py-2 flex items-center justify-between text-base font-medium tracking-wide font-bdogrotesk"
          >

            {/* === ANIMATED "SHOP NOW" (LEFT SIDE) === */}
            <div className="relative h-5 overflow-hidden">
              <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                <span className="flex h-5 items-center">Shop now</span>
                <span className="flex h-5 items-center">Shop now</span>
              </div>
            </div>

            {/* === THIS IS THE FIX === */}
            {/* We apply the *same* animation structure to the price */}
            <div className="relative h-5 overflow-hidden">
              <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">

                {/* Price 1 (Visible) */}
                <span className="flex h-5 items-center text-white/90">
                  {activeProduct.price}
                </span>

                {/* Price 2 (Hidden, slides in) */}
                <span className="flex h-5 items-center text-white/90">
                  {activeProduct.price}
                </span>

              </div>
            </div>

          </button>
        </div>

        {/* Right: thumb + copy */}
        <aside className="col-span-12 lg:col-span-2 pt-6 lg:pt-0">
          <div className="space-y-6">
            <div className="bg-gray-100">
              <img
                src={activeProduct.detailImage}
                alt={`${activeProduct.productName} detail`}
                className="w-full h-[40vh] object-cover"
                draggable={false}
              />
            </div>
            <p className="text-[15px] leading-6 text-gray-700 font-bdogrotesk">
              {activeProduct.description}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
