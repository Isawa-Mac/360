"use client"

import { useEffect, useState } from "react"

function createWindLines() {
  return Array.from({ length: 18 }, (_, index) => {
    const startX = -180 + index * 92 + Math.random() * 70
    const bend = 260 + Math.random() * 220
    const lift = 180 + Math.random() * 170
    return `M ${startX} 980 C ${startX + bend} 900, ${startX + bend - 80} 720, ${startX + bend + 40} 570 S ${startX + bend + lift} 250, ${startX + bend + lift + 180} -80`
  })
}

export function ThemeGradientBackground() {
  const [windLines, setWindLines] = useState<string[]>([])

  useEffect(() => {
    setWindLines(createWindLines())
  }, [])

  return (
    <div className="theme-gradient-bg" aria-hidden>
      <div className="theme-gradient-bg__glow theme-gradient-bg__glow--indigo" />
      <div className="theme-gradient-bg__glow theme-gradient-bg__glow--cyan" />
      <div className="theme-gradient-bg__glow theme-gradient-bg__glow--gold" />
      <svg
        className="theme-gradient-bg__svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-color-wind" x1="0" y1="1" x2="0.9" y2="0">
            <stop offset="0%" stopColor="#1728b8" />
            <stop offset="38%" stopColor="#6a39e8" />
            <stop offset="70%" stopColor="#12cfe5" />
            <stop offset="100%" stopColor="#f5c842" />
          </linearGradient>
        </defs>
        {windLines.map((path, index) => (
          <path
            key={index}
            d={path}
            className="theme-gradient-bg__line"
            style={{
              strokeOpacity: 0.08 + (index % 5) * 0.018,
              strokeWidth: 1.2 + (index % 3) * 0.45,
            }}
          />
        ))}
      </svg>
      <div className="theme-gradient-bg__stars" />
    </div>
  )
}
