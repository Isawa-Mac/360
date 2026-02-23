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

import { SystemSwitcher as SharedSystemSwitcher } from "@nexus360/shared"
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

export function SystemSwitcher({ className }: { className?: string }) {
  const { hasPermission } = usePermission();

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <SharedSystemSwitcher
          currentProjectName="Business Intelligence 360" // or get from config
          hasPermission={hasPermission}
        >
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
              <Grid3x3Icon className="size-4" />
            </div>
          </SidebarMenuButton>
        </SharedSystemSwitcher>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

