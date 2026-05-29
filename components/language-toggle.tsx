"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {t("language")}
      </span>
      <div className="inline-flex rounded-full border border-border bg-background p-1 shadow-sm">
        <Button
          variant={locale === "th" ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-10 px-1 text-[11px] font-semibold"
          onClick={() => setLocale("th")}
        >
          TH
        </Button>
        <Button
          variant={locale === "en" ? "secondary" : "ghost"}
          size="icon"
          className="h-7 w-10 px-1 text-[11px] font-semibold"
          onClick={() => setLocale("en")}
        >
          EN
        </Button>
      </div>
    </div>
  )
}
