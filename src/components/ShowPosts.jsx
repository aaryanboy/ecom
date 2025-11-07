"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function ShowPosts() {
  const [posts, setPosts] = useState([]);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/owner/post")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  if (posts.length === 0)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.text}`}
      >
        <p className="text-lg animate-pulse">Loading posts...</p>
      </div>
    );

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${theme.background} ${theme.text}`}
    >
      <h2 className="text-3xl font-semibold text-center mb-8">
        🗂️ All Posts
      </h2>

      <div className="flex flex-col gap-0">
  {/* Header row */}
  <div className={`grid grid-cols-12 gap-4 px-6 py-3 font-semibold border-b ${theme.border} ${theme.card}`}>
    <div className="col-span-4">Item Details</div>
    <div className="col-span-2 text-center">Amount</div>
    <div className="col-span-2 text-center">Price</div>
    <div className="col-span-2 text-center">Tags</div>
    <div className="col-span-2 text-center">Actions</div>
  </div>
  
  {/* Posts rows */}
  {posts.map((post) => (
    <div
      key={post._id}
      className={`grid grid-cols-12 gap-4 px-6 py-4 border-b cursor-pointer hover:shadow-md transition ${theme.card} ${theme.border}`}
      onClick={() => router.push(`/owner/post/show/${post._id}`)}
    >
      {/* Item Details Column */}
      <div className="col-span-4">
        <h3 className="text-lg font-semibold">{post.title}</h3>
        <p className={`mt-1 ${theme.secondaryText}`}>
          {post.description.length > 100
            ? post.description.slice(0, 100) + "..."
            : post.description}
        </p>
      </div>
      
      {/* Amount Column */}
      <div className="col-span-2 flex items-center justify-center">
        <span className="font-medium">{post.amount}</span>
      </div>
      
      {/* Price Column */}
      <div className="col-span-2 flex items-center justify-center">
        <span className="font-medium">Rs. {post.price}</span>
      </div>
      
      {/* Tags Column */}
      <div className="col-span-2 flex items-center justify-center">
        {post.tags?.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {post.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className={`px-2 py-1 rounded-full text-xs border ${theme.border}`}
              >
                {t}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className={`px-2 py-1 rounded-full text-xs border ${theme.border}`}>
                +{post.tags.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className={`text-sm ${theme.secondaryText}`}>No tags</span>
        )}
      </div>
      
      {/* Actions Column */}
      <div className="col-span-2 flex items-center justify-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/owner/post/edit/${post._id}`);
          }}
          className={`px-3 py-2 rounded-lg font-medium transition ${theme.button} ${theme.buttonHover}`}
        >
          ✏️ Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/owner/post/show/${post._id}`);
          }}
          className={`px-3 py-2 rounded-lg font-medium transition ${theme.button} ${theme.buttonHover}`}
        >
          👁️ View
        </button>
        <button
          onClick={async (e) => {
            e.stopPropagation();
            const confirmed = confirm("Are you sure you want to delete this post? This will also remove its image.");
            if (!confirmed) return;
            try {
              const res = await fetch(`/api/owner/post?id=${post._id}`, { method: "DELETE" });
              const data = await res.json();
              if (res.ok && data.ok) {
                alert("🗑️ Post deleted successfully");
                // Optimistically remove from list
                setPosts((prev) => prev.filter((p) => p._id !== post._id));
              } else {
                alert("❌ Failed to delete post");
              }
            } catch (err) {
              console.error("Error deleting post:", err);
              alert("❌ Error deleting post");
            }
          }}
          className={`px-3 py-2 rounded-lg font-medium transition bg-red-600 text-white hover:bg-red-700`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  ))}
</div>
   
    </div>
  );
}
