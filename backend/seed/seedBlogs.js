import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import Blog from '../models/Blog.js';

const sampleBlogs = [
  {
    title: "We make everyday clothes for people who like dressing up everyday. We free culture of the shackles of nostalgia, and let it take its place in today's everyday – in your everyday.",
    slug: 'style-summer-outfits',
    excerpt: 'Easy tips to keep your summer wardrobe fresh and cool.',
    content: 'Full blog content about styling summer outfits...',
    images: ['https://picsum.photos/seed/blog1/800/600'],
    author: 'Admin',
    tags: ['style', 'summer'],
  },
  {
    title: "Sustainable fashion isn't a choice anymore, it's a necessity. We believe in creating timeless pieces that respect both people and planet, one thread at a time.",
    slug: 'sustainable-fabrics-101',
    excerpt: 'An introduction to sustainable and eco-friendly fabrics.',
    content: 'Full blog content about sustainable fabrics...',
    images: ['https://picsum.photos/seed/blog2/800/600'],
    author: 'Admin',
    tags: ['sustainability', 'fabric'],
  },
  {
    title: "Care Guide: Handwashing delicates and small-batch garments — step-by-step methods to prolong life and preserve shape without losing softness.",
    slug: 'care-guide-handwashing-delicates',
    excerpt: 'Step-by-step care instructions for delicate garments.',
    content: 'Full blog content about handwashing delicates...',
    images: ['https://picsum.photos/seed/blog3/800/600'],
    author: 'Admin',
    tags: ['care', 'laundry'],
  },
  {
    title: "Behind the scenes: our design process from moodboard to finished garment — how material choices, sampling and small-batch production shape each collection.",
    slug: 'behind-the-scenes-design-process',
    excerpt: 'A peek into how our designs come to life.',
    content: 'Full blog content about design process...',
    images: ['https://picsum.photos/seed/blog4/800/600'],
    author: 'Admin',
    tags: ['design', 'process'],
  }
];

const run = async () => {
  try {
    await connectDB();
    for (const b of sampleBlogs) {
      const existing = await Blog.findOne({ slug: b.slug });
      if (existing) {
        console.log('Skipping existing:', b.slug);
        continue;
      }
      await Blog.create(b);
      console.log('Inserted blog:', b.slug);
    }
    console.log('Blog seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
};

run();
