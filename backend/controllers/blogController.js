import asyncHandler from 'express-async-handler';
import Blog from '../models/Blog.js';

// GET /api/blogs
const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({}).sort({ createdAt: -1 });
  res.json(blogs);
});

// GET /api/blogs/:id
const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  res.json(blog);
});

// POST /api/blogs
const createBlog = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.title) {
    res.status(400);
    throw new Error('Title is required');
  }
  if (!data.slug) {
    data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  const blog = await Blog.create(data);
  res.status(201).json(blog);
});

// PUT /api/blogs/:id
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  Object.assign(blog, req.body, { updatedAt: Date.now() });
  await blog.save();
  res.json(blog);
});

// DELETE /api/blogs/:id
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error('Blog not found');
  }
  await blog.remove();
  res.json({ message: 'Blog removed' });
});

export { getBlogs, getBlog, createBlog, updateBlog, deleteBlog };
