import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  excerpt: { type: String },
  content: { type: String },
  images: [{ type: String }],
  author: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

export default mongoose.model('Blog', BlogSchema);
