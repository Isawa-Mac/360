---
name: theme-wind-gradient-background
description: Implements a static SVG wind-curve app background that follows themeColor CSS variables, sits beneath sidebar and header with glass overlays, and avoids WebGL or react-bits. Use when adding or updating app shell background, ThemeGradientBackground, AppShellBackground, wind lines from the bottom, or transparent sidebar/header over a global background.
---

# Theme Wind Gradient Background

Project reference implementation lives in:

- `components/theme-gradient-background.tsx`
- `components/app-shell-background.tsx`
- `app/globals.css` (`.theme-gradient-bg`, `.app-shell-bg`, glass rules)
- `app/layout.tsx` (`<AppShellBackground />` inside `SidebarProvider`)

For full templates and integration steps, read the shared skill:

`~/.agents/skills/theme-wind-gradient-background/SKILL.md`

Quick rules:

1. Mount background at shell root — not inside `SidebarInset`
2. Static SVG only — no react-bits, no WebGL, no animation
3. Colors from `--sidebar-gradient-from/via/to` (from `themeColor`)
4. Sidebar + header use glass (`backdrop-filter`) so lines show underneath
