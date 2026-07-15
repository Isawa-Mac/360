"use client"

import { Layout } from '@/components/layout'
import { useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import {
  BarChart3,
  Key,
  Loader2,
  ShoppingCart,
  Globe,
  FileText,
  Boxes,
  MessageCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePermission } from '@/hooks/use-permission'
import { useLanguage } from '@/contexts/language-context'


/**
 * เช็คว่าเป็น development environment หรือไม่ (client-side)
 */
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

/** ดึง ERP Base URL ตาม environment (ให้สอดคล้องกับ CRM 360) */
function getERPBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_ERP360_URL || process.env.NEXT_PUBLIC_ERP_URL;
  return url && /^https?:\/\//.test(url) ? url : 'https://erp360.trirex.cloud';
}

/** ดึง Chat bot Base URL ตาม environment */
function getChatbotBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_CHATBOT360_URL || process.env.NEXT_PUBLIC_CHATBOT_URL;
  return url && /^https?:\/\//.test(url) ? url : 'https://hermes.trirex.cloud/chat';
}

/**
 * ดึง POS Base URL ตาม environment (client-side)
 */
function getPOSBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_POS_URL || 'https://pos360.trirex.cloud';
  return url.startsWith('http://') || url.startsWith('https://') ? url : 'https://pos360.trirex.cloud';
}

/**
 * ดึง NexDocs Base URL ตาม environment (client-side)
 */
function getNexDocsBaseURL(): string {
  if (process.env.NEXT_PUBLIC_NEXDOCS_URL) return process.env.NEXT_PUBLIC_NEXDOCS_URL;
  return 'https://nexdocs360.trirex.cloud';
}

function HomePageContent() {
  const router = useRouter()
  const [loadingItem, setLoadingItem] = useState<string | null>(null)
  const { hasPermission } = usePermission()
  const { t } = useLanguage()


  // Main menu items — requiredPermission ใช้ permission string จาก SSO จริง
  const menuItems = [
    {
      title: "CRM 360 Intelligent",
      description: t("crm_description"),
      icon: Globe,
      url: "https://crm360.trirex.cloud",
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.crm.read'],
    },
    {
      title: "ERP 360 Intelligent",
      description: t("erp_description"),
      icon: Boxes,
      url: getERPBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.erp.read'],
    },
    {
      title: "Business Intelligence 360",
      description: t("bi_description"),
      icon: BarChart3,
      url: getBIBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.bi.read'],
    },
    {
      title: "NexDocs 360 Intelligent",
      description: t("nexdocs_description"),
      icon: FileText,
      url: getNexDocsBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.nexdocs.full', 'erp360.nexdocs.read'],
    },
    {
      title: "Point of Sale 360 Online Intelligent",
      description: t("pos_description"),
      icon: ShoppingCart,
      url: getPOSBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.pos.read'],
    },
    {
      title: "Single Sign-On 360 Intelligent",
      description: t("sso_description"),
      icon: Key,
      url: getSSOBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.admin.read'],
    },
    {
      title: "Chat bot 360 Intelligent",
      description: t("chatbot_description"),
      icon: MessageCircle,
      url: getChatbotBaseURL(),
      isExternal: true,
      enabled: true,
      requiredPermission: ['erp360.chatbot.read'],
    }
  ]

  const handleItemClick = async (item: typeof menuItems[0] & { isExternal?: boolean, enabled?: boolean }) => {
    if (item.enabled === false) return // ไม่ให้กดถ้าโดน disable

    setLoadingItem(item.title || null)
    try {
      // เพิ่ม delay เล็กน้อยเพื่อให้เห็น loading state
      await new Promise(resolve => setTimeout(resolve, 500))

      if (item.isExternal || item.url.startsWith('http')) {
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
      pageTitle="360 Intelligent"
    >
      <div className="min-h-full p-6 relative">
        <div className="max-w-7xl mx-auto">
          {/* Main Menu Section */}
          <div className="mb-8 relative">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
              360 Intelligent
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuItems.filter(item => {
                if (!item.requiredPermission) return true
                return hasPermission(item.requiredPermission)
              }).map((item, index) => (
                <Card
                  key={index}
                  className={`relative transition-all duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-0 
                    ${item.enabled === false
                      ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none'
                      : 'hover:shadow-xl hover:bg-white/90 hover:dark:bg-gray-800/90 hover:scale-105 hover:-translate-y-2 cursor-pointer'
                    } 
                    ${loadingItem === item.title ? 'opacity-75 pointer-events-none' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  {/* Loading indicator in top-right corner */}
                  {loadingItem === item.title && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        {t("loading")}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 dark:bg-primary/30 rounded-lg">
                        <item.icon className="h-6 w-6 text-primary dark:text-white" />
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {item.title}
                        {item.enabled === false && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 bg-gray-100 dark:bg-gray-800">
                            {t("coming_soon")}
                          </Badge>
                        )}
                      </CardTitle>
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
      <HomeLoadingFallback />
    }>
      <HomePageContent />
    </Suspense>
  )
}

function HomeLoadingFallback() {
  const { t } = useLanguage()

  return (
    <Layout
      showFilters={false}
      pageTitle="360 Intelligent"
    >
      <div className="min-h-full p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("loading")}</p>
        </div>
      </div>
    </Layout>
  )
}
