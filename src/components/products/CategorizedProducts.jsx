"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import ProductGrid from "@/components/products/ProductGrid";
import Spinner from "@/components/ui/Spinner";

export default function CategorizedProducts({ tag }) {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tag) {
      fetch(`/api/products/tag/${tag}`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.error(`❌ Failed to fetch products for tag ${tag}:`, err))
        .finally(() => setLoading(false));
    }
  }, [tag]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${theme.background}`}>
        <Spinner />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <>
      <div className={`w-full px-1 mt-6 sm:mt-8 ${theme.text}`}>
        <h2 className="text-3xl font-bold mb-6 capitalize">{tag}</h2>
        <ProductGrid products={products} />
      </div>
      <div className={`w-full h-px bg-gradient-to-r from-transparent ${theme.bar} to-transparent my-8`} />
    </>
  );
}
