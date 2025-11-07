'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

async function trackClick(productId) {
  try {
    await fetch("/api/track-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });
  } catch (error) {
    console.error("Error tracking click:", error);
  }
}

export default function CategorizedProducts({ tag }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const imagee = "/logo.svg";

  useEffect(() => {
    if (tag) {
      fetch(`/api/products/tag/${tag}`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) =>
          console.error(`❌ Failed to fetch products for tag ${tag}:`, err)
        )
        .finally(() => setLoading(false));
    }
  }, [tag]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${theme.background} ${theme.text}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't render anything if there are no products for the tag
  }

  const handleProductClick = (productId) => {
    trackClick(productId);
    router.push(`/product/${productId}`);
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${theme.text}`}>
      <h2 className="text-2xl font-bold mb-4 capitalize">{tag}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className={`border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer ${theme.card} ${theme.border}`}
            onClick={() => handleProductClick(product._id)}
          >
            <img
              src={product.image || imagee}
              alt={product.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
              <p className={`${theme.mutedText} text-sm mb-3 line-clamp-2`}>
                {product.description}
              </p>
              {product.price && (
                <p className={`${theme.success} font-bold`}>
                  💰 {product.price} NPR
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
