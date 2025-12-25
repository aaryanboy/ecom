"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import ProductGrid from "@/components/products/ProductGrid";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";

export default function HigestTaf({ limit = 4 }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [topTag, setTopTag] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    const pageLimit = 50;
    const load = async () => {
      setLoading(true);
      try {
        // Fetch all products to find top tag
        const firstRes = await fetch(`/api/products/list?page=1&limit=${pageLimit}`);
        const firstData = await firstRes.json();
        const firstPosts = Array.isArray(firstData) ? firstData : (firstData.posts || []);
        const total = Array.isArray(firstData) ? firstPosts.length : (firstData.total || firstPosts.length);
        const totalPages = Math.max(1, Math.ceil(total / pageLimit));
        let all = [...firstPosts];

        for (let p = 2; p <= totalPages; p++) {
          const res = await fetch(`/api/products/list?page=${p}&limit=${pageLimit}`);
          const data = await res.json();
          const posts = Array.isArray(data) ? data : (data.posts || []);
          all = all.concat(posts);
        }

        // Count tags
        const counts = new Map();
        for (const post of all) {
          const tgs = Array.isArray(post.tags) ? post.tags : [];
          for (const t of tgs) {
            if (!t) continue;
            counts.set(t, (counts.get(t) || 0) + 1);
          }
        }

        // Find top tag
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
      <div className={`mt-12 ${theme.text}`}>
        <Spinner text="Loading…" />
      </div>
    );
  }

  if (!topTag || items.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const start = (page - 1) * limit;
  const currentItems = items.slice(start, start + limit);

  return (
    <div className={`w-full px-1 mt-8 ${theme.text}`}>
      <h2 className="text-2xl font-bold mb-4">Popular in #{topTag}</h2>
      <ProductGrid products={currentItems} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
