import React, { useEffect, useState } from "react";
import { getBlogs } from "../services/blogService";
import { useNavigate } from "react-router-dom";

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    }).format(d);
  } catch (e) {
    return "";
  }
};

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' or 'grid'
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getBlogs()
      .then((data) => {
        if (!mounted) return;
        setBlogs(data || []);
      })
      .catch((e) => console.error("Failed to load blogs", e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return <div className="w-full py-20 text-center">Loading blogs...</div>;

  return (
    <div className="px-4 py-8 mx-auto">
      <div className="flex items-center border-solid p-1 border-b-2 border-black justify-between mb-6">
        <div className="text-base text-black font-bdogrotesk">All Blogs</div>
        <div className="text-base font-bdogrotesk">
          <button
            onClick={() => setView("grid")}
            className={`px-1 py-1 ${
              view === "grid" ? "font-semibold" : "text-gray-500"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-1 py-1 ${
              view === "list" ? "font-semibold" : "text-gray-500"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-10">
          {blogs.map((b) => (
            <div key={b._id} className="relative flex flex-col lg:flex-row items-start gap-6 lg:pr-40">
              <div className="w-full lg:w-7/12 flex flex-col justify-between">
                <h2 className="text-4xl md:text-6xl font-bold leading-tight text-black">
                  {b.title}
                </h2>
                {b.subtitle && (
                  <div className="text-base text-gray-700">
                    {b.subtitle}
                  </div>
                )}
                <div className="mt-6 text-sm">
                  <span
                    onClick={() => navigate(`/blog/${b._id}`)}
                    className="cursor-pointer font-semibold text-black"
                  >
                    Read Now
                  </span>
                  <span className="ml-4 text-xs text-gray-500">5 min</span>
                </div>
              </div>
              <div className="w-full lg:w-2/12 flex justify-center">
                <div className="w-36 md:w-full h-48 md:h-64 bg-gray-100 overflow-hidden  self-stretch">
                  {b.images && b.images[0] ? (
                    <img
                      src={b.images[0]}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <div className="absolute right-0 top-0 hidden lg:block text-left text-sm text-gray-500 w-48">
                <div><span className="text-black font-medium">{fmtDate(b.createdAt)}</span> | {b.excerpt}</div>
                {/* <div className="mt-2 text-right">{b.author || "Admin"}</div> */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap -mx-3 font-bdogrotesk">
          {blogs.map((b) => (
            <div key={b._id} className="mb-6 w-full sm:w-1/2 lg:w-1/3">
              <div className="p-2">
                <div className="w-full h-[60vh] overflow-hidden ">
                  {b.images && b.images[0] && (
                    <img
                      src={b.images[0]}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="text-xl font-medium mt-3 text-black leading-tight">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <div className="text-sm text-gray-700 mt-1">{b.subtitle}</div>
                )}
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {" "}
                  <span className="text-black">
                    {fmtDate(b.createdAt)}
                  </span>: {b.excerpt}
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/blog/${b._id}`)}
                    style={{
                      border: "1px solid #000",
                      boxSizing: "border-box",
                      backgroundColor: "#fff",
                    }}
                    className="group mt-0 w-full text-black bg-white px-3 py-2 flex items-center justify-between text-[15px] font-semibold tracking-wide"
                  >
                    <div className="relative h-5 overflow-hidden flex-1">
                      <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                        <span className="flex h-5 text-base items-center">
                          Read More
                        </span>
                        <span className="flex h-5 text-base items-center">
                          Read More
                        </span>
                      </div>
                    </div>
                    <div className="relative h-5 overflow-hidden ml-4 flex-none">
                      <div className="relative flex flex-col transition-transform duration-300 ease-in-out group-hover:-translate-y-1/2">
                        <span className="flex h-5 items-center text-base text-black">
                          5 min
                        </span>
                        <span className="flex h-5 items-center text-base text-black">
                          5 min
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
