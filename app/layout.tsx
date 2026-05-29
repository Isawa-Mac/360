import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Sarabun } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: "360",
  description: "Enterprise Resource Planning 360 Online",
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
    <html lang="th" className={`${inter.variable} ${sarabun.variable}`} suppressHydrationWarning>
      <head>
        {themeColor && (
          <style dangerouslySetInnerHTML={{
            __html: `
              :root, .dark {
                --primary: ${themeColor};
                --sidebar: ${themeColor};
                --sidebar-primary: ${themeColor};
                --ring: ${themeColor};
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
        className={`${sarabun.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultTheme}
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
