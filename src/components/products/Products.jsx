"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import ProductCard from "@/components/products/ProductCard";

export default function ProductList() {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
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
        <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${theme.spinnerBorder}`}></div>
      </div>
    );
  }

  return (
    <div className={`w-full px-1 ${theme.text}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover}`}
        >
          ← Previous
        </button>

        {(() => {
          const candidates = [page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages);
          while (candidates.length < 3 && candidates[0] > 1) {
            candidates.unshift(candidates[0] - 1);
          }
          while (candidates.length < 3 && candidates[candidates.length - 1] < totalPages) {
            candidates.push(candidates[candidates.length - 1] + 1);
          }
          const uniq = Array.from(new Set(candidates));
          return uniq.map((p) => {
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
          });
        })()}

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
