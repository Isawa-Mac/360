"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

let globalIsExchanging = false; // Module-level lock for Strict Mode

function SSOCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleCodeExchange, isAuthenticated } = useAuth();
    const hasExchanged = useRef(false);

    useEffect(() => {
        // Prevent double invocation in Strict Mode / Fast remounts
        if (globalIsExchanging || hasExchanged.current) return;

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
            globalIsExchanging = true;

            const exchange = async () => {
                try {
                    await handleCodeExchange(code!);
                    // เมื่อสำเร็จ ให้ไปที่หน้าแรก
                    globalIsExchanging = false; // Reset (though we navigate away)
                    router.replace("/");
                } catch (e: any) {
                    console.error("SSO Exchange failed", e);
                    globalIsExchanging = false;

                    // RACE CONDITION CHECK:
                    // If the other "thread" succeeded, useAuth might not update fast enough,
                    // but query token from localStorage to satisfy "did it work?" check.
                    if (localStorage.getItem("nexus_token")) {
                        console.log("Token found despite error (Race condition resolved). Redirecting...");
                        router.replace("/");
                        return;
                    }

                    // Real Failure
                    // DEBUG: Show validation error instead of redirecting
                    alert(`SSO Login Failed: ${e.message}`);
                    // window.location.href = `${process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud"}/#/login?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID || "cli_1mkd41fz"}&prompt=login`;
                }
            };
            exchange();
        } else {
            console.error("No code found in URL or Hash");
        }
    }, [searchParams, handleCodeExchange, router]);

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
                {/* Empty fallback */}
            </div>
        }>
            <SSOCallbackContent />
        </Suspense>
    );
}
