"use client"

import { createContext, useContext, useEffect, useState, useMemo, useRef } from "react"

const NAVBAR_HEIGHT = 50; // Sidebar header height
const DEFAULT_BASE_HEIGHT = 900; // Standard dashboard height for scaling calculation

interface DashboardScaleContextType {
    scaleMode: "normal" | "fit"
    setScaleMode: (mode: "normal" | "fit") => void
    scale: number
    isMobile: boolean
    containerStyle: React.CSSProperties
    contentStyle: React.CSSProperties
    contentRef: React.RefObject<HTMLDivElement | null>
}

const DashboardScaleContext = createContext<DashboardScaleContextType | undefined>(undefined)

// Helper to detect mobile device
function isMobileDevice() {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function DashboardScaleProvider({ children }: { children: React.ReactNode }) {
    const [scaleMode, setScaleMode] = useState<"normal" | "fit">("normal")
    const [scale, setScale] = useState(1)
    const [isMobile, setIsMobile] = useState(false)
    const [mounted, setMounted] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    // Load saved settings
    useEffect(() => {
        setMounted(true)
        const savedMode = localStorage.getItem("dashboard-scale-mode") as "normal" | "fit"
        if (savedMode) {
            setScaleMode(savedMode)
        }
    }, [])

    // Handle resize & mobile check and Calculate scale
    useEffect(() => {
        if (!mounted) return;

        const handleCheckMobile = () => {
            const mobile = isMobileDevice();
            setIsMobile(mobile);
        };

        handleCheckMobile();
        window.addEventListener('resize', handleCheckMobile);

        const handleResize = () => {
            if (isMobileDevice() || scaleMode === "normal") {
                setScale(1);
                return;
            }

            if (!contentRef.current) return;

            const contentHeight = contentRef.current.scrollHeight;
            const availableHeight = window.innerHeight - NAVBAR_HEIGHT - 32; // Subtract header and padding

            if (contentHeight > 0) {
                const scaleValue = availableHeight / contentHeight;
                setScale(Math.max(scaleValue, 0.2));
            }
        };

        const observer = new ResizeObserver(handleResize);
        if (contentRef.current) {
            observer.observe(contentRef.current);
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('resize', handleCheckMobile);
        };
    }, [scaleMode, mounted]);

    const handleSetScaleMode = (mode: "normal" | "fit") => {
        setScaleMode(mode)
        localStorage.setItem("dashboard-scale-mode", mode)
    }

    // Generate styles based on current state
    const styles = useMemo(() => {
        if (!mounted) return { container: {}, content: {} };

        if (isMobile || scaleMode === "normal") {
            return {
                container: {
                    height: '100%',
                    width: '100%',
                    overflowY: 'auto' as const,
                    overflowX: 'hidden' as const,
                },
                content: {
                    transform: 'none',
                    width: '100%',
                    height: 'auto'
                }
            };
        }

        // Fit mode styles
        return {
            container: {
                height: '100%',
                width: '100%',
                overflow: 'hidden' as const,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
            },
            content: {
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                width: '100%',
                height: 'auto',
            }
        };
    }, [scaleMode, scale, isMobile, mounted]);

    return (
        <DashboardScaleContext.Provider value={{
            scaleMode,
            setScaleMode: handleSetScaleMode,
            scale,
            isMobile,
            containerStyle: styles.container,
            contentStyle: styles.content,
            contentRef
        }}>
            {children}
        </DashboardScaleContext.Provider>
    )
}

export function useDashboardScale() {
    const context = useContext(DashboardScaleContext)
    // Return default values if context is missing (to prevent crash if used outside provider during dev)
    if (context === undefined) {
        return {
            scaleMode: "normal" as const,
            setScaleMode: () => { },
            scale: 1,
            isMobile: false,
            containerStyle: {},
            contentStyle: {},
            contentRef: { current: null }
        }
    }
    return context
}
