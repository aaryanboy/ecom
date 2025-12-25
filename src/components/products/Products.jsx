"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import ProductGrid from "@/components/products/ProductGrid";
import Pagination from "@/components/ui/Pagination";
import Spinner from "@/components/ui/Spinner";

export default function ProductList() {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/list?page=${page}&limit=${limit}`);
        const data = await res.json();
        const posts = Array.isArray(data) ? data : data.posts;
        const totalCount = Array.isArray(data) ? data.length : data.total;

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

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (loading) {
    return (
      <div className={`min-h-[200px] flex items-center justify-center ${theme.background}`}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`w-full px-1 ${theme.text}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
      </div>

      <ProductGrid products={products} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
