"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { CATEGORIES } from "@/lib/categories";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((tag) => tag !== t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imagePath = null;
    let imageUrl = null;

    // Upload image if provided
    if (imageFile) {
      try {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("fileName", imageFile.name);
        const res = await fetch("/api/media/upload", { method: "POST", body: fd });
        const uploaded = await res.json();
        if (!res.ok || !uploaded?.ok) {
          throw new Error(uploaded?.error || "Upload failed");
        }
        imagePath = uploaded.path;
        imageUrl = uploaded.url;
      } catch (err) {
        console.error("Upload error:", err);
        alert("❌ Failed to upload image. Please try again.");
        return;
      }
    }

    if (!category || !subCategory) {
      alert("Select category and sub-category");
      return;
    }

    const payload = { title, description, amount, price, tags, imagePath, imageUrl, category, subCategory };

    const res = await fetch("/api/owner/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Post created successfully!");
      router.push(`/owner/post/show/${data._id}`);
    } else {
      alert("❌ Error: " + data.error);
    }
  };

  return (
    <div
      className={`min-h-screen flex justify-center items-center ${theme.background} ${theme.text} transition-colors duration-300`}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-lg p-8 rounded-2xl shadow-lg border ${theme.card} ${theme.border}`}
      >
        <h2 className={`text-2xl font-semibold mb-6 text-center ${theme.text}`}>
          📝 Create New Post
        </h2>

        {/* Title */}
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={`w-full p-3 mb-4 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
        />

        {/* Description */}
        <textarea
          placeholder="Write description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          required
          className={`w-full p-3 mb-4 rounded-lg border focus:ring-2 outline-none resize-none ${theme.border} ${theme.background} ${theme.text}`}
        />

        {/* Amount and Price */}
        <div className="flex space-x-3 mb-4">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className={`w-1/2 p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className={`w-1/2 p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setSubCategory(""); }}
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
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            disabled={!category}
            className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          >
            <option value="">Select sub-category</option>
            {(CATEGORIES[category] || []).map((sc) => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          />
        </div>

        {/* Tags */}
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
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 mb-4">
            {tags.map((t) => (
              <li
                key={t}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${theme.border} border`}
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

        {/* Submit */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-medium transition ${theme.button} ${theme.buttonHover}`}
        >
          🚀 Create Post
        </button>
      </form>
    </div>
  );
}
