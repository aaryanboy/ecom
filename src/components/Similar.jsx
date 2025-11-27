"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function Similar({ productId, subCategory = "", tags = [], limit = 4 }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const imagee = "/logo.svg";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const t = Array.isArray(tags) ? tags.filter(Boolean) : [];

        const chosen = new Map();

        // 1) Prefer subCategory matches
        if (subCategory) {
          try {
            const res = await fetch(`/api/products/subcategory/${encodeURIComponent(subCategory)}`);
            const subs = await res.json();
            (Array.isArray(subs) ? subs : []).forEach((p) => {
              if (!p || !p._id) return;
              if (p._id === productId) return;
              if (!chosen.has(p._id)) chosen.set(p._id, p);
            });
          } catch (_) {}
        }

        // 2) If not enough, fill with tag matches
        if (chosen.size < limit && t.length) {
          const responses = await Promise.all(
            t.map((tag) =>
              fetch(`/api/products/tag/${encodeURIComponent(tag)}`).then((r) => r.json())
            )
          );
          responses.flat().forEach((p) => {
            if (!p || !p._id) return;
            if (p._id === productId) return;
            if (!chosen.has(p._id)) chosen.set(p._id, p);
          });
        }

        const list = Array.from(chosen.values()).slice(0, limit);
        if (mounted) setItems(list);
      } catch (_) {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [productId, subCategory, JSON.stringify(tags), limit]);

  if (!subCategory && (!Array.isArray(tags) || tags.length === 0)) return null;

  return (
    <div className={`mt-10 ${theme.text}`}>
      <h2 className="text-2xl font-bold mb-4">Similar Products</h2>

      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          <span className={theme.mutedText}>Loading…</span>
        </div>
      ) : items.length === 0 ? (
        <p className={theme.mutedText}>No similar products found.</p>
      ) : (
        <div
          className="
            grid 
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            gap-4 
            w-full
          "
        >
          {items.map((product) => (
            <div
              key={product._id}
              className={`border rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer ${theme.card} ${theme.border}`}
              onClick={() => router.push(`/product/${product._id}`)}
            >
              {/* Full Image — Not Cropped */}
              <div className="relative w-full h-48 sm:h-56 md:h-60 p-2 flex items-center justify-center bg-white">
                <img
                  src={product.imageUrl || imagee}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold mb-2 line-clamp-1">
                  {product.title}
                </h3>
                {product.price && (
                  <p className={`text-sm ${theme.success} font-semibold`}>
                    💰 {product.price} NPR
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
