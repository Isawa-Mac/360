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
import { Download, Smartphone, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { ProjectToggle } from "@/components/project-toggle"
import { SystemSwitcher } from "@/components/system-switcher"
import { LanguageProvider } from "@/contexts/language-context"


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

const APK_DOWNLOAD_URL = "https://trirexinter-my.sharepoint.com/:u:/g/personal/isara-it_trirex_co_th/IQAxMBs-h9-uRb-n5vYwDEjJAayJhhzmKF6YQkgNd5-oSGg?e=K3gq4I"

function MobileAppDownload() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ดาวน์โหลด Mobile App"
        title="ดาวน์โหลด Mobile App"
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Smartphone className="size-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-app-dialog-title"
            className="relative w-full max-w-sm rounded-2xl bg-background p-6 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="ปิดหน้าต่างดาวน์โหลด"
              className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Smartphone className="size-6" aria-hidden="true" />
            </div>
            <h2 id="mobile-app-dialog-title" className="text-xl font-semibold">
              ดาวน์โหลด Mobile App
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              สแกน QR Code เพื่อดาวน์โหลด APK
            </p>
            <div className="mx-auto my-5 w-fit rounded-xl border bg-white p-3 shadow-sm">
              <img
                src="/download-apk-qr.png"
                alt="QR Code สำหรับดาวน์โหลด Mobile App"
                className="size-52"
              />
            </div>
            <a
              href={APK_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Download className="size-4" aria-hidden="true" />
              ดาวน์โหลด APK
            </a>
            <p className="mt-3 text-xs text-muted-foreground">สำหรับ Android เท่านั้น</p>
          </section>
        </div>
      )}
    </>
  )
}

// Inner component that uses the module context
function AppLayoutInner({
  children,
  pageTitle: customPageTitle,
  pageDescription: customPageDescription,
  pageHelp,
}: AppLayoutProps) {
  const pathname = usePathname()
  const [pageTitle, setPageTitle] = useState("Dashboard")
  const [pageDescription, setPageDescription] = useState("")
  const [mounted, setMounted] = useState(false)
  const { isHeaderHidden, setHeaderHidden } = useFullscreen()

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
    <LanguageProvider>
      <SidebarProvider defaultOpen={false}>
        <SidebarAutoClose pathname={pathname} mounted={mounted} />
        <div className="flex h-screen w-full m-0 p-1">
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0 w-full">
          <div className="bg-card border border-border rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col">
            {/* Fixed Header */}
            <header className={cn(
              "flex min-h-[3rem] shrink-0 items-center gap-2 bg-background px-2 sticky top-0 z-40 relative border-b border-border",
              "transition-all duration-300 ease-in-out",
              isHeaderHidden ? "h-0 opacity-0 overflow-hidden" : "h-auto opacity-100"
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

              <div className="flex items-center gap-4 ml-auto">
                <MobileAppDownload />
                <Separator orientation="vertical" className="h-6 mx-1" />
                <div className="flex flex-col items-center gap-1">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
                <ProjectToggle
                  projectName1="LOBBEY"
                  projectName2="360"
                  url1="http://localhost:8112"
                  url2="http://lobbey360.trirex.com:8112"
                  activeColor="blue-500"
                  activeSegment="first"
                />
                <Separator orientation="vertical" className="h-6 mx-1" />
                <SystemSwitcher
                  className="w-auto min-w-[200px] border-none bg-transparent shadow-none hover:bg-accent"
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
  </LanguageProvider>
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
