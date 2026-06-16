---
name: theme-wind-gradient-background
description: Implements nexusSSO-style CSS grid app background with radial fade from top. Uses --grid-color and sits beneath sidebar/header with glass overlays. Use when adding or updating AppShellBackground or transparent sidebar/header over a global background.
---

# App Shell Grid Background (nexusSSO pattern)

Reference: `nexusSSO/components/Layout.tsx`

Project implementation:

- `components/app-shell-background.tsx`
- `app/globals.css` (`.app-shell-bg`, `.app-shell-bg__grid`, `--grid-color`, glass rules)
- `app/layout.tsx` (`<AppShellBackground />` in body)
- `lib/theme-local.ts` (`applyThemeAccentProperties` sets `--grid-color`)

Quick rules:

1. Mount `AppShellBackground` at shell root (body level)
2. CSS grid only — `linear-gradient` 40×40px, no SVG, no animation
3. Radial mask fade from top: `ellipse 100% 80% at 50% 0%`
4. `--grid-color` from theme accent (`color-mix(in oklch, themeColor 14%, transparent)`)
5. Dark mode: grid layer `opacity: 0.5`
6. Sidebar + header use glass (`backdrop-filter`) so grid shows underneath
