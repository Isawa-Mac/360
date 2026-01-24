"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerCustomProps {
    className?: string;
    size?: number;
    show?: boolean;
}

export function SpinnerCustom({ className, size = 24, show = true }: SpinnerCustomProps) {
    if (!show) return null;

    return (
        <div className={cn("flex justify-center items-center", className)}>
            <Loader2
                className="animate-spin text-primary"
                size={size}
            />
        </div>
    );
}
