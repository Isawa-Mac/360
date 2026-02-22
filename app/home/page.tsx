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
  return 'https://pos.trirex.cloud';
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


  // Main menu items
  const menuItems = [
    {
      title: "CRM 360 Online",
      description: "CRM 360 Online - ระบบบริหารความสัมพันธ์ลูกค้า",
      icon: Globe,
      url: getLobbeyBaseURL(),
      isExternal: true,
      requiredPermission: ['crm360.erp'],
    },
    {
      title: "Business Intelligence 360",
      description: "Business Intelligence 360 (BI) - ระบบวิเคราะห์ข้อมูลทางธุรกิจเพื่อการตัดสินใจ",
      icon: BarChart3,
      url: getBIBaseURL(),
      isExternal: true,
      requiredPermission: ['crm360.bi'],
    },
    {
      title: "NexDocs 360",
      description: "NexDocs 360 DMS - ระบบจัดการเอกสารดิจิทัลอัจฉริยะที่มุ่งเน้นการเพิ่มประสิทธิภาพการทำงานด้วย AI",
      icon: FileText,
      url: "/nexdocs",
      isExternal: false,
      requiredPermission: ['crm360.docs'],
    },
    {
      title: "Point of Sale 360 Online",
      description: "Point of Sale 360 Online (POS) - ระบบขายหน้าร้านออนไลน์",
      icon: ShoppingCart,
      url: getPOSBaseURL(),
      isExternal: true,
      requiredPermission: ['crm360.pos'],
    },
    {
      title: "Single Sign-On 360",
      description: "Single Sign-On 360 (SS) - ระบบเข้าสู่ระบบแบบรวมศูนย์ด้วยบัญชีเดียว",
      icon: Key,
      url: getSSOBaseURL(),
      isExternal: true,
      requiredPermission: ['crm360.admin'],
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
      <div className="min-h-full p-6">
        <div className="max-w-7xl mx-auto">


          {/* Main Menu Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Nexus 360
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuItems.filter(item => {
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
                      <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                        <item.icon className="h-6 w-6 text-primary" />
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