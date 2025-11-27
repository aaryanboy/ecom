'use client';

import { useTheme } from "./(theme)/ThemeContext";
import Products from "@/components/Products";
import HigestTaf from "@/components/HigestTaf";
import SearchBar from "@/components/SearchBar";


export default function Home() {

  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <div className={`text-cyan-50`}>
      <div className="max-w-7xl mx-auto px-4">
        <SearchBar />
      </div>
      <Products />
      <HigestTaf />
    </div>
  );
}
