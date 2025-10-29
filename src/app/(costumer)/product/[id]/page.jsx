"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addToCart } from "@/lib/addToCart"; // 👈 import from lib

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const imagee = "/logo.svg";

  useEffect(() => {
    fetch("/api/owner/post")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((item) => item._id === id);
        setProduct(found);
      })
      .catch((err) => console.error("❌ Failed to fetch product:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product._id, router);
    setAdding(false);
  };

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (!product) return <div className="text-center py-16 text-red-500">Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-md">
          <img
            src={imagee}
            alt={product.title}
            className="w-full h-[400px] object-cover"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{product.title}</h1>
          <p className="text-gray-600 mb-5">{product.description}</p>

          {product.price && (
            <p className="text-2xl font-semibold text-green-600 mb-6">
              💰 {product.price} NPR
            </p>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "🛒 Add to Cart"}
            </button>
            <button
              onClick={() => alert("Proceeding to checkout...")}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              💰 Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
