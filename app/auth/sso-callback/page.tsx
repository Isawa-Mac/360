"use client";

import { useEffect, Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

function SSOCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleCodeExchange } = useAuth();
    const hasExchanged = useRef(false);
    const [error, setError] = useState<string | null>(null);

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
                    router.replace("/");
                } catch (e: any) {
                    console.error("SSO Exchange failed", e);

                    // Check local storage one last time in case race condition succeeded
                    if (typeof window !== "undefined" && localStorage.getItem("nexus_token")) {
                        router.replace("/");
                        return;
                    }

                    setError(e.message || "Unknown Error");
                }
            };
            exchange();
        } else {
            // No code found, maybe just redirect to login?
            // setError("No authorization code found.");
        }
    }, [searchParams, handleCodeExchange, router]);

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white p-6">
                <div className="flex flex-col items-center gap-6 max-w-md text-center">
                    <div className="space-y-4">
                        <div className="text-red-500 text-5xl">⚠️</div>
                        <h2 className="text-2xl font-bold tracking-tight text-red-400">Login Failed</h2>
                        <p className="text-slate-300 font-sarabun text-sm bg-slate-900 p-4 rounded border border-slate-800">
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
