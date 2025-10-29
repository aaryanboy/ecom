"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductList() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const imagee = "/logo.svg"

  useEffect(() => {
    fetch("/api/owner/post")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("❌ Failed to fetch products:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-16 text-red-500">No products found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">All Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="border rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
            onClick={() => router.push(`/product/${product._id}`)}
          >
            <img
              src={imagee}
              alt={product.title}
              className="w-full h-64 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              {product.price && (
                <p className="text-green-600 font-bold">💰 {product.price} NPR</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
