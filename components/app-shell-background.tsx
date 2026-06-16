"use client"

import { ThemeGradientBackground } from "@/components/theme-gradient-background"

export function AppShellBackground() {
  return (
    <div aria-hidden className="app-shell-bg fixed inset-0 -z-10 bg-background">
      <ThemeGradientBackground />
    </div>
  )
}
