"use client";

import { ThemeSwitcher as KiboThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="scale-75 origin-right">
      <KiboThemeSwitcher
        defaultValue="system"
        value={theme as "light" | "dark" | "system"}
        onChange={(newTheme) => setTheme(newTheme)}
      />
    </div>
  );
}
