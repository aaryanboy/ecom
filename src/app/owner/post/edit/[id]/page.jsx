"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { uploadProductImage, deleteProductImage } from "@/lib/supabase";

export default function EditPost() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    fetch(`/api/owner/post`)
      .then((res) => res.json())
      .then((data) => {
        const target = data.find((p) => p._id === id);
        setPost(target);
        
        // Set current image if exists
        if (target?.image && target.image.url) {
          setCurrentImage(target.image);
          setImagePreview(target.image.url);
        }
      })
      .catch((err) => console.error("Error fetching post:", err));
  }, [id]);
  
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
    
    try {
      setUploading(true);
      
      // Handle image upload
      let imageData = currentImage;
      
      // If a new image is selected, upload it and delete the old one
      if (imageFile) {
        // Delete old image if exists
        if (currentImage && currentImage.path) {
          await deleteProductImage(currentImage.path);
        }
        
        // Upload new image
        imageData = await uploadProductImage(imageFile);
      }
      
      const updatedPost = {
        ...post,
        image: imageData
      };
      
      const res = await fetch("/api/owner/post", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (res.ok) {
        alert("✅ Post updated successfully!");
        router.push(`/owner/post/show/${id}`);
      } else {
        alert("❌ Error updating post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("❌ Error updating post");
    } finally {
      setUploading(false);
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
