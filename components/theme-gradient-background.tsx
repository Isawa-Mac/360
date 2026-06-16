"use client"

import { useEffect, useId, useState, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { generateWindBackgroundLines, type WindBackgroundLine } from "@/lib/wind-background-lines"

type ThemeGradientBackgroundProps = {
  className?: string
}

export function ThemeGradientBackground({ className }: ThemeGradientBackgroundProps) {
  const gradientId = useId().replace(/:/g, "")
  const [lines, setLines] = useState<WindBackgroundLine[]>([])

  useEffect(() => {
    const seed = Math.floor(Math.random() * 1_000_000_000)
    setLines(generateWindBackgroundLines(seed, 16 + Math.floor(Math.random() * 5)))
  }, [])

  return (
    <div aria-hidden className={cn("theme-gradient-bg absolute inset-0", className)}>
      <svg
        className="h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`wind-line-gradient-${gradientId}`} x1="0" y1="1" x2="0.75" y2="0">
            <stop offset="0%" stopColor="var(--gradient-from)" />
            <stop offset="45%" stopColor="var(--gradient-via)" />
            <stop offset="100%" stopColor="var(--gradient-to)" />
          </linearGradient>
        </defs>

        {lines.map((line) => (
          <g
            key={line.id}
            className="theme-gradient-bg__line-group"
            style={
              {
                "--wind-duration": `${line.duration}s`,
                "--wind-delay": `${line.delay}s`,
                "--wind-stroke-duration": `${line.strokeDuration}s`,
                "--wind-sway": line.sway,
                "--wind-opacity": line.opacity,
              } as CSSProperties
            }
          >
            <path
              d={line.d}
              className="theme-gradient-bg__line"
              style={{
                stroke: `url(#wind-line-gradient-${gradientId})`,
                strokeOpacity: line.opacity,
                strokeWidth: line.strokeWidth,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
