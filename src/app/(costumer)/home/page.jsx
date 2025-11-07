'use client';

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import CategorizedProducts from "@/components/CategorizedProducts";
import ProductList from "@/components/Products";
import ForYouPreview from "@/components/ForYouPreview";

export default function Home() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.text}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const categories = ["mounts", "hoodies", "shirts", "still-water", "cables"];

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} p-6`}>
      <h1 className="text-3xl font-bold mb-8 text-center">Welcome to MyShop</h1>

      <div className="space-y-12">
        {/* All Products section */}
        <ProductList />

        {/* For You preview section */}
        <ForYouPreview />

        {/* Category sections */}
        {categories.map((category) => (
          <CategorizedProducts key={category} tag={category} />
        ))}
      </div>
    </div>
  );
}
