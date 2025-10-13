"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ShowPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch("/api/owner/post")
      .then((res) => res.json())
      .then((data) => setPost(data.find((p) => p._id === id)));
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return (
    <div className="bg-white"> 
      <h2>{post.title}</h2>
      <p>{post.description}</p>
      <p>Amount: {post.amount}</p>
      <p>Price: {post.price}</p>
      <h4>Tags:</h4>
      <ul>
        {post.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
