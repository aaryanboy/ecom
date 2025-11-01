"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function ShowPost() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch("/api/owner/post")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p) => p._id === id);
        setPost(found);
      })
      .catch((err) => console.error("Error fetching post:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.text}`}
      >
        <p className="text-lg animate-pulse">Loading post...</p>
      </div>
    );

  if (!post)
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${theme.background} ${theme.text}`}
      >
        <p className="text-lg mb-4">❌ Post not found</p>
        <button
          onClick={() => router.back()}
          className={`px-4 py-2 rounded-lg transition ${theme.button} ${theme.buttonHover}`}
        >
          🔙 Go Back
        </button>
      </div>
    );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/owner/post?id=${post._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/owner/post');
      } else {
        const error = await response.json();
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex justify-center items-center p-6 ${theme.background} ${theme.text}`}
    >
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full ${theme.card}`}>
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete "{post.title}"? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${theme.button} ${theme.buttonHover}`}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg font-medium transition bg-red-500 hover:bg-red-600 text-white"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`max-w-2xl w-full p-8 rounded-2xl shadow-lg border ${theme.card} ${theme.border}`}
      >
        <h2 className="text-3xl font-bold mb-4">{post.title}</h2>
        <p className={`mb-4 ${theme.secondaryText}`}>{post.description}</p>

        <div className="text-sm mb-6 space-y-1">
          <p>
            <span className="font-medium">Amount:</span> {post.amount}
          </p>
          <p>
            <span className="font-medium">Price:</span> Rs. {post.price}
          </p>
        </div>

        {post.tags?.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className={`px-3 py-1 rounded-full text-sm border ${theme.border}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => router.push(`/owner/post/edit/${post._id}`)}
            className={`flex-1 py-2 rounded-lg font-medium transition ${theme.button} ${theme.buttonHover}`}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 py-2 rounded-lg font-medium transition bg-red-500 hover:bg-red-600 text-white"
          >
            🗑️ Delete
          </button>
          <button
            onClick={() => router.push(`/owner/post`)}
            className={`flex-1 py-2 rounded-lg font-medium transition ${theme.button} ${theme.buttonHover}`}
          >
            🔙 Back
          </button>
        </div>
      </div>
    </div>
  );
}
