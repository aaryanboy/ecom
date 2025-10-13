"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartPage() {
  const router = useRouter();
  const [postId, setPostId] = useState("");

  return (
    <div className="bg-white">
      <h2>Post Actions</h2>

      <button onClick={() => router.push("/owner/post/create")}>Create Post</button>

      <div>
        <input
          type="text"
          placeholder="Enter Post ID"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
        />
        <button onClick={() => router.push(`/owner/post/edit/${postId}`)}>Edit Post</button>
        <button onClick={() => router.push(`/owner/post/show/${postId}`)}>Show Post</button>
      </div>
    </div>
  );
}
