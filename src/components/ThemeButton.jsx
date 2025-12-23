"use client";

import React from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import Image from "next/image";

const ThemeButton = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md transition"
      aria-label="Toggle theme"
    >
      <Image
        src={isDark ? "/moon-light.svg" : "/sun.svg"}
        alt={isDark ? "Dark Mode" : "Light Mode"}
        width={15}
        height={15}
      />
    </button>
  );
};

export default ThemeButton;
