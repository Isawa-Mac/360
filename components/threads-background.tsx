"use client"

import { cn } from "@/lib/utils"

type ThreadsBackgroundProps = {
  className?: string
}

export function ThreadsBackground({ className }: ThreadsBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn("theme-threads-bg absolute inset-0", className)}
    />
  )
}
