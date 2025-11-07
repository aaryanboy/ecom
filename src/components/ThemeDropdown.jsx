"use client";

import React, { useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import Image from "next/image";

const ThemeDropdown = () => {
  const { toggleTheme, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="relative inline-block">
      {/* Dropdown button */}
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md transition"
      >
        <Image
          src={isDark ? "/moon-light.svg" : "/sun.svg"}
          alt={isDark ? "Dark Mode" : "Light Mode"}
          width={15}
          height={10}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className={`absolute right-0 mt-1 w-25 h-15 rounded-md shadow-lg ${theme.background} flex flex-col gap-2 p-2`}
        >
          {/* Light Mode */}
          <div
            onClick={() => {
              if (isDark) toggleTheme();
              setOpen(false);
            }}
            className="cursor-pointer rounded flex items-center justify-center gap-2 pb-1"
          >
            <Image
              src={isDark ? "/sun-light.svg" : "/sun.svg"} // <-- dynamic
              alt="Light Mode"
              width={14}
              height={24}
            />
            <span className={`${theme.text} text-xs  `}>LigntMode</span>
          </div>

          {/* Dark Mode */}
          <div
            onClick={() => {
              if (!isDark) toggleTheme();
              setOpen(false);
            }}
            className=" cursor-pointer rounded flex items-center justify-center gap-2"
          >
            <Image
              src={isDark ? "/moon-light.svg" : "/moon.svg"} // <-- dynamic
              alt="Dark Mode"
              width={14}
              height={24}
            /> 
           <span className={`${theme.text} text-xs  `}>DarkMode</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
