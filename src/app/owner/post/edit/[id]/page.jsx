"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { CATEGORIES } from "@/lib/categories";

export default function EditPost() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error("Error fetching post:", err));
  }, [id]);

  if (!post) return <p className="text-center mt-10">Loading...</p>;

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!post.tags.includes(tagInput.trim()))
      setPost({ ...post, tags: [...post.tags, tagInput.trim()] });
    setTagInput("");
  };

  const removeTag = (t) =>
    setPost({ ...post, tags: post.tags.filter((tag) => tag !== t) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: post._id,
      title: post.title,
      description: post.description,
      amount: Number(post.amount ?? 0),
      price: Number(post.price ?? 0),
      tags: Array.isArray(post.tags) ? post.tags : [],
      imagePath: post.imagePath,
      imageUrl: post.imageUrl,
      category: post.category || "",
      subCategory: post.subCategory || "",
    };

    // If a new image is provided, upload and update fields
    if (imageFile) {
      try {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("fileName", imageFile.name);
        const res = await fetch("/api/owner/media/upload", { method: "POST", body: fd });
        const uploaded = await res.json();
        if (!res.ok || !uploaded?.ok) {
          throw new Error(uploaded?.error || "Upload failed");
        }
        payload.imagePath = uploaded.path;
        payload.imageUrl = uploaded.url;
      } catch (err) {
        console.error("Upload error:", err);
        alert("❌ Failed to upload image. Please try again.");
        return;
      }
    }
    const res = await fetch("/api/owner/post", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const respData = await res.json();

    if (res.ok) {
      alert("✅ Post updated successfully!");
      router.push(`/owner/post/show/${id}`);
    } else {
      alert("❌ Error updating post");
    }
  };

  return (
    <div
      className={`min-h-screen flex justify-center items-center transition-colors duration-300 ${theme.background} ${theme.text}`}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-lg p-8 rounded-2xl shadow-lg border ${theme.card} ${theme.border}`}
      >
        <h2 className={`text-2xl font-semibold mb-6 text-center ${theme.text}`}>
          ✏️ Edit Post
        </h2>

        {/* Title */}
        <input
          type="text"
          placeholder="Post Title"
          value={post.title}
          onChange={(e) => setPost({ ...post, title: e.target.value })}
          required
          className={`w-full p-3 mb-4 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
        />

        {/* Description */}
        <textarea
          placeholder="Write description..."
          value={post.description}
          onChange={(e) => setPost({ ...post, description: e.target.value })}
          rows="4"
          required
          className={`w-full p-3 mb-4 rounded-lg border focus:ring-2 outline-none resize-none ${theme.border} ${theme.background} ${theme.text}`}
        />

        {/* Amount and Price */}
        <div className="flex space-x-3 mb-4">
          <input
            type="number"
            placeholder="Amount"
            value={post.amount}
            onChange={(e) => setPost({ ...post, amount: e.target.value })}
            required
            className={`w-1/2 p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          />
          <input
            type="number"
            placeholder="Price"
            value={post.price}
            onChange={(e) => setPost({ ...post, price: e.target.value })}
            required
            className={`w-1/2 p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Category</label>
          <select
            value={post.category || ""}
            onChange={(e) => setPost({ ...post, category: e.target.value, subCategory: "" })}
            className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          >
            <option value="">Select category</option>
            {Object.keys(CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sub-category */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Sub-category</label>
          <select
            value={post.subCategory || ""}
            onChange={(e) => setPost({ ...post, subCategory: e.target.value })}
            disabled={!post.category}
            className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          >
            <option value="">Select sub-category</option>
            {(CATEGORIES[post.category] || []).map((sc) => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        </div>

        {/* Tag Input */}
        <div className="mb-3 flex space-x-2">
          <input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className={`flex-1 p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          />
          <button
            type="button"
            onClick={addTag}
            className={`px-4 rounded-lg font-medium transition ${theme.button} ${theme.buttonHover}`}
          >
            Add
          </button>
        </div>

        {/* Tag List */}
        {post.tags?.length > 0 && (
          <ul className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((t) => (
              <li
                key={t}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border ${theme.border}`}
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Current Image (if any) */}
        {post.imageUrl && (
          <div className="mb-4">
            <label className="block mb-2 font-medium">Current Image</label>
            <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover rounded-lg border" />
          </div>
        )}

        {/* Replace Image */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Replace Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-medium transition ${theme.button} ${theme.buttonHover}`}
        >
          💾 Save Changes
        </button>
      </form>
    </div>
  );
}
