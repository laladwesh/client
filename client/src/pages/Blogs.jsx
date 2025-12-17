import React, { useEffect, useState } from 'react';
import { getBlogs } from '../services/blogService';
import { useNavigate } from 'react-router-dom';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getBlogs()
      .then((data) => {
        if (!mounted) return;
        setBlogs(data || []);
      })
      .catch((e) => console.error('Failed to load blogs', e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="w-full py-20 text-center">Loading blogs...</div>;

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Our Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((b) => (
          <div key={b._id} className="border p-4 rounded">
            {b.images && b.images[0] && (
              <img src={b.images[0]} alt={b.title} className="w-full h-48 object-cover mb-3" />
            )}
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold leading-[1.1] text-black mb-2">
              {b.title}
            </h2>
            <p className="text-sm text-gray-600 mt-2">{b.excerpt}</p>
            <div className="mt-4">
              <button onClick={() => navigate(`/blog/${b._id}`)} className="text-sm font-semibold underline">Read more</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
