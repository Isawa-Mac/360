"use client"

import { useEffect, useState } from "react"
import { readThemeThreadColors } from "@/lib/css-color"

type Rgb = [number, number, number]

export function useThemeThreadColors() {
  const [colors, setColors] = useState<{ dark: Rgb; light: Rgb }>(() => readThemeThreadColors())

  useEffect(() => {
    const sync = () => setColors(readThemeThreadColors())

    sync()
    window.addEventListener("storage", sync)

    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    })

    return () => {
      window.removeEventListener("storage", sync)
      observer.disconnect()
    }
  }, [])

  return colors
}
