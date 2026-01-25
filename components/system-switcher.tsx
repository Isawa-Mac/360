"use client"

import * as React from "react"
import { Check, Grip } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { navItems, filterNavItemsByPermission } from "@/lib/navigation"
import { usePathname } from "next/navigation"
import { usePermission } from "@/hooks/use-permission"
import { useMemo } from "react"

export function SystemSwitcher({ className }: { className?: string }) {
  const pathname = usePathname()
  const { hasPermission } = usePermission()

  // Filter menu items based on user permissions
  const filteredNavItems = useMemo(() => {
    return filterNavItemsByPermission(navItems, hasPermission)
  }, [hasPermission])

  // Find current system based on pathname
  // Since ERP 360 Online is /home, we check that first
  const currentSystem = filteredNavItems.find((item) => {
    if (item.url === "/home" && (pathname === "/home" || pathname === "/")) return true
    return pathname.startsWith(item.url) && item.url !== "/home"
  }) || navItems[0] // Fallback to raw navItems[0] if filtered is empty or not found? Or filteredNavItems[0]? 
  // If user has NO permissions, filteredNavItems might be empty. 
  // But usually they have access to at least Home? 
  // ERP 360 Online has no requiredPermission in navItems, so it is always visible.

  const displayItems = filteredNavItems

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8",
            className
          )}
        >
          <Grip className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-64 p-2" sideOffset={8}>
        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 px-2 py-1.5">
          Select System
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <div className="grid grid-cols-1 gap-1">
          {displayItems.map((item) => {
            const isActive = currentSystem?.title === item.title
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

