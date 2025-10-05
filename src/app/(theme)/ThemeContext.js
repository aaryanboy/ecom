"use client"

// App/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { lightTheme, darkTheme } from "./theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Optional: load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setIsDark(true);
  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newMode = !prev;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
