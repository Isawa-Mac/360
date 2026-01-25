"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

function SSOCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleCodeExchange } = useAuth();
    const hasExchanged = useRef(false);

    useEffect(() => {
        if (hasExchanged.current) return;

        // 1. ลองอ่านจาก Query Params (?code=...)
        let code = searchParams.get("code");

        // 2. ลองอ่านจาก Hash Fragment (#code=...) - เทคนิค Client Callback
        if (!code && typeof window !== "undefined") {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            code = params.get("code");
        }

        if (code) {
            hasExchanged.current = true;
            const exchange = async () => {
                try {
                    await handleCodeExchange(code!);
                    // เมื่อสำเร็จ ให้ไปที่หน้าแรก
                    window.location.href = "/";
                } catch (e) {
                    console.error("SSO Exchange failed", e);
                    const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud";
                    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "cli_1mkd41fz";
                    const redirectUri = typeof window !== "undefined"
                        ? `${window.location.protocol}//${window.location.host}/auth/sso-callback`
                        : "https://360.trirex.cloud/auth/sso-callback";
                    window.location.href = `${ssoUrl}/#/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&error=ExchangeFailed`;
                }
            };
            exchange();
        } else {
            console.error("No code found in URL or Hash");
        }
    }, [searchParams, handleCodeExchange]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black text-white p-6">
            <div className="flex flex-col items-center gap-6 max-w-md text-center">
                <div className="space-y-2">
                    {/* No spinner as requested */}
                </div>
            </div>
        </div>
    );
}

export default function SSOCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg"></div>
            </div>
        }>
            <SSOCallbackContent />
        </Suspense>
    );
}
