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
    }
  }, [])

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", nextLocale)
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
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
