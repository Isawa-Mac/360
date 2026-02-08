"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { syncThemeToCookie } = useAuth()

  const handleToggle = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    const themeColor = typeof localStorage !== "undefined" ? localStorage.getItem("themeColor") : undefined
    syncThemeToCookie(next, themeColor ?? undefined)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="h-8 w-8 px-0"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}