"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useHeaderControl } from "@/contexts/header-control-context"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardScale } from "@/contexts/dashboard-scale-context"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  const headerControl = useHeaderControl()
  const dashboardScale = useDashboardScale()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    isGlobalHeaderHidden,
    pageTitle,
    pageSubtitle
  } = headerControl

  const { scaleMode, containerStyle, contentStyle, contentRef } = dashboardScale

  const isAuthPage = pathname?.startsWith('/auth/')

  if (isAuthPage) {
    return <div className="h-screen w-full">{children}</div>
  }

  return (
    <SidebarInset
      className="relative flex flex-col h-screen overflow-hidden bg-transparent transition-all duration-300"
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-background">
        <div
          className="absolute inset-0 opacity-100 dark:opacity-[0.5]"
          style={{
            backgroundImage: `
               linear-gradient(to right, var(--grid-color, oklch(0.145 0 0 / 0.12)) 1px, transparent 1px),
               linear-gradient(to bottom, var(--grid-color, oklch(0.145 0 0 / 0.12)) 1px, transparent 1px)
             `,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 100% 80% at 50% 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 100% 80% at 50% 0%, black 60%, transparent 100%)",
          }}
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
                HOME
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/30" />
            <BreadcrumbItem className="flex flex-col items-center justify-center leading-tight">
              <BreadcrumbPage className="text-[10px] uppercase font-bold tracking-widest text-primary dark:text-foreground">
                {pageTitle || "Dashboard"}
              </BreadcrumbPage>
              {pageSubtitle && (
                <span className="text-[9px] text-muted-foreground/60 font-medium lowercase">
                  {pageSubtitle}
                </span>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
