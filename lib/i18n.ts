export type Locale = "th" | "en"

export const DEFAULT_LOCALE: Locale = "th"

export const localeLabels: Record<Locale, string> = {
  th: "TH",
  en: "EN",
}

export const translations: Record<Locale, Record<string, string>> = {
  th: {
    theme: "ธีม",
    language: "ภาษา",
    english: "อังกฤษ",
    thai: "ไทย",
    home: "หน้าแรก",
    dashboard: "แดชบอร์ด",
    toggle_theme: "สลับธีม",
    profile: "โปรไฟล์",
    settings: "การตั้งค่า",
    logout: "ออกจากระบบ",
    search: "ค้นหา",
  },
  en: {
    theme: "Theme",
    language: "Language",
    english: "English",
    thai: "Thai",
    home: "Home",
    dashboard: "Dashboard",
    toggle_theme: "Toggle theme",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    search: "Search",
  },
}

export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[DEFAULT_LOCALE][key] ?? key
}
