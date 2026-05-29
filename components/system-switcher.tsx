"use client"

import * as React from "react"
import {
  Check,
  Globe,
  BarChart3,
  ShoppingCart,
  Key,
  FileText,
  Users
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

type SystemItem = {
  name: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  permission: string | string[]
  disabled?: boolean
}

const SYSTEMS: SystemItem[] = [
  {
    name: "CRM 360",
    url: "/nexus-smart-crm",
    icon: Users,
    permission: "erp360.crm.read",
    disabled: false,
  },
  {
    name: "ERP 360",
    url: "/nexus-smart-erp",
    icon: Globe,
    permission: "erp360.erp.read",
    disabled: false,
  },
  {
    name: "Business Intelligence 360",
    url: "https://bi360.trirex.cloud",
    icon: BarChart3,
    permission: "erp360.bi.read",
    disabled: false,
  },
  {
    name: "POS 360",
    url: "https://pos360.trirex.cloud",
    icon: ShoppingCart,
    permission: "erp360.pos.read",
    disabled: false,
  },
  {
    name: "NexDocs 360",
    url: "https://nexdocs360.trirex.cloud",
    icon: FileText,
    permission: ["erp360.nexdocs.full", "erp360.nexdocs.read"],
    disabled: false,
  },
  {
    name: "Nexus SSO",
    url: "https://sso360.trirex.cloud",
    icon: Key,
    permission: "erp360.admin.read",
    disabled: false,
  },
]

const CURRENT_SYSTEM = "BI 360" // CRM ปิดแล้ว ใช้ BI เป็น default

export function SystemSwitcher({ className }: { className?: string }) {
  const { hasPermission } = usePermission()

  const visibleSystems = SYSTEMS.filter(
    (s) => !s.permission || hasPermission(s.permission)
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
            {visibleSystems.map((system) => {
              const isDisabled = (system as SystemItem).disabled === true
              return (
                <DropdownMenuItem
                key={system.name}
                asChild
                disabled={isDisabled}
                className={cn(
                  "gap-2 p-2",
                  system.name === CURRENT_SYSTEM && "bg-accent",
                  isDisabled && "opacity-50 grayscale cursor-not-allowed pointer-events-none"
                )}
              >
                <a
                  href={isDisabled ? "#" : system.url}
                  target={(system.name === CURRENT_SYSTEM || isDisabled) ? undefined : "_blank"}
                  rel="noreferrer"
                  onClick={(e) => isDisabled && e.preventDefault()}
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <system.icon className="size-4 shrink-0" />
                  </div>
                  <span className="flex-1">{system.name}</span>
                  {isDisabled && (
                    <span className="text-[10px] bg-muted px-1 rounded uppercase font-medium">Coming Soon</span>
                  )}
                  {system.name === CURRENT_SYSTEM && (
                    <Check className="ml-auto size-4" />
                  )}
                </a>
              </DropdownMenuItem>
            )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
