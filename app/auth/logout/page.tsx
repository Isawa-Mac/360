"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { clearBrowserSession } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

/** หน้า logout แบบ Microsoft: พื้นหลังขาว สะอาด "You've been signed out" */
export default function LogoutPage() {
    const { t } = useLanguage()

    useEffect(() => {
        // Also clear when SSO navigates here directly after logout.
        clearBrowserSession()
    }, [])

    const signInAgain = () => {
        const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud";
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "cli_1mkd41fz";
        window.location.href = `${ssoUrl}/#/login?client_id=${clientId}&prompt=login`;
    };

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f3f3f3]"
            style={{ fontFamily: "'Segoe UI', 'Segoe UI Web (West European)', -apple-system, 'BlinkMacSystemFont', 'Roboto', sans-serif" }}
        >
            <div className="max-w-[440px] w-full px-6 text-center">
                <h1 className="text-[28px] font-semibold text-[#1b1b1b] mb-4 tracking-tight">
                    {t("signed_out_title")}
                </h1>
                <p className="text-[15px] text-[#605e5c] leading-relaxed mb-8">
                    {t("signed_out_description")}
                </p>

                <div className="flex flex-col gap-4">
                    <Button
                        onClick={signInAgain}
                        className="w-full h-11 bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium rounded-sm"
                    >
                        {t("sign_in_another_account")}
                    </Button>
                </div>

                <p className="mt-10 text-[13px] text-[#8a8886]">
                    360
                </p>
            </div>
        </div>
    )
}
