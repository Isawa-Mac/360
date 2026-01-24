"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ReloadContextType {
    triggerReload: () => void;
    onReload: (callback: () => void) => void;
    removeReloadListener: (callback: () => void) => void;
}

const ReloadContext = createContext<ReloadContextType | undefined>(undefined);

export function ReloadProvider({ children }: { children: React.ReactNode }) {
    const [reloadListeners, setReloadListeners] = useState<(() => void)[]>([]);

    const triggerReload = useCallback(() => {
        reloadListeners.forEach(listener => {
            try {
                listener();
            } catch (error) {

            }
        });
    }, [reloadListeners]);

    const onReload = useCallback((callback: () => void) => {
        setReloadListeners(prev => [...prev, callback]);
    }, []);

    const removeReloadListener = useCallback((callback: () => void) => {
        setReloadListeners(prev => prev.filter(listener => listener !== callback));
    }, []);

    return (
        <ReloadContext.Provider value={{ triggerReload, onReload, removeReloadListener }}>
            {children}
        </ReloadContext.Provider>
    );
}

export function useReload() {
    const context = useContext(ReloadContext);
    if (context === undefined) {
        throw new Error('useReload must be used within a ReloadProvider');
    }
    return context;
}
