"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const router = useRouter();

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((tag) => tag !== t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/owner/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, amount, price, tags }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Post created!");
      router.push(`/owner/post/show/${data._id}`);
    } else {
      alert("Error: " + data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white">
      <h2>Create Post</h2>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
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
        {tags.map((t) => (
          <li key={t}>
            {t} <button type="button" onClick={() => removeTag(t)}>x</button>
          </li>
        ))}
      </ul>
      <button type="submit">Create</button>
    </form>
  );
}
