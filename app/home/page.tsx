"use client"

import { Layout } from '@/components/layout'
import { useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import {
  BarChart3,
  Key,
  Loader2,
  ShoppingCart,
  Globe,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { checkSSOSession, getSSOLoginUrl } from '@/lib/sso-utils'
import { usePermission } from '@/hooks/use-permission'


/**
 * เช็คว่าเป็น development environment หรือไม่ (client-side)
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * ดึง Lobbey Base URL ตาม environment (client-side)
 */
function getLobbeyBaseURL(): string {
  if (process.env.NEXT_PUBLIC_LOBBEY_URL) return process.env.NEXT_PUBLIC_LOBBEY_URL;
  return 'https://360.trirex.cloud';
}

/**
 * ดึง BI Base URL ตาม environment (client-side)
 */
function getBIBaseURL(): string {
  if (process.env.NEXT_PUBLIC_BI_URL) return process.env.NEXT_PUBLIC_BI_URL;
  return 'https://bi360.trirex.cloud';
}

/**
 * ดึง SSO Base URL ตาม environment (client-side)
 */
function getSSOBaseURL(): string {
  if (process.env.NEXT_PUBLIC_SSO_BASE_URL) return process.env.NEXT_PUBLIC_SSO_BASE_URL;
  return 'https://sso360.trirex.cloud';
}

/**
 * ดึง POS Base URL ตาม environment (client-side)
 */
function getPOSBaseURL(): string {
  if (process.env.NEXT_PUBLIC_POS_URL) return process.env.NEXT_PUBLIC_POS_URL;
  return 'https://pos360.trirex.cloud';
}

/**
 * ดึง NexDocs Base URL ตาม environment (client-side)
 */
function getNexDocsBaseURL(): string {
  if (process.env.NEXT_PUBLIC_NEXDOCS_URL) return process.env.NEXT_PUBLIC_NEXDOCS_URL;
  return 'https://nexdocs.trirex.cloud';
}

function HomePageContent() {
  const router = useRouter()
  const [loadingItem, setLoadingItem] = useState<string | null>(null)
  const { hasPermission } = usePermission()


  // Main menu items — requiredPermission ใช้ permission string จาก SSO จริง
  const menuItems = [
    {
      title: "Nexus Smart CRM 360",
      description: "Nexus Smart CRM 360 - ระบบบริหารความสัมพันธ์ลูกค้า",
      icon: Globe,
      url: "/nexus-smart-crm",
      isExternal: false,
      enabled: false, // ปิดชั่วคราว
      requiredPermission: ['erp360.erp.read'],
    },
    {
      title: "Business Intelligence 360",
      description: "Business Intelligence 360 (BI) - ระบบวิเคราะห์ข้อมูลทางธุรกิจเพื่อการตัดสินใจ",
      icon: BarChart3,
      url: getBIBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.bi.read'],
    },
    {
      title: "NexDocs 360",
      description: "NexDocs 360 DMS - ระบบจัดการเอกสารดิจิทัลอัจฉริยะที่มุ่งเน้นการเพิ่มประสิทธิภาพการทำงานด้วย AI",
      icon: FileText,
      url: "/nexdocs",
      isExternal: false,
      enabled: true,
      requiredPermission: ['erp360.docs.read'],
    },
    {
      title: "Point of Sale 360 Online",
      description: "Point of Sale 360 Online (POS) - ระบบขายหน้าร้านออนไลน์",
      icon: ShoppingCart,
      url: getPOSBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.pos.read'],
    },
    {
      title: "Single Sign-On 360",
      description: "Single Sign-On 360 (SS) - ระบบเข้าสู่ระบบแบบรวมศูนย์ด้วยบัญชีเดียว",
      icon: Key,
      url: getSSOBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.admin.read'],
    }
  ]

  const handleItemClick = async (item: typeof menuItems[0] & { isExternal?: boolean }) => {
    setLoadingItem(item.title || null)
    try {
      // เพิ่ม delay เล็กน้อยเพื่อให้เห็น loading state
      await new Promise(resolve => setTimeout(resolve, 500))

      // ถ้าเป็น external link ให้เปิดในหน้าต่างใหม่
      if (item.isExternal) {
        window.location.href = item.url
      } else {
        router.push(item.url)
      }
    } catch (error) {
      console.error('Error navigating:', error)
      setLoadingItem(null)
    }
  }



  return (
    <Layout
      showFilters={false}
      pageTitle="Nexus 360"
    >
      <div className="min-h-full p-6 relative">
        {/* Background Decorative Elements for better see-through effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Main Menu Section */}
          <div className="mb-8 relative">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
              Nexus 360
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuItems.filter(item => {
                if (item.enabled === false) return false
                if (!item.requiredPermission) return true
                return hasPermission(item.requiredPermission)
              }).map((item, index) => (
                <Card
                  key={index}
                  className={`relative hover:shadow-xl hover:bg-white/90 hover:dark:bg-gray-800/90 hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-0 ${loadingItem === item.title ? 'opacity-75 pointer-events-none' : ''
                    }`}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Loading indicator in top-right corner */}
                  {loadingItem === item.title && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        กำลังโหลด...
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 dark:bg-primary/30 rounded-lg">
                        <item.icon className="h-6 w-6 text-primary dark:text-white" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <Layout
        showFilters={false}
        pageTitle="Nexus 360"
      >
        <div className="min-h-full p-6 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-400">กำลังโหลด...</p>
          </div>
        </div>
      </Layout>
    }>
      <HomePageContent />
    </Suspense>
  )
}