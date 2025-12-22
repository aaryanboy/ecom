'use client';

import { useTheme } from "./(theme)/ThemeContext";
import Products from "@/components/Products";
import HigestTaf from "@/components/HigestTaf";


export default function Home() {

  const { theme, toggleTheme, isDark } = useTheme();
  return (
    <div className={`text-cyan-50`}>
     
      <Products />
      <HigestTaf />
    </div>
  );
}
