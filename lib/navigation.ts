import { BarChart3, Key, Globe, Shield, FileText, ShoppingCart } from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: any
  items?: NavSubItem[]
  requiredPermission?: string | string[]
  resourceCheck?: { resource: string; actions: string[] }
  isSuperAdminOnly?: boolean
}

export interface NavSubItem {
  title: string
  url: string
  description?: string
  icon?: any
  requiredPermission?: string | string[]
  resourceCheck?: { resource: string; actions: string[] }
  isSuperAdminOnly?: boolean
}

// Navigation data structure - ใช้เมนูจาก team-switcher.tsx
export const navItems: NavItem[] = [
  {
    title: "Nexus Smart CRM 360",
    url: "/home",
    icon: Globe,
    requiredPermission: 'dashboard',
  },
  {
    title: "Business Intelligence 360",
    url: process.env.NEXT_PUBLIC_BI360_URL || "https://bi360.trirex.cloud",
    icon: BarChart3,
    requiredPermission: ['lobbey:dashboard:menu', 'LOBBEY:dashboard:menu', 'lobbey:dashboard:read', 'LOBBEY:dashboard:read'],
  },
  {
    title: "NexDocs 360",
    url: process.env.NEXT_PUBLIC_NEXDOCS_URL || "https://nexdocs.trirex.cloud",
    icon: FileText,
    requiredPermission: ['lobbey:nexdocs:menu', 'LOBBEY:nexdocs:menu', 'lobbey:nexdocs:read', 'LOBBEY:nexdocs:read'],
  },
  {
    title: "Point of Sale 360 Online",
    url: process.env.NEXT_PUBLIC_POS_URL || "https://pos.trirex.cloud",
    icon: ShoppingCart,
    requiredPermission: ['lobbey:pos:menu', 'LOBBEY:pos:menu', 'lobbey:pos:read', 'LOBBEY:pos:read'],
  },
  {
    title: "Single Sign-On 360",
    url: process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud",
    icon: Key,
    requiredPermission: ['lobbey:sso:menu', 'LOBBEY:sso:menu', 'lobbey:sso:read', 'LOBBEY:sso:read'],
  },
]

// Function to get page title from nav items based on pathname
export function getPageTitle(pathname: string): string {
  // Search through all nav items and their sub-items
  for (const item of navItems) {
    // Check sub-items first (more specific)
    if (item.items) {
      for (const subItem of item.items) {
        if (subItem.url === pathname) {
          return subItem.title
        }
      }
    }

    // Check main item (less specific)
    if (item.url === pathname) {
      return item.title
    }
  }

  // Fallback to "Dashboard" if no match found
  return "Dashboard"
}

// Helper function to check if pathname matches
export function isReceivableAgingDataPage(pathname: string): boolean {
  return pathname === '/receivable-aging-data'
}

// Helper function to filter navigation items by permission
export function filterNavItemsByPermission(
  items: NavItem[],
  hasPermission: (permission: string | string[]) => boolean
): NavItem[] {
  return items
    .filter(item => {
      // If item has requiredPermission, check it
      if (item.requiredPermission) {
        return hasPermission(item.requiredPermission)
      }
      return true
    })
    .map(item => {
      // Filter sub-items if they exist
      if (item.items) {
        const filteredSubItems = item.items.filter(subItem => {
          if (subItem.requiredPermission) {
            return hasPermission(subItem.requiredPermission)
          }
          return true
        })
        return {
          ...item,
          items: filteredSubItems.length > 0 ? filteredSubItems : undefined
        }
      }
      return item
    })
    .filter(item => {
      // Remove items that have no sub-items after filtering (if they originally had sub-items)
      if (item.items !== undefined && item.items.length === 0) {
        return false
      }
      return true
    })
}