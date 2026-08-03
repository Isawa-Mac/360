import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Sarabun } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/language-context";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { Toaster } from "sonner";
import { ReloadProvider } from "@/contexts/reload-context";
import { AuthProvider } from "@/contexts/auth-context";
import { FilterProvider } from "@/contexts/filter-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { FullscreenProvider } from "@/contexts/fullscreen-context";
import { HeaderControlProvider } from "@/contexts/header-control-context";
import { ModuleProvider } from "@/contexts/module-context";
import { DashboardScaleProvider } from "@/contexts/dashboard-scale-context";
import { AppShellBackground } from "@/components/app-shell-background";
import { ThemeSync } from "@/components/theme-sync";
import { PWARegister } from "@/components/pwa-register";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "360 Intelligent",
  description: "Enterprise Resource Planning 360 Online",
  applicationName: "360 Intelligent",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "360",
  },
  icons: {
    icon: [
      {
        url: "/icons/favicon-light.png",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icons/favicon-dark.png",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/icons/favicon-light.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const appTheme = cookieStore.get("bi360_theme")?.value;
  const sharedTheme = cookieStore.get("nexus_shared_theme")?.value;
  const defaultTheme = appTheme === "dark" || appTheme === "light" ? appTheme : (sharedTheme === "dark" || sharedTheme === "light" ? sharedTheme : "system");
  const appThemeColor = cookieStore.get("bi360_theme_color")?.value;
  const sharedThemeColor = cookieStore.get("nexus_shared_theme_color")?.value;
  // Accent color: ให้ sharedThemeColor จาก SSO มาก่อน แล้วค่อย fallback สีของแอปเอง
  const themeColor = sharedThemeColor || appThemeColor;
  const sharedScale = cookieStore.get("nexus_shared_scale")?.value;
  const fontScale = sharedScale ? parseInt(sharedScale) : 100;

  return (
    <html lang="th" className={`${inter.variable} ${sarabun.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('themeLocal');if(!raw)return;var color=raw.trim();if(color.charAt(0)==='{'){var o=JSON.parse(color);color=(o.themeColor||'').trim();}if(!color)return;var s=document.documentElement.style;s.setProperty('--primary',color);s.setProperty('--sidebar-primary',color);s.setProperty('--sidebar-gradient-from','color-mix(in oklch, '+color+' 78%, black)');s.setProperty('--sidebar-gradient-via',color);s.setProperty('--sidebar-gradient-to','color-mix(in oklch, '+color+' 72%, white)');s.setProperty('--ring',color);s.setProperty('--grid-color','color-mix(in oklch, '+color+' 14%, transparent)');s.setProperty('--header-tint',color);}catch(e){}})();`,
          }}
        />
        {themeColor && (
          <style dangerouslySetInnerHTML={{
            __html: `
              :root, .dark {
                --primary: ${themeColor};
                --sidebar-primary: ${themeColor};
                --sidebar-gradient-from: color-mix(in oklch, ${themeColor} 78%, black);
                --sidebar-gradient-via: ${themeColor};
                --sidebar-gradient-to: color-mix(in oklch, ${themeColor} 72%, white);
                --ring: ${themeColor};
                --grid-color: color-mix(in oklch, ${themeColor} 14%, transparent);
                --header-tint: ${themeColor};
              }
              :root {
                font-size: ${fontScale}%;
              }
            `
          }} />
        )}
        {!themeColor && sharedScale && (
          <style dangerouslySetInnerHTML={{
            __html: `
              :root {
                font-size: ${fontScale}%;
              }
            `
          }} />
        )}
      </head>
      <body
        className={`${sarabun.className} ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <AppShellBackground />
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultTheme}
          enableSystem
          disableTransitionOnChange
        >
          <ThemeSync />
          <LanguageProvider>
            <AuthProvider>
              <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <HeaderControlProvider>
                <FullscreenProvider>
                  <ReloadProvider>
                    <DashboardScaleProvider>
                      <FilterProvider>
                        <SidebarWrapper>
                          <ModuleProvider>
                            {children}
                          </ModuleProvider>
                        </SidebarWrapper>
                      </FilterProvider>
                    </DashboardScaleProvider>
                  </ReloadProvider>
                </FullscreenProvider>
              </HeaderControlProvider>
            </SidebarProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster />
        <PWARegister />
      </body>
    </html>
  );
}
