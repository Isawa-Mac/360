"use client"

import * as React from "react"
import { LogOutIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserMenuProps {
  name?: string
  email?: string
  avatarSrc?: string
  avatarFallback?: string
}

function ProfileAvatar({
  name,
  avatarSrc,
  initials,
  className,
  fallbackClassName,
}: {
  name: string
  avatarSrc?: string
  initials: string
  className?: string
  fallbackClassName?: string
}) {
  return (
    <span className="inline-flex rounded-full bg-[conic-gradient(from_210deg,color-mix(in_oklch,var(--primary)_36%,white)_0_26%,var(--primary)_26%_100%)] p-[2px] shadow-sm">
      <Avatar className={className}>
        {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} referrerPolicy="no-referrer" /> : null}
        <AvatarFallback className={fallbackClassName}>
          {initials}
        </AvatarFallback>
      </Avatar>
    </span>
  )
}

export function UserMenu({
  name = "superadmin",
  email = "isawa.mac@gmail.com",
  avatarSrc,
  avatarFallback = "SA",
}: UserMenuProps) {
  const { logout } = useAuth()
  const { t } = useLanguage()

  const initials = avatarFallback || name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "GU"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-foreground transition-colors hover:bg-accent"
          aria-label={t("profile_menu")}
        >
          <ProfileAvatar
            name={name}
            avatarSrc={avatarSrc}
            initials={initials}
            className="h-9 w-9 bg-background"
            fallbackClassName="text-xs font-bold text-foreground"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-64">
        <DropdownMenuLabel className="px-3 py-3 text-foreground">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              name={name}
              avatarSrc={avatarSrc}
              initials={initials}
              className="h-10 w-10 bg-background"
              fallbackClassName="text-sm font-semibold text-foreground"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
              <p className="truncate text-[11px] text-muted-foreground">360</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="text-red-500 focus:text-red-500"
        >
          <LogOutIcon className="h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
