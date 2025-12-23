"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function ShowPosts() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(new Set());
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

      <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === posts.length}
              onChange={(e) => {
                const all = new Set(posts.map((p) => p._id));
                setSelected(e.target.checked ? all : new Set());
              }}
            />
            Select all
          </label>
          <span className="text-sm opacity-70">{selected.size} selected</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={selected.size === 0}
            onClick={async () => {
              const ids = Array.from(selected);
              const ok = confirm(`Delete ${ids.length} selected post(s)? This will also remove images.`);
              if (!ok) return;
              try {
                const res = await fetch('/api/owner/post/bulk-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
                const data = await res.json();
                if (res.ok && data.ok) {
                  setPosts((prev) => prev.filter((p) => !selected.has(p._id)));
                  setSelected(new Set());
                  alert(`🗑️ Deleted ${data.deletedCount} items`);
                } else {
                  alert('❌ Failed to delete selected');
                }
              } catch (err) {
                console.error('Bulk delete error:', err);
                alert('❌ Error deleting selected');
              }
            }}
            className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover}`}
          >
            Delete Selected
          </button>
          <button
            onClick={async () => {
              const ok = confirm('Delete ALL posts? This will also remove images.');
              if (!ok) return;
              try {
                const res = await fetch('/api/owner/post/bulk-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
                const data = await res.json();
                if (res.ok && data.ok) {
                  setPosts([]);
                  setSelected(new Set());
                  alert(`🗑️ Deleted ${data.deletedCount} items`);
                } else {
                  alert('❌ Failed to delete all');
                }
              } catch (err) {
                console.error('Bulk delete all error:', err);
                alert('❌ Error deleting all');
              }
            }}
            className={`px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700`}
          >
            Delete All
          </button>
        </div>
      </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
      <div className={`flex flex-col gap-0 rounded-xl border ${theme.border} ${theme.card}`}>
      
  <div className={`grid grid-cols-12 gap-4 px-6 py-3 font-semibold border-b ${theme.border}`}>
    <div className="col-span-4">Item Details</div>
    <div className="col-span-2 text-center">Amount</div>
    <div className="col-span-2 text-center">Price</div>
    <div className="col-span-2 text-center">Tags</div>
    <div className="col-span-2 text-center">Actions</div>
  </div>
  
  {posts.map((post) => (
    <div
      key={post._id}
      className={`grid grid-cols-12 gap-4 px-6 py-4 border-b cursor-pointer hover:shadow-md transition ${theme.card} ${theme.border}`}
      onClick={() => router.push(`/owner/post/show/${post._id}`)}
    >
      <div className="col-span-4">
        <label className="flex items-start gap-3" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected.has(post._id)}
            onChange={(e) => {
              setSelected((prev) => {
                const next = new Set(prev);
                if (e.target.checked) next.add(post._id); else next.delete(post._id);
                return next;
              });
            }}
          />
          <img
            src={post.imageUrl || "/logo.svg"}
            alt={post.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className={`mt-1 ${theme.secondaryText}`}>
              {post.description.length > 100
                ? post.description.slice(0, 100) + "..."
                : post.description}
            </p>
            <div className="mt-1 text-sm opacity-70 truncate">
              {post.category || "Uncategorized"}
              {post.subCategory ? ` • ${post.subCategory}` : ""}
            </div>
          </div>
        </label>
      </div>
      
      <div className="col-span-2 flex items-center justify-center">
        <span className="font-medium">{post.amount}</span>
      </div>
      
      <div className="col-span-2 flex items-center justify-center">
        <span className="font-medium">Rs. {post.price}</span>
      </div>
      
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
          onClick={async (e) => {
            e.stopPropagation();
            const ok = confirm('Delete this post? This will also remove images.');
            if (!ok) return;
            try {
              const res = await fetch(`/api/owner/post/${post._id}`, { method: 'DELETE' });
              const data = await res.json();
              if (res.ok && data.ok) {
                setPosts((prev) => prev.filter((p) => p._id !== post._id));
                alert('🗑️ Post deleted');
              } else {
                alert('❌ Failed to delete');
              }
            } catch (err) {
              console.error('Delete error:', err);
              alert('❌ Error deleting');
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
    </div>
  );
}
