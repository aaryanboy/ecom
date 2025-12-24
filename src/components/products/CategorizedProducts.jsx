"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function CategorizedProducts({ tag }) {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const imagee = "/logo.svg";

  useEffect(() => {
    if (tag) {
      fetch(`/api/products/tag/${tag}`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) =>
          console.error(`❌ Failed to fetch products for tag ${tag}:`, err)
        )
        .finally(() => setLoading(false));
    }
  }, [tag]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${theme.background} ${theme.text}`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme.spinnerBorder}`}></div>

      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="a">hello
        {products}
      </div>
    );
  }

  return (
    <div className={`w-full px-1 mt-6 sm:mt-8 ${theme.text}`}>
      <h2 className="text-3xl font-bold mb-6 capitalize">{tag}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
