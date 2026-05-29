"use client"

import * as React from "react"
import { Locale, DEFAULT_LOCALE, localeLabels, t } from "@/lib/i18n"

interface LanguageContextValue {
  locale: Locale
  setLocale: (nextLocale: Locale) => void
  t: (key: string) => string
  localeLabel: string
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem("locale") as Locale | null
    if (saved === "th" || saved === "en") {
      setLocaleState(saved)
      document.documentElement.lang = saved
    }
  }, [])

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", nextLocale)
      document.documentElement.lang = nextLocale
    }
  }

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string) => t(locale, key),
      localeLabel: localeLabels[locale],
    }),
    [locale]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (!context) {
    // Fallback: return a safe no-op implementation to avoid runtime crashes
    // when components are rendered outside the provider (defensive fallback).
    // Prefer fixing provider placement; this is a safety net.
    console.warn("useLanguage used outside LanguageProvider — returning fallback implementation")
    return {
      locale: DEFAULT_LOCALE as Locale,
      setLocale: () => {},
      t: (key: string) => t(DEFAULT_LOCALE, key),
      localeLabel: localeLabels[DEFAULT_LOCALE],
    }
  }
  return context
}
