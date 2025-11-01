"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { uploadProductImage } from "@/lib/supabase";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((tag) => tag !== t));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !amount || !price) {
      alert("Please fill all the fields");
      return;
    }

    try {
      setUploading(true);
      
      // Upload image to Supabase if available
      let imageData = null;
      if (imageFile) {
        imageData = await uploadProductImage(imageFile);
      }

      const res = await fetch("/api/owner/post", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          amount,
          price,
          tags,
          image: imageData,
        }),
      });

      if (res.ok) {
        router.push("/owner/post");
      } else {
        throw new Error("Failed to create a post");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
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
        
        {/* Image Upload */}
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${theme.border} ${theme.background} ${theme.text}`}
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-40 object-contain border rounded-lg"
              />
            </div>
          )}
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
