'use client';

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useRouter } from "next/navigation";

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

export default function ForYouPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const imagee = "/logo.svg";

  useEffect(() => {
    let mounted = true;
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recommendations?page=${page}&limit=${limit}`);
        const data = await res.json();
        if (mounted && data.ok) {
          setProducts(data.products || []);
          setTotal(data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRecommendations();
    return () => { mounted = false; };
  }, [page, limit]);

  const handleProductClick = (productId) => {
    trackClick(productId);
    router.push(`/product/${productId}`);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className={`max-w-6xl mx-auto p-6 ${theme.text}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">For You</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                className={`border rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer ${theme.card} ${theme.border}`}
                onClick={() => handleProductClick(product._id)}
              >
                <img src={imagee} alt={product.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1">{product.title}</h3>
                  <p className={`${theme.mutedText} text-sm mb-3 line-clamp-2`}>{product.description}</p>
                  {product.price && (
                    <p className={`text-base ${theme.success} font-semibold`}>💰 {product.price} NPR</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover}`}
            >
              ← Previous
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const p = idx + 1;
              const isCurrent = p === page;
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-3 py-2 rounded border ${theme.border} ${isCurrent ? 'font-bold underline' : ''}`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover}`}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <p className={`text-center ${theme.mutedText}`}>No recommendations for you yet. Keep browsing!</p>
      )}
    </div>
  );
}
