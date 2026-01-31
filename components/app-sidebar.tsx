"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  ChevronRight,
  Home,
  LayoutGrid,
  DollarSign,
  TrendingUp,
  Trophy,
  BarChart3,
  Target,
  Clock,
  Zap,
  FileText,
  FileEdit
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { UserMenu } from "@/components/user-menu"
import { SystemSwitcher } from "@/components/system-switcher"
import { DashboardControl } from "@/components/dashboard-control"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardScale } from "@/contexts/dashboard-scale-context"
import { checkPermission } from "@/lib/utils"

const menuItems = [
  {
    title: "",
    items: [
      {
        title: "Home",
        icon: Home,
        url: "/home",
        permission: "bi.home.read",
      },
      {
        title: "Dashboard",
        icon: LayoutGrid,
        url: "#",
        permission: "bi.dashboard.read",
        subItems: [
          { title: "ยอดขาย/ต้นทุน/กำไร", url: "/sales-cost-profit", icon: DollarSign, permission: "bi.salecostprofit.read" },
          { title: "Sales Performance", url: "/sales-performance", icon: TrendingUp, permission: "bi.salesperformance.read" },
          { title: "Sales Leaderboard", url: "/sales-leaderboard", icon: Trophy, permission: "bi.salesleaderboard.read" },
          { title: "Gross & Net Profit", url: "/compare-gross-net-profit", icon: BarChart3, permission: "bi.grossnetprofit.read" },

          { title: "KPI Management", url: "/kpi-management", icon: Target, permission: "bi.kpiperformance.read" },
          { title: "Product & sale analysis", url: "/product-sale-analysis", icon: Clock, permission: "bi.productsaleanalysis.read" },
          { title: "Customer analysis", url: "/customer-analysis", icon: Zap, permission: "bi.customeranalysis.read" },
        ],
      },
      {
        title: "Data information",
        icon: FileText,
        url: "#",
        permission: "bi.itemdtainfo.read",
        subItems: [
          { title: "Sales Performance", url: "/sales-performance-data", icon: FileEdit, permission: "bi.salesperformancedata.read" },
          { title: "หน่วยงาน", url: "/departments", icon: FileText, permission: "bi.groupdata.read" },
          { title: "พนักงานขาย", url: "/salesperson", icon: FileText, permission: "bi.salemandata.read" },
          { title: "Username ↔ พนักงานขาย", url: "/user-salesperson-mapping", icon: FileText, permission: "bi.mapuser.read" },
          { title: "Inventory management", url: "/inventory-management", icon: FileText, permission: "bi.inventorydata.read" },
          { title: "Supplier analysis", url: "/supplier-analysis-data", icon: FileText, permission: "bi.supplierdata.read" },
          { title: "Gross & Net Profit", url: "/net-profit-data", icon: FileText, permission: "bi.grossdata.read" },
          { title: "Receivable (ลูกหนี้)", url: "/receivable-aging-data", icon: FileText, permission: "bi.receivabledata.read" },
          { title: "KPI management", url: "/kpi-management-data", icon: FileText, permission: "bi.kpimanagementdata.read" },
          { title: "KPIRanking (กลุ่ม)", url: "/ranking-groups-data", icon: FileText, permission: "bi.kpigroupdata.read" },
          { title: "KPIRanking (พนักงาน)", url: "/ranking-sales-data", icon: FileText, permission: "bi.kpisalemandata.read" },
        ],
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { scaleMode, setScaleMode } = useDashboardScale()
  const { state, setOpen, setOpenMobile, isMobile } = useSidebar()

  const hasPermission = (permission: string) => checkPermission(user?.permissions, permission)

  // Hide sidebar on auth pages
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  // กรองเมนูตามสิทธิ์
  const filteredMenuItems = menuItems.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // ถ้าไม่มี permission หรือมีสิทธิ์ ให้แสดง
      if (!item.permission || hasPermission(item.permission)) {
        return true
      }
      // ถ้าไม่มีสิทธิ์ที่ตัวแม่ แต่มีสิทธิ์ที่ตัวลูกสักตัว ก็ให้แสดงตัวแม่
      if (item.subItems) {
        return item.subItems.some(sub => !sub.permission || hasPermission(sub.permission))
      }
      return false
    }).map(item => ({
      ...item,
      subItems: item.subItems?.filter(sub => !sub.permission || hasPermission(sub.permission))
    }))
  }))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SystemSwitcher />
      </SidebarHeader>
      <SidebarContent className="h-full w-full [&>[data-orientation=horizontal]]:hidden">
        {filteredMenuItems.map((group) => (
          <SidebarGroup key={group.title || "main"}>
            {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.subItems && item.subItems.length > 0) {
                    // ตรวจสอบว่าหน้าปัจจุบันอยู่ใน subItems หรือไม่
                    const isCurrentPageInSubItems = item.subItems.some(subItem => pathname === subItem.url)
                    return (
                      <Collapsible key={item.title} asChild defaultOpen={isCurrentPageInSubItems}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.title} onClick={() => state === "collapsed" && setOpen(true)}>
                              <item.icon />
                              <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems.map((subItem) => {
                                const SubIcon = subItem.icon || FileText
                                const isActive = pathname === subItem.url
                                return (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild size="sm" isActive={isActive} onClick={() => isMobile ? setOpenMobile(false) : setOpen(false)}>
                                      <Link href={subItem.url}>
                                        <SubIcon />
                                        <span className="group-data-[collapsible=icon]:hidden">{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  // แสดงเฉพาะเมนูที่ไม่มี subItems หรือ subItems ถูกกรองออกหมดแล้วแต่ยังมีสิทธิ์ที่ตัวมันเอง
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive} onClick={() => isMobile ? setOpenMobile(false) : setOpen(false)}>
                        <Link href={item.url}>
                          <item.icon />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2">
          <div className="flex justify-center">
            <DashboardControl
              scaleValue={scaleMode}
              onScaleChange={setScaleMode}
            />
          </div>
          <UserMenu
            name={user?.username || "Guest"}
            email={user?.email || ""}
            avatarSrc={user?.avatarUrl}
            className="group-data-[collapsible=icon]:justify-center"
          />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
