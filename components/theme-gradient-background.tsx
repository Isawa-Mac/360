"use client"

import { useLayoutEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { generateChessboardBackground } from "@/lib/wind-background-lines"

type ThemeGradientBackgroundProps = {
  className?: string
}

export function ThemeGradientBackground({ className }: ThemeGradientBackgroundProps) {
  const [pattern, setPattern] = useState(() => generateChessboardBackground(42))

  useLayoutEffect(() => {
    setPattern(generateChessboardBackground(Math.floor(Math.random() * 1_000_000_000)))
  }, [])

  return (
    <div aria-hidden className={cn("theme-gradient-bg absolute inset-0", className)}>
      <svg
        className="h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        {pattern.cells.map((cell) => (
          <rect
            key={cell.id}
            x={cell.x}
            y={cell.y}
            width={cell.width}
            height={cell.height}
            className={cn(
              "theme-gradient-bg__cell",
              cell.variant === "dark" ? "theme-gradient-bg__cell--dark" : "theme-gradient-bg__cell--light"
            )}
          />
        ))}
      </svg>
    </div>
  )
}
