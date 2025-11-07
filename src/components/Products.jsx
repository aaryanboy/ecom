"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function ProductList() {
  const router = useRouter();
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const imagee = "/logo.svg";

  useEffect(() => {
    let mounted = true;
    const fetchPage = async () => {
      setLoading(true);
      try {
        console.log("[Home] Fetching All Products", { page, limit });
        const res = await fetch(`/api/posts?page=${page}&limit=${limit}`);
        const data = await res.json();
        // API returns shape { posts, total, page, limit } when paginated
        const posts = Array.isArray(data) ? data : data.posts;
        const totalCount = Array.isArray(data) ? data.length : data.total;

        console.log("[Home] Fetched All Products response", {
          shape: Array.isArray(data) ? "array" : "paginated",
          page,
          limit,
          count: posts?.length ?? 0,
          total: totalCount ?? 0,
          items: (posts || []).map(p => ({
            id: p._id,
            title: p.title,
            imageUrl: p.imageUrl
          })),
        });

        if (mounted) {
          setProducts(posts || []);
          setTotal(totalCount || 0);
        }
      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPage();
    return () => { mounted = false; };
  }, [page, limit]);

  // Log what’s actually being rendered whenever products change
  useEffect(() => {
    console.log("[Home] Rendering All Products", {
      page,
      limit,
      count: products.length,
      items: products.map(p => ({
        id: p._id,
        title: p.title,
        imageUrl: p.imageUrl
      })),
    });
  }, [products, page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  if (loading) {
    return (
      <div className={`min-h-[200px] flex items-center justify-center ${theme.background} ${theme.text}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 ${theme.text}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product._id}
            className={`border rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer ${theme.card} ${theme.border}`}
            onClick={() => router.push(`/product/${product._id}`)}
          >
            <img
              src={product.imageUrl || imagee}
              alt={product.title}
              className="w-full h-48 object-cover"
            />
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
    </div>
  );
}
