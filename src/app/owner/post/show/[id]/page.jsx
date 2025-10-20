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

  return (
    <div
      className={`min-h-screen flex justify-center items-center p-6 ${theme.background} ${theme.text}`}
    >
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
