import React, { useState } from "react";

const faqsData = [
  {
    id: "01",
    title: "Orders & Shipping",
    items: [
      {
        q: "When can I expect to receive my order?",
        a: `Nufab is a small studio and each piece is made to order. Depending on the volume of orders, it can take anywhere between 2–5 days for us to dispatch your order. Shipping within India usually takes another 2–4 days, so please allow 4–9 days in total for your handmade garment to reach you. We appreciate your patience.`,
      },
      {
        q: "Can I track my order?",
        a: "Yes, tracking details will be shared once your order is shipped.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept major cards and UPI payments.",
      },
      {
        q: "Can I change my delivery address after placing the order?",
        a: "Please contact us immediately to check if changes are possible.",
      },
      {
        q: "Does Nufab ship internationally?",
        a: "Yes, international shipping is available for select countries.",
      },
    ],
  },
  {
    id: "02",
    title: "Returns & Exchanges",
    items: [
      {
        q: "Can I return my order?",
        a: "Returns are accepted only for damaged or incorrect items.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled within 24 hours of purchase.",
      },
      {
        q: "Can I exchange my product for a different size?",
        a: "Yes, subject to availability.",
      },
    ],
  },
  {
    id: "03",
    title: "Products & Sizing",
    items: [
      {
        q: "Will my piece look exactly like the photos?",
        a: "Each handmade piece may have slight variations.",
      },
      {
        q: "Are all Nufab pieces handmade?",
        a: "Yes, every garment is handcrafted.",
      },
      {
        q: "How do I know my size?",
        a: "Please refer to the size guide on the product page.",
      },
      {
        q: "Does Nufab offer customisation?",
        a: "Customisation is available for select products.",
      },
    ],
  },
  {
    id: "04",
    title: "Care & Materials",
    items: [
      {
        q: "Are Nufab clothes safe to machine wash?",
        a: "We recommend gentle hand washing.",
      },
      {
        q: "Do Nufab pieces shrink after washing?",
        a: "Minimal shrinkage may occur due to natural fabrics.",
      },
      {
        q: "Does Nufab use premium materials?",
        a: "Yes, we source high-quality fabrics.",
      },
      {
        q: "Where does Nufab get its fabric?",
        a: "From trusted local suppliers.",
      },
    ],
  },
  {
    id: "05",
    title: "About Nufab",
    items: [
      {
        q: "Is Nufab a sustainable brand?",
        a: "We focus on mindful, low-waste production.",
      },
      {
        q: "Is Nufab a design studio or clothing brand?",
        a: "Nufab is a clothing brand with a design-led approach.",
      },
      {
        q: "How can I get in touch with Nufab?",
        a: "You can reach us via email or Instagram.",
      },
      {
        q: "Where does Nufab get its fabric?",
        a: "We work closely with Indian fabric vendors.",
      },
    ],
  },
];

const FaqsPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (key) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="w-full max-w-full mx-auto px-6 py-20 font-[bdogrotesk] text-black">
        <p className="text-black text-lg font-medium">FAQs</p>
      {faqsData.map((section, sectionIdx) => (
        <div
          key={section.id}
          className="flex gap-10 border-b border-black py-10"
        >
          {/* Left column */}
          <div className="text-base font-medium text-black tracking-wide w-20 flex-shrink-0">
            {section.id}
          </div>

          {/* Right column */}
          <div className="flex-1 justify-between flex gap-10">
            <h2 className="w-72 text-6xl font-medium flex-shrink-0">{section.title}</h2>

            <div className="space-y-4 flex-1 max-w-2xl">
              {section.items.map((item, itemIdx) => {
                const key = `${sectionIdx}-${itemIdx}`;
                const isOpen = openIndex === key;

                return (
                  <div key={key} className="border-b border-black pb-4">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex justify-between items-start text-left"
                    >
                      <span className="text-base text-black font-medium pr-6">{item.q}</span>
                      <span className="text-lg leading-none flex-shrink-0">
                        {isOpen ? "×" : "+"}
                      </span>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-96 mt-4" : "max-h-0"
                      }`}
                    >
                      <p className="text-base leading-relaxed pr-10">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqsPage;
