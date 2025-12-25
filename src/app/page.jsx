'use client';

import { Suspense } from 'react';
import { useTheme } from "./(theme)/ThemeContext";
import Products from "@/components/products/Products";
import HigestTaf from "@/components/products/HigestTaf";
import ForYouHome from "@/components/products/ForYouHome";

import CategorySidebar from "@/components/categories/CategorySidebar";
import CategorizedProducts from "@/components/products/CategorizedProducts";

export default function Home() {
  const { theme } = useTheme();
  // Safe parsing with fallback
  let categories = [];
  try {
    categories = JSON.parse(process.env.NEXT_PUBLIC_CATEGORIES || '[]');
  } catch (e) {
    console.error("Failed to parse categories", e);
  }

  return (
    <div className={`min-h-screen pb-12 ${theme.background} ${theme.text}`}>
      {/* Hero / Main Layout */}
      <div className="w-full px-2 sm:px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Sidebar - Hidden on mobile, sticky on desktop */}
          <aside className="hidden md:block md:col-span-1">
            <div className="sticky top-24">
              <Suspense fallback={<div className="animate-pulse h-48 bg-gray-200 rounded-lg" />}>
                <CategorySidebar />
              </Suspense>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3 space-y-12 min-w-0">
            {/* Hero Section or Banner could go here */}


            <section >
              <ForYouHome />
            </section>

            <div className={`w-full h-px bg-gradient-to-r from-transparent ${theme.bar} to-transparent my-8`} />

            <section>
              <Products />
            </section>

            <div className={`w-full h-px bg-gradient-to-r from-transparent ${theme.bar} to-transparent my-8`} />
            <div className={`w-full h-px bg-gradient-to-r from-transparent ${theme.bar} to-transparent my-8`} />

            <section>
              <HigestTaf limit={4} />
            </section>


            <div className={`w-full h-px bg-gradient-to-r from-transparent ${theme.bar} to-transparent my-8`} />
            <div className={`w-full h-px bg-gradient-to-r from-transparent ${theme.bar} to-transparent my-8`} />

            {categories.length > 0 && (
              <section className="space-y-12">
                {categories.map((category) => (
                  <CategorizedProducts key={category} tag={category} />
                ))}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
