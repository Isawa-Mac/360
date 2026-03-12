"use client"

import { LayoutGrid } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function AppMenu({ className }: { className?: string }) {
  return (
    <Link
      href="/home"
      className={cn(
        "flex items-center justify-center shrink-0 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors",
        "h-10 w-10",
        "group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9",
        className
      )}
      aria-label="ไปยัง Nexus 360"
      title="ไปยัง Nexus 360"
    >
      <LayoutGrid className="h-5 w-5 text-foreground group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
    </Link>
  )
}
