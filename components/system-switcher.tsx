"use client"

import * as React from "react"
import { ChevronsUpDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { navItems } from "@/lib/navigation"
import { usePathname } from "next/navigation"

export function SystemSwitcher({ className }: { className?: string }) {
  const pathname = usePathname()

  // Find current system based on pathname
  // Since ERP 360 Online is /home, we check that first
  const currentSystem = navItems.find((item) => {
    if (item.url === "/home" && (pathname === "/home" || pathname === "/")) return true
    return pathname.startsWith(item.url) && item.url !== "/home"
  }) || navItems[0]

  const CurrentIcon = currentSystem.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent hover:bg-sidebar-accent transition-colors w-full text-left group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:bg-sidebar-primary group-data-[collapsible=icon]:text-sidebar-primary-foreground shadow-sm border border-border/50",
            className
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shrink-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:text-sidebar-primary-foreground group-data-[collapsible=icon]:size-auto group-data-[collapsible=icon]:h-full group-data-[collapsible=icon]:w-full">
            {CurrentIcon && <CurrentIcon className="h-3.5 w-3.5 group-data-[collapsible=icon]:text-sidebar-primary-foreground" />}
          </div>
          <div className="flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-bold text-xs text-foreground text-sidebar-foreground truncate tracking-tight">
              {currentSystem.title}
            </div>
            <div className="text-[10px] text-muted-foreground text-sidebar-foreground/70 truncate">
              Switch System
            </div>
          </div>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground text-sidebar-foreground/70 shrink-0 group-data-[collapsible=icon]:hidden" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-64 p-2" sideOffset={8}>
        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 px-2 py-1.5">
          Select System
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <div className="grid grid-cols-1 gap-1">
          {navItems.map((item) => {
            const isActive = currentSystem.title === item.title
            const Icon = item.icon
            return (
              <DropdownMenuItem
                key={item.title}
                asChild
                className={cn(
                  "flex items-center gap-3 px-2 py-2 cursor-pointer rounded-md transition-colors",
                  isActive ? "bg-accent text-primary" : "hover:bg-accent/50"
                )}
              >
                <a href={item.url}>
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border bg-background transition-colors",
                    isActive ? "border-primary/50 bg-primary/10" : "border-border"
                  )}>
                    {Icon && <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium leading-none truncate">
                      {item.title}
                    </span>
                  </div>
                  {isActive && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </a>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

