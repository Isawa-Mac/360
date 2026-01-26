"use client"

import * as React from "react"
import {
  Grip, Check,
  Globe,
  BarChart3,
  ShoppingCart,
  Key,
  FileText
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/use-permission"

const projects = [
  {
    name: "ERP 360 Online",
    url: "https://360.trirex.cloud",
    icon: Globe,
    active: true,
    permission: "erp360.erp",
    clientId: "cli_1mkd41fz"
  },
  {
    name: "Business Intelligence 360",
    url: "https://bi360.trirex.cloud",
    icon: BarChart3,
    permission: "erp360.bi",
    clientId: "cli_t16uxv5w"
  },
  {
    name: "NexDocs 360",
    url: "https://nexdocs.trirex.cloud",
    icon: FileText,
    permission: "erp360.docs"
  },
  {
    name: "Point of Sale 360 Online",
    url: "https://pos360.trirex.cloud",
    icon: ShoppingCart,
    permission: "erp360.pos"
  },
  {
    name: "Single Sign-On 360",
    url: "https://sso360.trirex.cloud",
    icon: Key,
    permission: "erp360.admin"
  },
]

export function SystemSwitcher({ className }: { className?: string }) {
  // Use user permissions
  const { permissions, hasPermission } = usePermission();

  // Filter projects based on permission
  const visibleProjects = projects.filter(project =>
    !project.permission || hasPermission(project.permission)
  )

  const getAppUrl = (project: typeof projects[0]) => {
    // Override via Environment Variables for local dev
    let overrideUrl: string | undefined;
    if (project.name === "ERP 360 Online") overrideUrl = process.env.NEXT_PUBLIC_ERP360_URL;
    if (project.name === "Business Intelligence 360") overrideUrl = process.env.NEXT_PUBLIC_BI360_URL;
    if (project.name === "NexDocs 360") overrideUrl = process.env.NEXT_PUBLIC_NEXDOCS_URL;
    if (project.name === "Point of Sale 360 Online") overrideUrl = process.env.NEXT_PUBLIC_POS_URL;
    if (project.name === "Single Sign-On 360") overrideUrl = process.env.NEXT_PUBLIC_SSO_URL;

    const effectiveUrl = overrideUrl || project.url;

    if (!effectiveUrl || effectiveUrl === "#") return "#";
    // If current app (active), just go to url (or stay)
    if (project.active) return effectiveUrl;

    // Smart Redirect via SSO Login with Callback URL
    if (project.clientId) {
      // Ensure we redirect to the callback handler, not the root, to avoid loops
      const callbackUrl = `${effectiveUrl}/auth/sso-callback`;
      // Remove redirect_uri to let SSO use the default callback URL registered for the client
      // This helps avoid potential mismatch errors or loops if the registered redirect URI is strictly enforced
      return `${process.env.NEXT_PUBLIC_SSO_URL || 'https://sso360.trirex.cloud'}/#/login?client_id=${project.clientId}&response_type=code`;
    }

    return effectiveUrl;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8",
            className
          )}
        >
          <Grip className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-64 p-2 z-[110]" sideOffset={8}>
        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 px-2 py-1.5">
          Select System
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <div className="grid grid-cols-1 gap-1">
          {visibleProjects.map((project) => {
            const isActive = project.active
            return (
              <DropdownMenuItem
                key={project.name}
                asChild
                className={cn(
                  "flex items-center gap-3 px-2 py-2 cursor-pointer rounded-md transition-colors",
                  isActive ? "bg-accent text-primary" : "hover:bg-accent/50"
                )}
              >
                <a href={getAppUrl(project)}>
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border bg-background transition-colors",
                    isActive ? "border-primary/50 bg-primary/10" : "border-border"
                  )}>
                    <project.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium leading-none truncate">
                      {project.name}
                    </span>
                  </div>
                  {isActive && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </a>
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
