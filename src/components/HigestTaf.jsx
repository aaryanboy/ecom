"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function HigestTaf({ limit = 5 }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [topTag, setTopTag] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const imagee = "/logo.svg";

  useEffect(() => {
    let mounted = true;
    const pageLimit = 50;
    const load = async () => {
      setLoading(true);
      try {
        const firstRes = await fetch(`/api/posts?page=1&limit=${pageLimit}`);
        const firstData = await firstRes.json();
        const firstPosts = Array.isArray(firstData) ? firstData : (firstData.posts || []);
        const total = Array.isArray(firstData) ? firstPosts.length : (firstData.total || firstPosts.length);
        const totalPages = Math.max(1, Math.ceil(total / pageLimit));
        let all = [...firstPosts];
        for (let p = 2; p <= totalPages; p++) {
          const res = await fetch(`/api/posts?page=${p}&limit=${pageLimit}`);
          const data = await res.json();
          const posts = Array.isArray(data) ? data : (data.posts || []);
          all = all.concat(posts);
        }
        const counts = new Map();
        for (const post of all) {
          const tgs = Array.isArray(post.tags) ? post.tags : [];
          for (const t of tgs) {
            if (!t) continue;
            counts.set(t, (counts.get(t) || 0) + 1);
          }
        }
        let top = null;
        let max = 0;
        counts.forEach((cnt, tag) => { if (cnt > max) { max = cnt; top = tag; } });
        if (!top) {
          if (mounted) { setTopTag(null); setItems([]); }
          return;
        }
        const tagRes = await fetch(`/api/products/tag/${encodeURIComponent(top)}`);
        const tagItems = await tagRes.json();
        const list = Array.isArray(tagItems) ? tagItems : [];
        if (mounted) { setTopTag(top); setItems(list); }
      } catch (_) {
        if (mounted) { setTopTag(null); setItems([]); }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [limit]);

  useEffect(() => {
    setPage(1);
  }, [topTag]);

  if (loading) {
    return (
      <div className={`mt-12 flex items-center gap-2 ${theme.text}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <span className={theme.mutedText}>Loading…</span>
      </div>
    );
  }

  if (!topTag || items.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const start = (page - 1) * limit;
  const currentItems = items.slice(start, start + limit);
  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className={`max-w-7xl mx-auto px-4 mt-12 ${theme.text}`}>
      <h2 className="text-2xl font-bold mb-4">Popular in #{topTag}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {currentItems.map((product) => (
          <div
            key={product._id}
            className={`border rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer ${theme.card} ${theme.border}`}
            onClick={() => router.push(`/product/${product._id}`)}
          >
            <div className="relative w-full pb-[100%] bg-white">
              <img
                src={product.imageUrl || imagee}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
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

