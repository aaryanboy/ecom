'use client';

import { useTheme } from "./(theme)/ThemeContext";
import Products from "@/components/Products";


export default function Home() {

  const { theme, toggleTheme, isDark } = useTheme();
  return (
  <div className={`text-cyan-50`}>  
<Products/>  
  </div>
  
  );
}

