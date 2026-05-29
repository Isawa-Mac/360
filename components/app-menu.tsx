"use client"

import { LayoutGrid } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

export function AppMenu({ className }: { className?: string }) {
  const { t } = useLanguage()

  return (
    <Link
      href="/home"
      className={cn(
        "flex items-center justify-start shrink-0 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors",
        "h-10 w-10 pl-2",
        "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0",
        className
      )}
      aria-label={t("go_to_360")}
      title={t("go_to_360")}
    >
      <LayoutGrid className="h-5 w-5 text-foreground group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
    </Link>
  )
}
