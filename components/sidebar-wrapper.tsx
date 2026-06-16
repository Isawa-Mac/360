"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useHeaderControl } from "@/contexts/header-control-context"
import { cn } from "@/lib/utils"
import { useDashboardScale } from "@/contexts/dashboard-scale-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { normalizeProfileImageSrc } from "@/lib/profile-image"
import { getPageTitle } from "@/lib/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const BRAND_NAME = "360"

function UserAvatar({
  src,
  fallback,
  className,
}: {
  src?: string
  fallback: string
  className: string
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = Boolean(src && failedSrc !== src)

  return (
    <span className={cn("inline-flex overflow-hidden rounded-full", className)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{fallback}</span>
      )}
    </span>
  )
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { locale, t } = useLanguage()
  const { user, logout } = useAuth()

  const headerControl = useHeaderControl()
  const dashboardScale = useDashboardScale()

  const { isGlobalHeaderHidden, pageTitle } = headerControl
  const { scaleMode, containerStyle, contentStyle, contentRef } = dashboardScale

  const resolvedTitle = pageTitle || getPageTitle(pathname || "/", locale)
  const isAuthPage = pathname?.startsWith("/auth/")
  const userFallback = (user?.username || user?.email || "360").slice(0, 2).toUpperCase()
  const avatarSrc = normalizeProfileImageSrc(user?.avatarUrl) || undefined

  if (isAuthPage) {
    return <div className="relative h-screen w-full">{children}</div>
  }

  return (
    <SidebarInset className="relative flex h-screen flex-col overflow-hidden bg-transparent transition-all duration-300">
      <ScrollArea className="h-full w-full" hideScrollbar={scaleMode === "fit"}>
        <div
          className={cn("p-4", isGlobalHeaderHidden ? "pt-4" : "pt-16")}
          style={containerStyle}
        >
          <div className="relative z-10" style={contentStyle} ref={contentRef}>
            {children}
          </div>
        </div>
      </ScrollArea>

      {!isGlobalHeaderHidden && (
        <header className="app-shell-header flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />

          <div className="flex min-w-0 items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">
              {BRAND_NAME}
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span
              className={cn(
                "truncate text-[10px] font-bold tracking-widest text-primary",
                locale === "th" ? "uppercase" : "lowercase"
              )}
            >
              {resolvedTitle}
            </span>
          </div>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/35 text-xs font-bold text-foreground backdrop-blur-sm transition-colors hover:bg-background/55"
                  aria-label={locale === "th" ? "เมนูโปรไฟล์" : "Profile menu"}
                >
                  <UserAvatar src={avatarSrc} fallback={userFallback} className="h-full w-full bg-background/35" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="w-64">
                <DropdownMenuLabel className="px-3 py-3 text-foreground">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={avatarSrc}
                      fallback={userFallback}
                      className="h-10 w-10 border border-border bg-muted text-sm font-semibold text-foreground"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {user?.username || t("guest")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    toast.success(locale === "th" ? "ออกจากระบบแล้ว" : "Signed out")
                  }}
                  className="text-red-500 focus:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  {locale === "th" ? "ออกจากระบบ" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}
    </SidebarInset>
  )
}
