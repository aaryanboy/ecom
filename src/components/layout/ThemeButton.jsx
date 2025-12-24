"use client";

import React from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import Image from "next/image";

const ThemeButton = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md transition p-2"
      aria-label="Toggle theme"
    >
      <Image
        src={isDark ? "/moon-light.svg" : "/sun.svg"}
        alt={isDark ? "Dark Mode" : "Light Mode"}
        width={24}
        height={24}
      />
    </button>
  );
};

export default ThemeButton;
