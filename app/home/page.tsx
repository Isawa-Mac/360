"use client"

import { Layout } from '@/components/layout'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import {
  BarChart3,
  Key,
  ShoppingCart,
  Globe,
  FileText,
  Boxes,
  MessageCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

/** ดึง ERP Base URL ตาม environment (ให้สอดคล้องกับ CRM 360) */
function getERPBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_ERP360_URL || process.env.NEXT_PUBLIC_ERP_URL;
  return url && /^https?:\/\//.test(url) ? url : 'https://erp360.trirex.cloud';
}

/** ดึง Chat bot Base URL ตาม environment */
function getChatbotBaseURL(): string {
  const url = process.env.NEXT_PUBLIC_CHATBOT360_URL || process.env.NEXT_PUBLIC_CHATBOT_URL;
  return url && /^https?:\/\//.test(url) ? url : 'https://chatbot360.trirex.cloud/';
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
      enabled: false,
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
      pwaRoute: "/sso",
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

  const handleItemClick = (item: typeof menuItems[0] & { isExternal?: boolean, enabled?: boolean, pwaRoute?: string }) => {
    if (item.enabled === false) return
    if (item.pwaRoute) router.push(item.pwaRoute)
    else if (item.url) window.location.href = item.url
  }

  return (
    <Layout showFilters={false} hideHeader>
      <div className="relative min-h-full p-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-8">
            <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:gap-4">
              <Image src="/icons/icon-512.png?v=8" alt="360 Intelligent Logo" width={56} height={56} sizes="(max-width: 640px) 44px, 56px" className="h-11 w-11 shrink-0 object-contain sm:h-14 sm:w-14" priority />
              360 Intelligent
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {menuItems.filter(item => !item.requiredPermission || hasPermission(item.requiredPermission)).map((item) => (
                <Card
                  key={item.title}
                  className={`id-card-service transition-all duration-300 ${item.enabled === false ? 'id-card-service--disabled cursor-not-allowed' : 'cursor-pointer hover:-translate-y-2 hover:scale-105'}`}
                  onClick={() => handleItemClick(item)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="id-card-service__icon"><item.icon className="h-6 w-6" aria-hidden="true" /></div>
                      <div className="min-w-0">
                        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                          {item.title}
                          {item.enabled === false && <Badge variant="outline" className="h-4 py-0 text-[10px]">{t("coming_soon")}</Badge>}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent><CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription></CardContent>
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
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  )
}
