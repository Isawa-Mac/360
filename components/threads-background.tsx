"use client"

import Threads from "@/components/Threads"
import { useThemeThreadColors } from "@/hooks/use-theme-thread-colors"
import { cn } from "@/lib/utils"

type ThreadsBackgroundProps = {
  className?: string
}

export function ThreadsBackground({ className }: ThreadsBackgroundProps) {
  const { dark, light } = useThemeThreadColors()

  return (
    <Threads
      colorDark={dark}
      colorLight={light}
      amplitude={2.9}
      distance={1.1}
      speed={0.01}
      enableMouseInteraction={false}
      className={cn("absolute inset-0 opacity-60", className)}
    />
  )
}
