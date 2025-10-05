'use client';

import { useTheme } from "./(theme)/ThemeContext";


export default function Home() {

  const { theme, toggleTheme, isDark } = useTheme();
  return (
  <div className={`text-cyan-50`}>  
Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt dicta, sit magni voluptatem molestias enim cum saepe id neque odit. Ut placeat, repellendus laudantium tempora rerum saepe obcaecati quae minus!
  
  </div>
  
  );
}

