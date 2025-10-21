"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    fetch("/api/owner/post")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("❌ Failed to fetch products:", err));
  }, []);

  return (
    <div
      className={`min-h-screen p-6 flex flex-col items-center transition-colors duration-300 ${theme.background} ${theme.text}`}
    >
      <h2 className={`text-3xl font-semibold mb-8 text-center ${theme.text}`}>
        🛍️ Our Products
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {products.map((item) => (
            <div
              key={item._id}
              className={`p-5 rounded-2xl shadow-md border transition-transform transform hover:scale-105 cursor-pointer ${theme.card} ${theme.border}`}
              onClick={() => router.push(`/customer/product/${item._id}`)}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm opacity-80 mb-3 line-clamp-2">
                {item.detail}
              </p>
              {item.price && (
                <p className="font-medium">
                  💰 <span className="text-green-600">{item.price} NPR</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
