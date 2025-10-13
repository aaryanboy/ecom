"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditPost() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetch(`/api/owner/post`)
      .then((res) => res.json())
      .then((data) => {
        const target = data.find((p) => p._id === id);
        setPost(target);
      });
  }, [id]);

  if (!post) return <p>Loading...</p>;

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
    const res = await fetch("/api/owner/post", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
    if (res.ok) {
      alert("Post updated!");
      router.push(`/owner/post/show/${id}`);
    } else {
      alert("Error updating post");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white">
      <h2>Edit Post</h2>
      <input
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
      />
      <textarea
        value={post.description}
        onChange={(e) => setPost({ ...post, description: e.target.value })}
      />
      <input
        type="number"
        value={post.amount}
        onChange={(e) => setPost({ ...post, amount: e.target.value })}
      />
      <input
        type="number"
        value={post.price}
        onChange={(e) => setPost({ ...post, price: e.target.value })}
      />
      <div>
        <input
          placeholder="Add Tag"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        <button type="button" onClick={addTag}>Add Tag</button>
      </div>
      <ul>
        {post.tags.map((t) => (
          <li key={t}>
            {t} <button type="button" onClick={() => removeTag(t)}>x</button>
          </li>
        ))}
      </ul>
      <button type="submit">Save</button>
    </form>
  );
}
