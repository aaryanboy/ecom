"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import ShowPosts from "@/components/ShowPosts";

export default function StartPage() {
  const router = useRouter();
  const [postId, setPostId] = useState("");
  const { theme } = useTheme(); // Access current theme (light or dark)

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${theme.background} ${theme.text}`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-md border ${theme.card} ${theme.border}`}
      >
        <h2 className={`text-2xl font-semibold mb-6 text-center ${theme.text}`}>
          📄 Post Actions
        </h2>

        {/* Create Post Button */}
        <button
          onClick={() => router.push("/owner/post/create")}
          className={`w-full py-2 rounded-lg font-medium mb-4 transition ${theme.button} ${theme.buttonHover}`}
        >
          ➕ Create New Post
        </button>

        {/* Input Field */}
        <div className="space-y-3 mt-4">
          <input
            type="text"
            placeholder="Enter Post ID"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            className={`w-full p-2 rounded-lg border outline-none focus:ring-2 transition ${theme.border} ${theme.background} ${theme.text}`}
          />

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/owner/post/edit/${postId}`)}
              disabled={!postId}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                postId
                  ? `${theme.button} ${theme.buttonHover}`
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              ✏️ Edit Post
            </button>

            <button
              onClick={() => router.push(`/owner/post/show/${postId}`)}
              disabled={!postId}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                postId
                  ? `${theme.button} ${theme.buttonHover}`
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              👁️ Show Post
            </button>
          </div>
        </div>
      </div>

      <ShowPosts/>
    </div>
  );
}
