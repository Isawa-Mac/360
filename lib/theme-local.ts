export const THEME_LOCAL_STORAGE_KEY = "themeLocal";
export const SHARED_THEME_MODE_COOKIE = "nexus_shared_theme";
export const SHARED_THEME_COLOR_COOKIE = "nexus_shared_theme_color";

const DEFAULT_THEME_ACCENT = "oklch(0.55 0.18 253)";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getSharedCookieAttributes(): string {
  if (typeof window === "undefined") return "";
  const configured = process.env.NEXT_PUBLIC_SHARED_COOKIE_DOMAIN?.trim();
  const domain = configured || (window.location.hostname.endsWith(".trirex.cloud") ? ".trirex.cloud" : "");
  const domainAttribute = domain ? `; domain=${domain.startsWith(".") ? domain : `.${domain}`}` : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `${domainAttribute}; SameSite=Lax${secure}`;
}

export type SharedThemeMode = "light" | "dark" | "system";

export function getSharedThemeMode(): SharedThemeMode | null {
  const value = getCookie(SHARED_THEME_MODE_COOKIE);
  return value === "light" || value === "dark" || value === "system" ? value : null;
}

export function setSharedThemeMode(theme: SharedThemeMode): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SHARED_THEME_MODE_COOKIE}=${theme}; path=/; max-age=31536000${getSharedCookieAttributes()}`;
}

export function getSharedThemeColor(): string | null {
  return getCookie(SHARED_THEME_COLOR_COOKIE)?.trim() || null;
}

export function setSharedThemeColor(themeColor: string): void {
  if (typeof document === "undefined" || !themeColor.trim()) return;
  document.cookie = `${SHARED_THEME_COLOR_COOKIE}=${encodeURIComponent(themeColor.trim())}; path=/; max-age=31536000${getSharedCookieAttributes()}`;
}

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
  const sharedThemeColor = getSharedThemeColor();
  if (sharedThemeColor) return sharedThemeColor;
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
  rootStyle.setProperty(
    "--grid-color",
    `color-mix(in oklch, ${themeColor} 14%, transparent)`
  );
  rootStyle.setProperty("--header-tint", themeColor);
}
