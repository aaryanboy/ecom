"use client";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import SearchBar from "@/components/search/SearchBar";
import ProductCard from "@/components/products/ProductCard";

export default function SearchResults() {
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({ q: "", category: "", subCategory: "" });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchResults = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.subCategory) params.set("subCategory", filters.subCategory);
    params.set("page", String(page));
    params.set("limit", String(limit));
    const res = await fetch(`/api/products/search?${params.toString()}`);
    const data = await res.json();
    setItems(data.items || []);
    setTotal(data.total || 0);
  }, [filters.q, filters.category, filters.subCategory, page, limit]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const onFiltersChange = useCallback((f) => {
    setFilters(f);
    setPage(1);
  }, []);

  return (
    <div className={`max-w-7xl mx-auto px-4 ${theme.text}`}>
      <SearchBar onFiltersChange={onFiltersChange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage(p)}
              className={`px-3 py-2 rounded border ${theme.border} ${isCurrent ? 'font-bold underline' : ''}`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
