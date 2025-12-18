import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CSV helper
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const products = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    const product = {};
    headers.forEach((header, idx) => {
      product[header] = values[idx] ? values[idx].trim() : '';
    });
    products.push(product);
  }
  
  return products;
}

// Helper to parse CSV line handling quotes
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

// Map CSV columns to schema
function mapProductData(csvRow) {
  const parseNumber = (val) => {
    if (!val || val === 'NO STOCK' || val === 'OUT OF STOCK') return 0;
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };
  
  const parsePrice = (val) => {
    if (!val || val.toLowerCase().includes('no discount')) return null;
    return parseNumber(val);
  };
  
  // Generate unique slug
  const slugParts = [
    csvRow['Product'],
    csvRow['Print'],
    csvRow['Color']
  ].filter(p => p && p.trim()).join('-');
  
  const slug = slugParts.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return {
    collection: csvRow['Collection'] || '',
    product: csvRow['Product'] || 'Unnamed Product',
    print: csvRow['Print'] || '',
    color: csvRow['Color'] || '',
    fabricType: csvRow['Fabric Type'] || '',
    fabricPattern: csvRow['Fabric Pattern'] || '',
    productType: csvRow['Product Type'] || '',
    length: csvRow['Length'] || '',
    lengthInInches: parseNumber(csvRow['Length in inches']),
    sleeves: csvRow['NA'] || '', // This column seems to be for sleeves based on data
    closure: csvRow['Closure'] || '',
    productDescription: csvRow['Product Description'] || '',
    fabricDescription: csvRow['Fabric Description'] || '',
    sizeAndFit: csvRow['Size & Fit'] || '',
    mrp: parseNumber(csvRow['MRP']),
    discountedPrice: parsePrice(csvRow['Discountd price (Max)']),
    totalQuantity: parseNumber(csvRow['Total quantity']),
    sizeSQuantity: parseNumber(csvRow['size s quantity']),
    sizeMQuantity: parseNumber(csvRow['size m quantity']),
    sizeLQuantity: parseNumber(csvRow['size L']),
    sizeXLQuantity: parseNumber(csvRow['SIZE XL']),
    slug: slug,
    images: [], // Add image URLs manually or via separate import
  };
}

const run = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    const csvPath = path.join(__dirname, '../products.csv');
    console.log('Reading CSV from:', csvPath);
    
    const csvData = parseCSV(csvPath);
    console.log(`Found ${csvData.length} products in CSV`);
    
    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');
    
    let imported = 0;
    let skipped = 0;
    
    for (const row of csvData) {
      try {
        const productData = mapProductData(row);
        
        // Skip if MRP is 0 or product name is empty
        if (!productData.mrp || !productData.product) {
          skipped++;
          continue;
        }
        
        // Check if product with same slug exists
        const existing = await Product.findOne({ slug: productData.slug });
        if (existing) {
          console.log(`Skipping duplicate: ${productData.slug}`);
          skipped++;
          continue;
        }
        
        await Product.create(productData);
        console.log(`✓ Imported: ${productData.product} - ${productData.print} - ${productData.color}`);
        imported++;
      } catch (err) {
        console.error(`Error importing product: ${row['Product']}`, err.message);
        skipped++;
      }
    }
    
    console.log(`\n✅ Import complete: ${imported} products imported, ${skipped} skipped`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
