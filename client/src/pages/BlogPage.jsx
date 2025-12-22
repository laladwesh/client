import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlog } from '../services/blogService';

const BlogPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getBlog(blogId)
      .then((data) => {
        if (!mounted) return;
        setBlog(data || null);
      })
      .catch((e) => {
        console.error('Failed to load blog', e);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [blogId]);

  if (loading) return <div className="w-full py-20 text-center">Loading...</div>;
  if (!blog) return <div className="w-full py-20 text-center">Blog not found</div>;

  return (
    <div className="px-4 py-12 max-w-5xl mx-auto">
      {blog.images && blog.images[0] && (
        <img src={blog.images[0]} alt={blog.title} className="w-full h-80 object-cover mb-6 rounded" />
      )}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-4">{blog.title}</h1>
        {blog.subtitle && <h2 className="text-xl md:text-2xl text-gray-700 mb-4">{blog.subtitle}</h2>}
      <div className="text-sm text-gray-600 mb-4">By {blog.author || 'Admin'} • {new Date(blog.createdAt).toLocaleDateString()}</div>
      <div className="prose max-w-none text-lg" style={{ whiteSpace: 'pre-line' }}>{blog.content}</div>
      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-6">
          {blog.tags.map((t) => (
            <span key={t} className="inline-block mr-2 mb-2 px-3 py-1 text-sm border rounded">{t}</span>
          ))}
        </div>
      )}

      <div className="mt-8">
        <button onClick={() => navigate('/blogs')} className="text-sm underline">Back to blogs</button>
      </div>
    </div>
  );
};

export default BlogPage;
