"use client"

import * as React from "react"
import {
  Check,
  Globe,
  BarChart3,
  ShoppingCart,
  Key,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/use-permission"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

// Custom 3x3 Grid Icon
const Grid3x3Icon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <rect x="1" y="1" width="3" height="3" fill="currentColor" />
    <rect x="6.5" y="1" width="3" height="3" fill="currentColor" />
    <rect x="12" y="1" width="3" height="3" fill="currentColor" />
    <rect x="1" y="6.5" width="3" height="3" fill="currentColor" />
    <rect x="6.5" y="6.5" width="3" height="3" fill="currentColor" />
    <rect x="12" y="6.5" width="3" height="3" fill="currentColor" />
    <rect x="1" y="12" width="3" height="3" fill="currentColor" />
    <rect x="6.5" y="12" width="3" height="3" fill="currentColor" />
    <rect x="12" y="12" width="3" height="3" fill="currentColor" />
  </svg>
)

const SYSTEMS = [
  {
    name: "CRM 360",
    url: "https://crm360.trirex.cloud",
    icon: Globe,
    permission: null,
  },
  {
    name: "Business Intelligence 360",
    url: "https://bi360.trirex.cloud",
    icon: BarChart3,
    permission: "bi.access",
  },
  {
    name: "POS 360",
    url: "https://pos360.trirex.cloud",
    icon: ShoppingCart,
    permission: "pos.access",
  },
  {
    name: "NexDocs 360",
    url: "https://nexdocs360.trirex.cloud",
    icon: FileText,
    permission: null,
  },
  {
    name: "Nexus SSO",
    url: "https://sso360.trirex.cloud",
    icon: Key,
    permission: "sso.access",
  },
]

const CURRENT_SYSTEM = "CRM 360"

export function SystemSwitcher({ className }: { className?: string }) {
  const { hasPermission } = usePermission()

  const visibleSystems = SYSTEMS.filter(
    (s) => s.permission === null || hasPermission(s.permission)
  )

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                <Grid3x3Icon className="size-4" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            align="start"
            side="right"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch System
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {visibleSystems.map((system) => (
              <DropdownMenuItem
                key={system.name}
                asChild
                className={cn(
                  "gap-2 p-2",
                  system.name === CURRENT_SYSTEM && "bg-accent"
                )}
              >
                <a href={system.url} target={system.name === CURRENT_SYSTEM ? undefined : "_blank"} rel="noreferrer">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <system.icon className="size-4 shrink-0" />
                  </div>
                  {system.name}
                  {system.name === CURRENT_SYSTEM && (
                    <Check className="ml-auto size-4" />
                  )}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
