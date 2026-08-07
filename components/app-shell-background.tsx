import { ThemeGradientBackground } from "@/components/theme-gradient-background"

export function AppShellBackground() {
  return (
    <div aria-hidden className="app-shell-bg bg-background">
      <ThemeGradientBackground />
    </div>
  )
}
