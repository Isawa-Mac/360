"use client"

import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserMenu } from "@/components/user-menu"
import { SystemSwitcher } from "@/components/system-switcher"
import { DashboardControl } from "@/components/dashboard-control"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardScale } from "@/contexts/dashboard-scale-context"

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { scaleMode, setScaleMode } = useDashboardScale()
  const { state } = useSidebar()

  // Hide sidebar on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col gap-2 p-2">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">360</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold leading-none truncate">
                Acme Inc
              </span>
              <span className="text-xs text-muted-foreground leading-none truncate">
                Enterprise System
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="h-full w-full">
        <SystemSwitcher />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2">
          <div className="flex justify-center">
            <DashboardControl
              scaleValue={scaleMode}
              onScaleChange={setScaleMode}
              direction={state === "collapsed" ? "column" : "row"}
            />
          </div>
          <UserMenu
            name={user?.username || "Guest"}
            email={user?.email || ""}
            avatarSrc={user?.avatarUrl}
            className="group-data-[collapsible=icon]:justify-center"
          />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
