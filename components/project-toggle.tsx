"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectToggleProps {
  projectName1: string
  projectName2: string
  url1: string
  url2: string
  activeColor?: string
  activeSegment?: "first" | "second"
  className?: string
}

export function ProjectToggle({
  projectName1,
  projectName2,
  url1,
  url2,
  activeColor = "blue",
  activeSegment = "first",
  className
}: ProjectToggleProps) {
  const isActive = activeSegment === "first"

  const handleToggle = () => {
    const targetUrl = isActive ? url2 : url1
    window.location.href = targetUrl
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "relative h-8 px-3 text-xs font-medium transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "transition-colors",
            isActive ? `text-${activeColor}-600` : "text-muted-foreground"
          )}
        >
          {projectName1}
        </span>
        <span className="text-muted-foreground">/</span>
        <span
          className={cn(
            "transition-colors",
            !isActive ? `text-${activeColor}-600` : "text-muted-foreground"
          )}
        >
          {projectName2}
        </span>
      </div>
    </Button>
  )
}