"use client";

import { useTheme } from "@/app/(theme)/ThemeContext";

export default function dashboard() {

  const { theme } = useTheme();

  return (
    <div className={`flex items-center justify-center h-screen ${theme.background}`}>
      <h1 className="text-3xl font-bold text-gray-800">Hello World, Owner!</h1>
    </div>
  );
}
