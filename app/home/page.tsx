"use client"

import { Layout } from '@/components/layout'
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
  ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

  return (
    <Layout
      showFilters={false}
      hideHeader
    >
      <div className="min-h-full px-2 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-4xl">
          <Card className="id-card-dashboard soft-depth-card">
            <CardContent className="p-3 sm:p-5">
              <div className="mb-4 px-2 sm:px-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">360 Intelligent</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">เลือกบริการที่ต้องการ</h1>
              </div>
              <div className="space-y-2">
              {menuItems.filter(item => {
                if (!item.requiredPermission) return true
                return hasPermission(item.requiredPermission)
              }).map((item, index) => {
                const href = item.pwaRoute || item.url || '#'
                return (
                  <a
                    key={item.title}
                    href={href}
                    aria-disabled={item.enabled === false}
                    className={`id-card-dashboard__row group ${item.enabled === false ? 'id-card-dashboard__row--disabled' : ''}`}
                    onClick={(event) => {
                      if (item.enabled === false) event.preventDefault()
                      if (item.pwaRoute) {
                        event.preventDefault()
                        router.push(item.pwaRoute)
                      }
                    }}
                  >
                    <span className="id-card-dashboard__index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="id-card-dashboard__icon"><item.icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-card-foreground sm:text-base">
                        {item.title}
                        {item.enabled === false && (
                          <Badge variant="outline" className="h-5 py-0 text-[10px]">{t("coming_soon")}</Badge>
                        )}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {item.description}
                      </span>
                    </span>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                )
              })}
              </div>
            </CardContent>
          </Card>
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
