export const THEME_LOCAL_STORAGE_KEY = "themeLocal";

const DEFAULT_THEME_ACCENT = "oklch(0.55 0.18 253)";

export function parseThemeLocalColor(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) return trimmed;

  try {
    const parsed = JSON.parse(trimmed) as { themeColor?: unknown };
    if (typeof parsed.themeColor === "string" && parsed.themeColor.trim()) {
      return parsed.themeColor.trim();
    }
  } catch {
    return null;
  }

  return null;
}
export function getThemeLocalColor(): string | null {
  if (typeof window === "undefined") return null;
  return parseThemeLocalColor(localStorage.getItem(THEME_LOCAL_STORAGE_KEY));
}

export function resolveThemeAccentColor(...fallbacks: Array<string | null | undefined>): string {
  const fromThemeLocal = getThemeLocalColor();
  if (fromThemeLocal) return fromThemeLocal;

  for (const fallback of fallbacks) {
    if (fallback?.trim()) return fallback.trim();
  }

  if (typeof window !== "undefined") {
    const legacyThemeColor = localStorage.getItem("themeColor")?.trim();
    if (legacyThemeColor) return legacyThemeColor;
  }

  return DEFAULT_THEME_ACCENT;
}

export function applyThemeAccentProperties(themeColor: string): void {
  if (typeof document === "undefined") return;

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--primary", themeColor);
  rootStyle.setProperty("--sidebar-primary", themeColor);
  rootStyle.setProperty(
    "--sidebar-gradient-from",
    `color-mix(in oklch, ${themeColor} 78%, black)`
  );
  rootStyle.setProperty("--sidebar-gradient-via", themeColor);
  rootStyle.setProperty(
    "--sidebar-gradient-to",
    `color-mix(in oklch, ${themeColor} 72%, white)`
  );
  rootStyle.setProperty("--ring", themeColor);
}
