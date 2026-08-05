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
            className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-950 [color-scheme:light]"
        >
            <div className="w-full max-w-md text-center">
                <h1 className="text-2xl font-semibold">
                    {t("signed_out_title")}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {t("signed_out_description")}
                </p>

                <div className="mt-6 flex flex-col gap-4">
                    <Button
                        onClick={signInAgain}
                        className="h-11 w-full rounded-md bg-blue-600 font-medium text-white hover:bg-blue-700"
                    >
                        {t("sign_in_another_account")}
                    </Button>
                </div>

                <p className="mt-10 text-xs text-slate-500">
                    360
                </p>
            </div>
        </div>
    )
}
