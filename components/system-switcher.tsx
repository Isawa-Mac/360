"use client"

import * as React from "react"
import {
  Check,
  Globe,
  BarChart3,
  ShoppingCart,
  Key,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/use-permission"

// Custom 3x3 Grid Icon
const Grid3x3Icon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <rect x="1" y="1" width="3" height="3" fill="currentColor" />
    <rect x="6.5" y="1" width="3" height="3" fill="currentColor" />
    <rect x="12" y="1" width="3" height="3" fill="currentColor" />
    <rect x="1" y="6.5" width="3" height="3" fill="currentColor" />
    <rect x="6.5" y="6.5" width="3" height="3" fill="currentColor" />
    <rect x="12" y="6.5" width="3" height="3" fill="currentColor" />
    <rect x="1" y="12" width="3" height="3" fill="currentColor" />
    <rect x="6.5" y="12" width="3" height="3" fill="currentColor" />
    <rect x="12" y="12" width="3" height="3" fill="currentColor" />
  </svg>
)
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const projects = [
  {
    name: "CRM 360 Online",
    url: "https://360.trirex.cloud",
    icon: Globe,
    active: false,
    permission: "crm360.erp",
    clientId: "cli_1mkd41fz"
  },
  {
    name: "Business Intelligence 360",
    url: "https://bi360.trirex.cloud",
    icon: BarChart3,
    active: true,
    permission: "crm360.bi",
  },
  {
    name: "NexDocs 360",
    url: "https://nexdocs.trirex.cloud",
    icon: FileText,
    permission: "crm360.docs"
  },
  {
    name: "Point of Sale 360 Online",
    url: "https://pos360.trirex.cloud",
    icon: ShoppingCart,
    permission: "crm360.pos"
  },
  {
    name: "Single Sign-On 360",
    url: "https://sso360.trirex.cloud",
    icon: Key,
    permission: "crm360.admin"
  },
]

export function SystemSwitcher({ className }: { className?: string }) {
  // Use user permissions
  const { hasPermission } = usePermission();

  // Filter projects based on permission
  const visibleProjects = projects.filter(project =>
    !project.permission || hasPermission(project.permission)
  )

  const getAppUrl = (project: typeof projects[0]) => {
    // Override via Environment Variables for local dev
    let overrideUrl: string | undefined;
    if (project.name === "CRM 360 Online") overrideUrl = process.env.NEXT_PUBLIC_CRM360_URL;
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
      return `${process.env.NEXT_PUBLIC_SSO_URL || 'https://sso360.trirex.cloud'}/#/login?client_id=${project.clientId}&response_type=code`;
    }

    return effectiveUrl;
  }

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                <Grid3x3Icon className="size-4" />
              </div>

            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-80 min-w-56 rounded-2xl p-2 bg-popover border shadow-2xl"
            side="right"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40 px-3 py-2">
              Select System
            </DropdownMenuLabel>
            <div className="flex flex-col gap-1">
              {visibleProjects.map((project) => {
                const isActive = project.active
                const isBI = project.name === "Business Intelligence 360"

                return (
                  <DropdownMenuItem
                    key={project.name}
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 cursor-pointer rounded-xl transition-all duration-200",
                      isActive && !isBI ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                      isActive && isBI ? "bg-destructive/10 text-destructive" : ""
                    )}
                    onClick={() => {
                      window.location.href = getAppUrl(project)
                    }}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                      isActive && !isBI ? "border-primary/20 bg-primary/5" : "border-border bg-muted",
                      isActive && isBI ? "border-destructive/20 bg-destructive/5" : ""
                    )}>
                      <project.icon className={cn(
                        "h-4 w-4",
                        isActive && !isBI ? "text-primary" : "text-muted-foreground",
                        isActive && isBI ? "text-destructive" : ""
                      )} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={cn(
                        "text-[14px] font-semibold truncate",
                        isActive && isBI ? "text-destructive" : "text-foreground"
                      )}>
                        {project.name}
                      </span>
                    </div>
                    {isActive && (
                      <Check className={cn(
                        "h-4 w-4",
                        isBI ? "text-destructive" : "text-primary"
                      )} />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

