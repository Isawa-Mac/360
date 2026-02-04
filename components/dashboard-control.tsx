"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === 'dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
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
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
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
