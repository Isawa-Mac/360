"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { applyThemeAccentProperties, getSharedThemeMode, resolveThemeAccentColor, setSharedThemeColor } from "@/lib/theme-local";

function syncThemeAccentFromLocalStorage(): void {
  const themeColor = resolveThemeAccentColor();
  applyThemeAccentProperties(themeColor);
  setSharedThemeColor(themeColor);
}

export function ThemeSync() {
  const { resolvedTheme, theme, setTheme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") return;
    syncThemeAccentFromLocalStorage();
  }, [resolvedTheme, theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleThemeLocalChange = () => {
      const sharedTheme = getSharedThemeMode();
      if (sharedTheme && sharedTheme !== theme) setTheme(sharedTheme);
      syncThemeAccentFromLocalStorage();
    };

    window.addEventListener("storage", handleThemeLocalChange);
    window.addEventListener("focus", handleThemeLocalChange);

    return () => {
      window.removeEventListener("storage", handleThemeLocalChange);
      window.removeEventListener("focus", handleThemeLocalChange);
    };
  }, [setTheme, theme]);

  return null;
}
