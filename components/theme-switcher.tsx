"use client";

import { ThemeSwitcher as KiboThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const { syncThemeToCookie } = useAuth();

  const handleChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === "dark" || newTheme === "light") {
      const themeColor = typeof localStorage !== "undefined" ? localStorage.getItem("themeColor") : undefined;
      syncThemeToCookie(newTheme, themeColor ?? undefined);
    }
  };

  return (
    <div className="scale-75 origin-right">
      <KiboThemeSwitcher
        defaultValue="system"
        value={theme as "light" | "dark" | "system"}
        onChange={handleChange}
      />
    </div>
  );
}
