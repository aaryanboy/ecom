'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/app/(theme)/ThemeContext';
import ProductCard from '@/components/products/ProductCard';
import CategorySidebar from '@/components/categories/CategorySidebar';

export default function SearchPage() {
  const { theme } = useTheme();
  const params = useSearchParams();
  const q = params.get('q') || '';
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => { setPage(1); }, [q]);

  useEffect(() => {
    const run = async () => {
      const usp = new URLSearchParams();
      if (q) usp.set('q', q);
      usp.set('page', String(page));
      usp.set('limit', String(limit));
      const res = await fetch(`/api/products/search?${usp.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    };
    run();
  }, [q, page, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={`w-full px-2 ${theme.text}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <CategorySidebar />
        </aside>
        <section className="md:col-span-3">
          <h1 className="text-2xl font-bold mb-4">Search results for: {q}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        </section>
      </div>
    </div>
  );
}
