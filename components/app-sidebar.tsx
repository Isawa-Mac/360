"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserMenu } from "@/components/user-menu"
import { SystemSwitcher } from "@/components/system-switcher"
import { DashboardControl } from "@/components/dashboard-control"
import { useAuth } from "@/contexts/auth-context"
import { usePermission } from "@/hooks/use-permission"
import { navItems, filterNavItemsByPermission } from "@/lib/navigation"

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { state, setOpen, setOpenMobile, isMobile } = useSidebar()
  const { hasPermission, isSuperAdmin } = usePermission()

  // Hide sidebar on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  // ใช้รายการเมนูจาก system-switcher (navItems ใน lib/navigation) และเช็ค permission
  const filteredNavItems = navItems.filter(item => {
    // เช็ค isSuperAdminOnly
    if (item.isSuperAdminOnly && !isSuperAdmin) {
      return false
    }
    // เช็ค requiredPermission
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission)
    }
    return true
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-12 border-b flex justify-center p-0">
        <div className="px-2 flex items-center h-full w-full">
          <UserMenu
            name={user?.username || "Guest"}
            email={user?.email || ""}
            avatarSrc={user?.avatarUrl}
            className="group-data-[collapsible=icon]:justify-center"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="h-full w-full [&>[data-orientation=horizontal]]:hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.url
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      variant="ghost"
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                      onClick={() => isMobile ? setOpenMobile(false) : setOpen(false)}
                    >
                      <Link href={item.url}>
                        {Icon && <Icon />}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2 pb-4">
          <div className="flex justify-center">
            <DashboardControl
              direction={state === "collapsed" ? "column" : "row"}
            />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
