---
name: theme-wind-gradient-background
description: Implements an SVG wind-curve app background with procedurally random curved lines and gentle CSS wind sway/flow animation. Follows themeColor CSS variables, sits beneath sidebar and header with glass overlays, and avoids WebGL or react-bits. Use when adding or updating app shell background, ThemeGradientBackground, AppShellBackground, wind lines from the bottom, or transparent sidebar/header over a global background.
---

# Theme Wind Gradient Background

Project reference implementation lives in:

- `components/theme-gradient-background.tsx`
- `components/app-shell-background.tsx`
- `lib/wind-background-lines.ts` (random bezier path generator)
- `app/globals.css` (`.theme-gradient-bg`, wind keyframes, glass rules)
- `app/layout.tsx` (`<AppShellBackground />` inside `SidebarProvider`)

For full templates and integration steps, read the shared skill:

`~/.agents/skills/theme-wind-gradient-background/SKILL.md`

Quick rules:

1. Mount background at shell root — not inside `SidebarInset`
2. SVG + CSS animation only — no react-bits, no WebGL
3. Wind lines are **random cubic-bezier paths** generated on mount (`generateWindBackgroundLines`)
4. Each line sways (`theme-wind-sway`) and flows along the stroke (`theme-wind-flow`)
5. Colors from `--sidebar-gradient-from/via/to` (from `themeColor`)
6. Sidebar + header use glass (`backdrop-filter`) so lines show underneath
7. Respect `prefers-reduced-motion: reduce` — disable animation
