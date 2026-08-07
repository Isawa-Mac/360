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
        "flex shrink-0 items-center justify-center p-0 transition-opacity hover:opacity-80",
        "h-10 w-10",
        "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10",
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
        className="h-10 w-10 object-contain"
      />
    </Link>
  )
}
