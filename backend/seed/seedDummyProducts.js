require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');

// ---------- helpers ----------
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const image = (slug, i) =>
  `https://picsum.photos/seed/${slug}-${i}/1200/1600`;

// ---------- vocab ----------
const categories = ['Roz Roz', 'Kuch Kuch'];

const colors = [
  'Black', 'White', 'Olive', 'Beige', 'Indigo', 'Navy',
  'Mustard', 'Terracotta', 'Charcoal', 'Emerald',
  // New broad additions
  'Neutral', 'Earth Tone', 'Pastel', 'Dark', 'Light', 
  'Muted', 'Warm Tone', 'Cool Tone', 'Monochrome', 'Bright'
];

const fabrics = [
  { type: 'Cotton', material: '100% Cotton' },
  { type: 'Linen Blend', material: '55% Linen, 45% Cotton' },
  { type: 'Denim', material: '100% Cotton' },
  { type: 'Rayon', material: '100% Rayon' },
  { type: 'Viscose Blend', material: '70% Viscose, 30% Polyester' },
  // New broad additions
  { type: 'Synthetic Blend', material: 'Polyester Blend' },
  { type: 'Natural Fiber', material: '100% Natural Fibers' },
  { type: 'Stretch Fabric', material: 'Cotton/Spandex Blend' },
  { type: 'Woven', material: 'Mixed Woven Materials' },
  { type: 'Soft Knit', material: 'Soft Touch Blend' }
];

const productsByType = {
  Bottoms: [
    'Wide Leg Pants', 'Straight Pants', 'Palazzo Pants', 'Midi Skirt',
    // New broad additions
    'Casual Trousers', 'Relaxed Fit Pants', 'Everyday Skirt', 'Leggings'
  ],
  Tops: [
    'Relaxed Tee', 'Button Shirt', 'Knit Top', 'Tank Top',
    // New broad additions
    'Basic Tee', 'Casual Top', 'Everyday Blouse', 'Sleeveless Top'
  ],
  Outerwear: [
    'Oversized Jacket', 'Corduroy Overshirt', 'Denim Jacket',
    // New broad additions
    'Light Layer', 'Casual Jacket', 'Utility Layer', 'Zip-Up'
  ],
  Dress: [
    'A-Line Dress', 'Midi Dress',
    // New broad additions
    'Casual Dress', 'Day Dress', 'Shift Dress'
  ],
};

const featuresPool = [
  'Breathable fabric',
  'Soft handfeel',
  'Easy care',
  'Comfort fit',
  'Lightweight',
  'Durable stitching',
  // New broad additions
  'Versatile style',
  'All-day comfort',
  'Wardrobe essential',
  'Classic design',
  'Modern silhouette',
  'Everyday wear'
];

// ---------- generator ----------
function generateProduct(index) {
  const productType = pick(Object.keys(productsByType));
  const productName = pick(productsByType[productType]);
  const color = pick(colors);
  const fabric = pick(fabrics);

  const sizeS = rand(5, 30);
  const sizeM = rand(5, 30);
  const sizeL = rand(5, 30);
  const sizeXL = rand(5, 30);

  const slug = `${productName}-${color}-${Date.now()}-${index}`
    .toLowerCase()
    .replace(/\s+/g, '-');

  return {
    category: pick(categories),
    product: productName,
    print: Math.random() > 0.6 ? 'Printed' : 'Solid',
    color,
    fabricType: fabric.type,
    fabricPattern: Math.random() > 0.5 ? 'Plain' : 'Textured',
    productType,
    length: pick(['Short', 'Regular', 'Midi', 'Full']),
    lengthInInches: rand(24, 44),
    sleeves: pick(['', 'Short', 'Long', 'Sleeveless']),
    closure: pick(['Elastic', 'Buttons', 'Zip', 'Pullover']),
    productDescription: `Comfortable ${productName.toLowerCase()} designed for everyday wear.`,
    fabricDescription: `Made from premium ${fabric.type.toLowerCase()} fabric.`,
    sizeAndFit: 'Regular fit. True to size.',
    features: [
      pick(featuresPool),
      pick(featuresPool),
    ],
    material: fabric.material,
    mrp: rand(999, 2999),
    discountedPrice: rand(699, 1999),
    sizeSQuantity: sizeS,
    sizeMQuantity: sizeM,
    sizeLQuantity: sizeL,
    sizeXLQuantity: sizeXL,
    totalQuantity: sizeS + sizeM + sizeL + sizeXL,
    slug,
    images: [
      image(slug, 1),
      image(slug, 2),
    ],
  };
}

// ---------- main ----------
(async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const COUNT = 400; // 👈 change this number anytime
    const products = [];

    for (let i = 0; i < COUNT; i++) {
      products.push(generateProduct(i));
    }

    await Product.insertMany(products);
    console.log(`✅ Inserted ${COUNT} random products`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
})();
