"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function BulkImageReplacePage() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/owner/post")
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : (data.posts || [])))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const allChecked = selected.size > 0 && selected.size === posts.length;

  return (
    <div className={`min-h-screen p-6 ${theme.background} ${theme.text}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-semibold mb-6">Bulk Replace Images</h1>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allChecked}
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button
              disabled={selected.size === 0 || !file || uploading}
              onClick={async () => {
                if (selected.size === 0 || !file) return;
                setUploading(true);
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  fd.append("fileName", file.name || "image.jpg");
                  const upRes = await fetch("/api/owner/media/upload", { method: "POST", body: fd });
                  const upData = await upRes.json();
                  if (!upRes.ok || !upData.ok) {
                    alert("Failed to upload image");
                    setUploading(false);
                    return;
                  }
                  const ids = Array.from(selected);
                  const updRes = await fetch("/api/owner/post/bulk-update-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids, imageUrl: upData.url, imagePath: upData.path }),
                  });
                  const updData = await updRes.json();
                  if (updRes.ok && updData.ok) {
                    setPosts((prev) => prev.map((p) => selected.has(p._id) ? { ...p, imageUrl: upData.url, imagePath: upData.path } : p));
                    setSelected(new Set());
                    setFile(null);
                    alert(`Replaced image for ${ids.length} posts`);
                  } else {
                    alert("Failed to update posts");
                  }
                } catch (err) {
                  console.error("Bulk replace error:", err);
                  alert("Error replacing images");
                } finally {
                  setUploading(false);
                }
              }}
              className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover}`}
            >
              {uploading ? "Replacing..." : "Replace Image for Selected"}
            </button>
          </div>
        </div>

        <div className={`rounded-xl border ${theme.border} ${theme.card}`}>
          <div className={`grid grid-cols-12 gap-4 px-6 py-3 font-semibold border-b ${theme.border}`}>
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-center">Amount</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-3 text-center">Category</div>
          </div>
          {posts.map((post) => (
            <div
              key={post._id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 border-b ${theme.border}`}
            >
              <div className="col-span-5">
                <label className="flex items-start gap-3">
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
                    <div className="font-semibold truncate">{post.title}</div>
                    <div className={`text-sm ${theme.secondaryText} truncate`}>{post.description}</div>
                  </div>
                </label>
              </div>
              <div className="col-span-2 flex items-center justify-center">{post.amount}</div>
              <div className="col-span-2 flex items-center justify-center">Rs. {post.price}</div>
              <div className="col-span-3 flex items-center justify-center text-sm opacity-80">
                {(post.category || "Uncategorized") + (post.subCategory ? ` • ${post.subCategory}` : "")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

