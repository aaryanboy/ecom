'use client';

import { useTheme } from "./(theme)/ThemeContext";
import Products from "@/components/Products";
import HigestTaf from "@/components/HigestTaf";
import CategorySidebar from "@/components/CategorySidebar";
import CategorizedProducts from "@/components/CategorizedProducts";



export default function Home() {

  const { theme, toggleTheme, isDark } = useTheme();
const categories = JSON.parse(process.env.NEXT_PUBLIC_CATEGORIES);

  return (
    <div className={`${theme.background} ${theme.text}`}>
      <div className="w-full px-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1">
            <CategorySidebar />
          </aside>
          <section className="md:col-span-3 space-y-12">
            <Products />
            <HigestTaf />

            <section className="md:col-span-3 space-y-12">
                      {categories.map((category) => (
                        <CategorizedProducts key={category} tag={category} />
                      ))}
                      
                    </section>
          </section>
        </div>
      </div>
    </div>
  );
}
