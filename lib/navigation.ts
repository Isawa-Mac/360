import { Home, BarChart3, Key, Globe, FileText, ShoppingCart, Users } from "lucide-react"

export interface NavItem {
  title: string
  titleTh?: string
  titleEn?: string
  url: string
  icon?: any
  items?: NavSubItem[]
  requiredPermission?: string | string[]
  resourceCheck?: { resource: string; actions: string[] }
  isSuperAdminOnly?: boolean
  hidden?: boolean
}

export interface NavSubItem {
  title: string
  titleTh?: string
  titleEn?: string
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
    title: "Home",
    titleTh: "หน้าแรก",
    titleEn: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "CRM 360",
    titleTh: "CRM 360",
    titleEn: "CRM 360",
    url: "/nexus-smart-crm",
    icon: Users,
    requiredPermission: 'erp360.crm.read',
  },
  {
    title: "ERP 360",
    titleTh: "ERP 360",
    titleEn: "ERP 360",
    url: "/nexus-smart-erp",
    icon: Globe,
    requiredPermission: 'erp360.erp.read',
  },
  {
    title: "Business Intelligence 360",
    titleTh: "BI 360",
    titleEn: "Business Intelligence 360",
    url: (() => {
      const u = process.env.NEXT_PUBLIC_BI_URL || "https://bi360.trirex.cloud";
      return /^https?:\/\//.test(u) ? u : "https://bi360.trirex.cloud";
    })(),
    icon: BarChart3,
    requiredPermission: 'erp360.bi.read',
  },
  {
    title: "NexDocs 360",
    titleTh: "NexDocs 360",
    titleEn: "NexDocs 360",
    url: (() => {
      const u = process.env.NEXT_PUBLIC_NEXDOCS_URL || "https://nexdocs360.trirex.cloud";
      return /^https?:\/\//.test(u) ? u : "https://nexdocs360.trirex.cloud";
    })(),
    icon: FileText,
    requiredPermission: ['erp360.nexdocs.full', 'erp360.nexdocs.read'],
  },
  {
    title: "Point of Sale 360 Online",
    titleTh: "Point of Sale 360 ออนไลน์",
    titleEn: "Point of Sale 360 Online",
    url: (() => {
      const u = process.env.NEXT_PUBLIC_POS_URL || "https://pos360.trirex.cloud";
      return /^https?:\/\//.test(u) ? u : "https://pos360.trirex.cloud";
    })(),
    icon: ShoppingCart,
    requiredPermission: 'erp360.pos.read',
  },
  {
    title: "Single Sign-On 360",
    titleTh: "Single Sign-On 360",
    titleEn: "Single Sign-On 360",
    url: (() => {
      const u = process.env.NEXT_PUBLIC_SSO_BASE_URL || "https://sso360.trirex.cloud";
      return /^https?:\/\//.test(u) ? u : "https://sso360.trirex.cloud";
    })(),
    icon: Key,
    requiredPermission: 'erp360.admin.read',
  },
]

// Function to get page title from nav items based on pathname
export function getPageTitle(pathname: string, locale: "th" | "en" = "en"): string {
  // Search through all nav items and their sub-items
  for (const item of navItems) {
    // Check sub-items first (more specific)
    if (item.items) {
      for (const subItem of item.items) {
        if (subItem.url === pathname) {
          return locale === "th" ? subItem.titleTh || subItem.title : subItem.titleEn || subItem.title
        }
      }
    }

    // Check main item (less specific)
    if (item.url === pathname) {
      return locale === "th" ? item.titleTh || item.title : item.titleEn || item.title
    }
  }

  // Fallback to "Dashboard" if no match found
  return locale === "th" ? "แดชบอร์ด" : "Dashboard"
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