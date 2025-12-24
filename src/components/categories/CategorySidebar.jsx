"use client";
import { useMemo } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export default function CategorySidebar({ title = "Shop by Category", categories }) {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("q");

  const list = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) return categories;
    return Object.keys(CATEGORIES || {});
  }, [categories]);

  return (
    <div className={`rounded-lg p-4 border ${theme.card} ${theme.border}`}>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <ul className="space-y-2">
        {list.map((cat) => {
          const isActive = currentCategory === cat;
          return (
            <li key={cat}>
              <button
                onClick={() => router.push(`/search?q=${encodeURIComponent(cat)}`)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${isActive
                    ? "bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500 font-medium"
                    : `${theme.buttonHover} ${theme.text}`
                  }`}
              >
                {cat}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
