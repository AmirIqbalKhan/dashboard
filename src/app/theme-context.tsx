"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  brandColor: "#000000",
  setBrandColor: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [brandColor, setBrandColor] = useState("#000000");

  // Load from backend on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.theme) setTheme(data.theme);
        if (data.brandColor) setBrandColor(data.brandColor);
      });
  }, []);

  // Apply theme and brand color to document
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.setProperty("--brand-color", brandColor);
  }, [theme, brandColor]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, brandColor, setBrandColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 