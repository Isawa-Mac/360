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
import { AppMenu } from "@/components/app-menu"
import { DashboardControl } from "@/components/dashboard-control"
import { useLanguage } from "@/contexts/language-context"
import { usePermission } from "@/hooks/use-permission"
import { navItems } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** แก้ URL ที่ขาด : ใน protocol (เช่น https// -> https://) */
function ensureAbsoluteUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url
  if (url.startsWith("https//")) return "https://" + url.slice(6)
  if (url.startsWith("http//")) return "http://" + url.slice(5)
  return url
}

export function AppSidebar() {
  const pathname = usePathname()
  const { locale } = useLanguage()
  const { state, setOpen, setOpenMobile, isMobile } = useSidebar()
  const { hasPermission, isSuperAdmin } = usePermission()

  // Hide sidebar on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  // ใช้รายการเมนูจาก system-switcher (navItems ใน lib/navigation) และเช็ค permission
  const filteredNavItems = navItems.filter(item => {
    if (item.hidden) return false
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
      <SidebarHeader className="shrink-0 pb-3 flex items-start gap-2 group-data-[collapsible=icon]:items-center">
        <AppMenu className="flex items-center justify-start shrink-0" />
      </SidebarHeader>
      <SidebarContent
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden w-full [&>[data-orientation=horizontal]]:hidden"
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNavItems.map((item) => {
                  const looksExternal = item.url.startsWith('http')
                  const isExternal = looksExternal
                  const externalHref = looksExternal ? ensureAbsoluteUrl(item.url) : item.url
                  const isActive = !isExternal && pathname === item.url
                  const Icon = item.icon
                  const title = locale === "th" ? item.titleTh || item.title : item.titleEn || item.title
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        variant="ghost"
                        asChild
                        tooltip={title}
                        isActive={isActive}
                        onClick={() => isMobile ? setOpenMobile(false) : setOpen(false)}
                      >
                        {isExternal ? (
                          <a href={externalHref}>
                            {Icon && <Icon />}
                            <span className="group-data-[collapsible=icon]:hidden">{title}</span>
                          </a>
                        ) : (
                          <Link href={item.url}>
                            {Icon && <Icon />}
                            <span className="group-data-[collapsible=icon]:hidden">{title}</span>
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="shrink-0">
        <div className="flex flex-col gap-2 px-2 pb-4">
          <div className="flex items-center justify-start gap-1 group-data-[collapsible=icon]:justify-center">
            <LocaleToggle />
          </div>
          <div className="flex justify-start group-data-[collapsible=icon]:justify-center">
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

function LocaleToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "th" ? "en" : "th")}
      className="h-8 w-8 px-0 text-[11px] font-semibold"
    >
      {locale === "th" ? "TH" : "EN"}
    </Button>
  )
}
