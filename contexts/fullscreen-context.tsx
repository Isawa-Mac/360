"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FullscreenContextType {
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    setFullscreen: (fullscreen: boolean) => void;
    isHeaderHidden: boolean;
    toggleHeader: () => void;
    setHeaderHidden: (hidden: boolean) => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export function FullscreenProvider({ children }: { children: ReactNode }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);

    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
        // เมื่อเข้าสู่โหมด full screen ให้ซ่อน header โดยอัตโนมัติ
        if (!isFullscreen) {
            setIsHeaderHidden(true);
        } else {
            // เมื่อออกจากโหมด full screen ให้แสดง header กลับมา
            setIsHeaderHidden(false);
        }
    };

    const setFullscreen = (fullscreen: boolean) => {
        setIsFullscreen(fullscreen);
        if (fullscreen) {
            setIsHeaderHidden(true);
        } else {
            setIsHeaderHidden(false);
        }
    };

    const toggleHeader = () => {
        setIsHeaderHidden(prev => !prev);
    };

    const setHeaderHidden = (hidden: boolean) => {
        setIsHeaderHidden(hidden);
    };

    return (
        <FullscreenContext.Provider value={{
            isFullscreen,
            toggleFullscreen,
            setFullscreen,
            isHeaderHidden,
            toggleHeader,
            setHeaderHidden
        }}>
            {children}
        </FullscreenContext.Provider>
    );
}

export function useFullscreen() {
    const context = useContext(FullscreenContext);
    if (context === undefined) {
        throw new Error("useFullscreen must be used within a FullscreenProvider");
    }
    return context;
}
