import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import https from 'https';

// ---------- config ----------
const TARGET_NEW_IMAGES = 5;
const IMAGE_SIZE = '800/1200';
const MAX_ATTEMPTS = 30;
const REQUEST_TIMEOUT = 3000; // 3 seconds

// ---------- helpers ----------
function checkImage(url) {
  return new Promise(resolve => {
    const req = https.get(url, res => {
      // picsum redirects valid images (302 is OK)
      resolve(res.statusCode === 200 || res.statusCode === 302);
      res.resume(); // consume stream
    });

    req.setTimeout(REQUEST_TIMEOUT, () => {
      req.destroy();
      resolve(false);
    });

    req.on('error', () => resolve(false));
  });
}

function extractSeedBase(url) {
  // https://picsum.photos/seed/<seed>-<number>/800/1200
  const match = url.match(/\/seed\/(.+)-(\d+)\//);
  if (!match) return null;

  return {
    base: match[1],
    startIndex: Number(match[2]),
  };
}

// ---------- main ----------
(async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      if (!Array.isArray(product.images) || product.images.length === 0) continue;

      const firstSeedImage = product.images.find(img =>
        img.includes('picsum.photos/seed/')
      );
      if (!firstSeedImage) continue;

      const seedInfo = extractSeedBase(firstSeedImage);
      if (!seedInfo) continue;

      let nextIndex = seedInfo.startIndex + 1;
      let added = 0;
      let attempts = 0;

      const existing = new Set(product.images);

      while (added < TARGET_NEW_IMAGES && attempts < MAX_ATTEMPTS) {
        const candidate = `https://picsum.photos/seed/${seedInfo.base}-${nextIndex}/${IMAGE_SIZE}`;

        if (!existing.has(candidate)) {
          const ok = await checkImage(candidate);
          if (ok) {
            product.images.push(candidate);
            existing.add(candidate);
            added++;
            console.log(`✔ ${product.slug} → added image ${nextIndex}`);
          }
        }

        nextIndex++;
        attempts++;
      }

      if (added > 0) {
        await product.save();
        updatedCount++;
        console.log(`🔁 Saved ${product.slug} (+${added})`);
      }
    }

    console.log(`✅ Done. Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Script error:', err);
    process.exit(1);
  }
})();
