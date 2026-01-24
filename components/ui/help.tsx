"use client"

import { HelpCircle } from "lucide-react"
import { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

interface HelpProps {
  description: string | ReactNode
  className?: string
}

export function Help({ description, className = "" }: HelpProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`inline-flex ${className}`}>
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        align="start" 
        sideOffset={8} 
        className="p-0 border-none bg-transparent"
      >
        <div className="bg-card/98 backdrop-blur-2xl border border-border/80 rounded-xl shadow-xl p-3 text-[11px] leading-5 max-w-[480px] min-w-[260px] relative overflow-hidden">
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-xl"></div>
          {/* Content */}
          <div className="relative z-10 text-foreground max-h-[300px] overflow-y-auto pr-2">
            {typeof description === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              description
            )}
          </div>
          {/* Subtle border highlight */}
          <div className="absolute inset-0 rounded-xl border border-white/5 pointer-events-none"></div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}