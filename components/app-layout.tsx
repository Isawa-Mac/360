"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ModuleProvider } from "@/contexts/module-context"
import { getPageTitle } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { useFullscreen } from "@/contexts/fullscreen-context"
import { Help } from "@/components/ui/help"
import { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProjectToggle } from "@/components/project-toggle"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/contexts/auth-context"


interface AppLayoutProps {
  children: React.ReactNode
  showFilters?: boolean
  disableDepartment?: boolean
  disableEmployee?: boolean
  pageTitle?: string
  pageDescription?: string
  pageHelp?: string | ReactNode
  customYears?: number[]
  hideYear?: boolean
  hideMonth?: boolean
  hideQuarter?: boolean
  hideYtd?: boolean
}

// Inner component that uses the module context
function AppLayoutInner({
  children,
  showFilters = true,
  disableDepartment = false,
  disableEmployee = false,
  pageTitle: customPageTitle,
  pageDescription: customPageDescription,
  pageHelp,
  customYears,
  hideYear = false,
  hideMonth = false,
  hideQuarter = false,
  hideYtd = false
}: AppLayoutProps) {
  const pathname = usePathname()
  const [pageTitle, setPageTitle] = useState("Dashboard")
  const [pageDescription, setPageDescription] = useState("")
  const [mounted, setMounted] = useState(false)
  const { isHeaderHidden, setHeaderHidden } = useFullscreen()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (customPageTitle) {
        setPageTitle(customPageTitle)
        setPageDescription(customPageDescription || "")
      } else {
        const title = getPageTitle(pathname)
        setPageTitle(title)
        setPageDescription("")
      }
    }
  }, [pathname, mounted, customPageTitle, customPageDescription])

  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarAutoClose pathname={pathname} mounted={mounted} />
      <div className="flex h-screen w-full m-0 p-1">
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0 w-full">
          <div className="bg-card border border-border rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Fixed Header */}
            <header className={cn(
              "flex h-12 shrink-0 items-center gap-2 bg-background px-2 sticky top-0 z-40 relative border-b border-border",
              "transition-all duration-300 ease-in-out",
              isHeaderHidden ? "h-0 opacity-0 overflow-hidden" : "h-12 opacity-100"
            )}>
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4"
              />

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {pageTitle}
                    </h1>
                    {pageHelp && (
                      <Help description={pageHelp} className="shrink-0" />
                    )}
                  </div>
                  {pageDescription && (
                    <p className="text-xs text-muted-foreground truncate">
                      {pageDescription}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <ThemeToggle />
                <ProjectToggle
                  projectName1="LOBBEY"
                  projectName2="360"
                  url1="http://localhost:8112"
                  url2="http://lobbey360.trirex.com:8112"
                  activeColor="blue-500"
                  activeSegment="first"
                />
                <Separator orientation="vertical" className="h-6 mx-1" />
                <UserMenu
                  name={user?.username || "Guest"}
                  email={user?.email || ""}
                  avatarSrc={user?.avatarUrl}
                  className="w-auto border-none hover:bg-transparent"
                />
              </div>

            </header>

            {/* Content Area */}
            <main className={cn(
              "flex-1 w-full bg-background min-h-0",
              "transition-all duration-300 ease-in-out",
              isHeaderHidden ? "scale-110 origin-top" : "scale-100",
              "overflow-y-auto overflow-x-hidden",
              "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
            )}>
              {children}
            </main>

          </div>
        </div>

      </div>


    </SidebarProvider>
  )
}

// Component to auto-close sidebar when pathname changes
function SidebarAutoClose({ pathname, mounted }: { pathname: string; mounted: boolean }) {
  const { setOpen } = useSidebar()
  const prevPathnameRef = useRef(pathname)
  const initialCloseDone = useRef(false)

  // Close sidebar on initial mount
  useEffect(() => {
    if (mounted && !initialCloseDone.current) {
      setOpen(false)
      initialCloseDone.current = true
    }
  }, [mounted, setOpen])

  // Close sidebar when pathname changes
  useEffect(() => {
    if (mounted && initialCloseDone.current && prevPathnameRef.current !== pathname) {
      // Add small delay to ensure navigation is complete
      const timer = setTimeout(() => {
        setOpen(false)
      }, 100)

      prevPathnameRef.current = pathname
      return () => clearTimeout(timer)
    }
  }, [pathname, mounted, setOpen])

  return null
}

export function AppLayout({
  children,
  showFilters = true,
  disableDepartment = false,
  disableEmployee = false,
  pageTitle,
  pageDescription,
  pageHelp,
  customYears,
  hideMonth = false,
  hideQuarter = false,
  hideYtd = false
}: AppLayoutProps) {
  // Regular app layout with sidebar
  return (
    <ModuleProvider>
      <AppLayoutInner
        showFilters={showFilters}
        disableDepartment={disableDepartment}
        disableEmployee={disableEmployee}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
        pageHelp={pageHelp}
        customYears={customYears}
        hideMonth={hideMonth}
        hideQuarter={hideQuarter}
        hideYtd={hideYtd}
      >
        {children}
      </AppLayoutInner>
    </ModuleProvider>
  )
}