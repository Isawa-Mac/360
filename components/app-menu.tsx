"use client"

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
      {/* ใช้ Logo หลักของ 360 เป็นจุดเข้าสู่หน้า Home */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-512.png?v=8"
        alt="360 Intelligent"
        className="h-7 w-7 object-contain group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"
      />
    </Link>
  )
}
