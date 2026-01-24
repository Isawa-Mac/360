"use client"

import * as React from "react"
import { UserIcon, SettingsIcon, LogOutIcon, ChevronsUpDown, LucideIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getPermissionsFromCookie } from "@/lib/utils"
import menuConfig from "@/lib/user-menu-config.json"

interface MenuItem {
  id: string
  label: string
  icon: string
  permission: string
  variant?: "default" | "destructive"
}

interface UserMenuProps {
  name?: string
  email?: string
  avatarSrc?: string
  avatarFallback?: string
  className?: string
  permissionsCookieName?: string
}

const iconMap: Record<string, LucideIcon> = {
  UserIcon,
  SettingsIcon,
  LogOutIcon,
}

export function UserMenu({
  name = "superadmin",
  email = "isawa.mac@gmail.com",
  avatarSrc,
  avatarFallback = "SA",
  className,
  permissionsCookieName = "permissions",
}: UserMenuProps) {
  const [permissions, setPermissions] = React.useState<string[]>([])

  React.useEffect(() => {
    // Read permissions from cookie on mount
    const cookiePermissions = getPermissionsFromCookie(permissionsCookieName)
    setPermissions(cookiePermissions)
    
    // Optional: Listen for cookie changes
    const interval = setInterval(() => {
      const newPermissions = getPermissionsFromCookie(permissionsCookieName)
      setPermissions((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(newPermissions)) {
          return newPermissions
        }
        return prev
      })
    }, 1000) // Check every second
    
    return () => clearInterval(interval)
  }, [permissionsCookieName])

  const hasPermission = (permission: string) => {
    // Permission format: Module.scope.actions (e.g., "bi.sales.view")
    // Must have exact match in permissions array
    return permissions.includes(permission)
  }

  const visibleMenuItems = (menuConfig.menuItems as MenuItem[]).filter(
    (item) => hasPermission(item.permission)
  )

  // Logout always visible, no permission check needed
  const canLogout = true

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName]
    return Icon ? <Icon /> : null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent hover:bg-sidebar-accent transition-colors w-full text-left",
            className
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-medium text-sm text-foreground text-sidebar-foreground truncate">
              {name}
            </div>
            <div className="text-xs text-muted-foreground text-sidebar-foreground/70 truncate">
              {email}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground text-sidebar-foreground/70 shrink-0 group-data-[collapsible=icon]:hidden" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right" className="w-56">
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarSrc} alt={name} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="font-medium text-sm text-foreground truncate">
                {name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {email}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        {visibleMenuItems.length > 0 && (
          <>
            <DropdownMenuSeparator />
            {visibleMenuItems.map((item) => {
              const Icon = iconMap[item.icon]
              return (
                <DropdownMenuItem key={item.id} variant={item.variant}>
                  {Icon && <Icon />}
                  {item.label}
                </DropdownMenuItem>
              )
            })}
          </>
        )}
        {canLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant={menuConfig.logoutItem.variant as "default" | "destructive" | undefined}>
              {renderIcon(menuConfig.logoutItem.icon)}
              {menuConfig.logoutItem.label}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
