"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

export type DashboardControlProps = {
    /** แนวตั้งเมื่อ sidebar ปิด, แนวนอนเมื่อ sidebar เปิด */
    direction?: "row" | "column";
    className?: string;
};

export function DashboardControl({
    direction = "row",
    className,
}: DashboardControlProps) {
    const { setTheme, resolvedTheme } = useTheme();
    const { syncThemeToCookie } = useAuth();
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === 'dark';

    const toggleTheme = () => {
        const next = isDark ? 'light' : 'dark';
        setTheme(next);
        const themeColor = typeof localStorage !== "undefined" ? localStorage.getItem("themeColor") : undefined;
        syncThemeToCookie(next, themeColor ?? undefined);
    };

    const isColumn = direction === "column";

    if (!mounted) {
        return (
            <div className={cn("flex items-center bg-transparent rounded-lg p-0.5 border border-border/50 opacity-50", isColumn && "flex-col", className)}>
                <div className="h-7 w-7" />
            </div>
        );
    }

    return (
        <div className={cn("flex items-center bg-transparent rounded-lg p-0.5 border border-border/50", isColumn ? "flex-col" : "flex-row", className)}>
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={isDark ? t("switch_to_light") : t("switch_to_dark")}
                className="h-7 w-7 text-muted-foreground hover:bg-background hover:shadow-sm transition-all duration-200"
            >
                {isDark ? (
                    <Sun size={14} className="text-amber-500" />
                ) : (
                    <Moon size={14} className="text-slate-500" />
                )}
            </Button>
        </div>
    );
}
