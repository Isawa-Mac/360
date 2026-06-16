"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { applyThemeAccentProperties, resolveThemeAccentColor } from "@/lib/theme-local";

function syncThemeAccentFromLocalStorage(): void {
  const themeColor = resolveThemeAccentColor();
  applyThemeAccentProperties(themeColor);
}

export function ThemeSync() {
  const { resolvedTheme, theme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;
    syncThemeAccentFromLocalStorage();
  }, [resolvedTheme, theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleThemeLocalChange = () => {
      syncThemeAccentFromLocalStorage();
    };

    window.addEventListener("storage", handleThemeLocalChange);
    window.addEventListener("focus", handleThemeLocalChange);

    return () => {
      window.removeEventListener("storage", handleThemeLocalChange);
      window.removeEventListener("focus", handleThemeLocalChange);
    };
  }, []);

  return null;
}
