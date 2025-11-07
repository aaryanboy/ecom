"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

async function trackClick(productId) {
  try {
    await fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
  } catch (err) {
    console.error("Error tracking click:", err);
  }
}

export default function ForYouPreview() {
  const { theme } = useTheme();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMore, setOpenMore] = useState(false);
  const imagee = "/logo.svg";

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      console.log("[Home] Fetching For You preview");
      const res = await fetch("/api/recommendations");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.products)) {
          const preview = data.products.slice(0, 8);
          console.log("[Home] Fetched For You recommendations", {
            count: preview.length,
            items: preview.map(p => ({
              id: p._id,
              title: p.title,
              imageUrl: p.imageUrl
            })),
          });
          setProducts(preview);
          return;
        }
      }
      // Fallback: fetch public posts and sample 8 for unauthenticated
      const allRes = await fetch("/api/posts?page=1&limit=8");
      const all = await allRes.json();
      const preview = (Array.isArray(all) ? all : all.posts || []).slice(0, 8);
      console.log("[Home] Fallback For You from all posts", {
        count: preview.length,
        items: preview.map(p => ({
          id: p._id,
          title: p.title,
          imageUrl: p.imageUrl
        })),
      });
      setProducts(preview);
    } catch (err) {
      console.error("Error fetching For You preview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Log what’s actually being rendered whenever preview products change
  useEffect(() => {
    console.log("[Home] Rendering For You preview", {
      count: products.length,
      items: products.map(p => ({
        id: p._id,
        title: p.title,
        imageUrl: p.imageUrl
      })),
    });
  }, [products]);

  const handleProductClick = (productId) => {
    trackClick(productId);
    router.push(`/product/${productId}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">For You</h2>
        <div className="relative">
          <button
            onClick={() => setOpenMore((o) => !o)}
            className={`px-3 py-1 rounded ${theme.button} ${theme.buttonHover}`}
          >
            More
          </button>
          {openMore && (
            <div
              className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg z-10 ${theme.card} ${theme.border}`}
            >
              <button
                onClick={() => {
                  setOpenMore(false);
                  router.push("/for-you");
                }}
                className={`block w-full text-left px-4 py-2 hover:underline ${theme.text}`}
              >
                See full page
              </button>
              <button
                onClick={() => {
                  setOpenMore(false);
                  fetchRecommendations();
                }}
                className={`block w-full text-left px-4 py-2 hover:underline ${theme.text}`}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className={`border rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer ${theme.card} ${theme.border}`}
              onClick={() => handleProductClick(product._id)}
            >
              <img
                src={product.imageUrl || imagee}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <h3 className="text-base font-semibold mb-1 line-clamp-1">{product.title}</h3>
                <p className={`${theme.mutedText} text-xs mb-2 line-clamp-2`}>{product.description}</p>
                {product.price && (
                  <p className={`text-sm ${theme.success} font-semibold`}>💰 {product.price} NPR</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-center ${theme.mutedText}`}>No recommendations yet. Keep browsing!</p>
      )}
    </div>
  );
}