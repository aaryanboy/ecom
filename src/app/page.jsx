'use client';

import { useTheme } from "./(theme)/ThemeContext";
import Products from "@/components/products/Products";
import HigestTaf from "@/components/products/HigestTaf";
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
              <CategorySidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3 space-y-12 min-w-0">
            {/* Hero Section or Banner could go here */}

            <section>
              <HigestTaf limit={4} />
            </section>

            <section>
              <Products />
            </section>

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
