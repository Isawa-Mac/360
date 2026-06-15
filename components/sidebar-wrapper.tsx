"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useHeaderControl } from "@/contexts/header-control-context"
import { cn } from "@/lib/utils"
import { useDashboardScale } from "@/contexts/dashboard-scale-context"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLanguage } from "@/contexts/language-context"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/contexts/auth-context"
import Threads from "@/components/Threads"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { user } = useAuth()

  const headerControl = useHeaderControl()
  const dashboardScale = useDashboardScale()

  const {
    isGlobalHeaderHidden,
    pageTitle,
    pageSubtitle
  } = headerControl

  const { scaleMode, containerStyle, contentStyle, contentRef } = dashboardScale

  const isAuthPage = pathname?.startsWith('/auth/')

  if (isAuthPage) {
    return (
      <div className="relative h-screen w-full">
        <div className="fixed inset-0 -z-10 pointer-events-none bg-background">
          <Threads
            color={[0.32, 0.15, 1]}
            amplitude={2.9}
            distance={1.1}
            enableMouseInteraction={false}
            className="absolute inset-0"
          />
        </div>
        {children}
      </div>
    )
  }

  return (
    <SidebarInset
      className="relative flex flex-col h-screen overflow-hidden bg-transparent transition-all duration-300"
    >
      <div className="fixed inset-0 -z-10 pointer-events-none bg-background">
        <Threads
          color={[0.32, 0.15, 1]}
          amplitude={2.9}
          distance={1.1}
          enableMouseInteraction={false}
          className="absolute inset-0 opacity-80 dark:opacity-50"
        />
      </div>

      <header className={cn(
        "sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 bg-background/80 backdrop-blur-md border-b px-4",
        isGlobalHeaderHidden && "hidden"
      )}>
        <SidebarTrigger className="-ml-1" />

        <Breadcrumb>
          <BreadcrumbList className="items-center">
            <BreadcrumbItem className="items-center">
              <BreadcrumbLink href="/" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 hover:text-primary transition-colors dark:text-muted-foreground/80">
                {t("home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/30" />
            <BreadcrumbItem className="flex flex-col items-center justify-center leading-tight">
              <BreadcrumbPage className="text-[10px] uppercase font-bold tracking-widest text-primary dark:text-foreground">
                {pageTitle || t("dashboard")}
              </BreadcrumbPage>
              {pageSubtitle && (
                <span className="text-[9px] text-muted-foreground/60 font-medium lowercase">
                  {pageSubtitle}
                </span>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto">
          <UserMenu
            name={user?.username || t("guest")}
            email={user?.email || ""}
            avatarSrc={user?.avatarUrl}
            avatarFallback={(() => {
              const n = user?.username || user?.email || ""
              if (n.length >= 2) return n.slice(0, 2).toUpperCase()
              if (n.length === 1) return n.toUpperCase()
              return "?"
            })()}
          />
        </div>
      </header>

      <div className="flex-1" style={containerStyle}>
        <ScrollArea
          className={cn("h-full", isGlobalHeaderHidden ? "p-0" : "p-4")}
          hideScrollbar={scaleMode === "fit"}
        >
          <div className="relative z-10" style={contentStyle} ref={contentRef}>
            {children}
          </div>
        </ScrollArea>
      </div>
    </SidebarInset>
  )
}
