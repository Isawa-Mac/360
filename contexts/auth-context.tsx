"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

interface User {
    id?: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    roles?: string[];
    permissions?: string[];
    isSuperAdmin?: boolean;
}

interface AuthContextType {
    user: User | null;
    token?: string;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string) => void;
    logout: () => void;
    handleCodeExchange: (code: string) => Promise<void>;
    getAuthData: () => { token?: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const redirectToSSO = (forceLogin: boolean = false) => {
        if (typeof window === "undefined") return;

        const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud";
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "cli_1mkd41fz";

        // Construct callback URL dynamically to support both localhost and production
        const callbackUrl = `${window.location.origin}/auth/sso-callback`;

        let url = `${ssoUrl}/#/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
        if (forceLogin) {
            url += "&prompt=login";
        }

        window.location.href = url;
    };

    useEffect(() => {
        // Apply theme color as early as possible
        const themeColor = localStorage.getItem('themeColor') || 'oklch(0.205 0 0)';
        if (themeColor) {
            document.documentElement.style.setProperty('--primary', themeColor);
            document.documentElement.style.setProperty('--sidebar-primary', themeColor);
            document.documentElement.style.setProperty('--ring', themeColor);
        }
    }, []);

    useEffect(() => {
        // Check local storage for Nexus SSO user first
        const nexusUser = localStorage.getItem("nexus_user");
        const nexusToken = localStorage.getItem("nexus_token");

        const isCallbackPage = typeof window !== "undefined" && (
            window.location.pathname.includes("/auth/sso-callback") ||
            window.location.search.includes("code=")
        );
        const isLogoutPage = typeof window !== "undefined" && window.location.pathname.includes("/auth/logout");

        console.log("Auth Check - SKIP_AUTH:", process.env.NEXT_PUBLIC_SKIP_AUTH);

        if (nexusUser && nexusToken) {
            try {
                const userObj = JSON.parse(nexusUser);
                const nexusInsightUser: User = {
                    username: userObj.username || userObj.email,
                    email: userObj.email,
                    avatarUrl: userObj.avatarUrl || userObj.avatar_url,
                    roles: [],
                    isSuperAdmin: userObj.username === 'admin'
                };
                setUser(nexusInsightUser);
                setIsAuthenticated(true);
                setIsLoading(false);
            } catch (e) {
                console.error("Failed to parse nexus user", e);
                setIsLoading(false);
            }
        } else if (process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
            // Bypass login for testing - set a mock guest user
            const mockPermissions = ['*'];
            const guestUser: User = {
                username: 'Guest User (Dev Mode)',
                email: 'guest@example.com',
                isSuperAdmin: true,
                permissions: mockPermissions
            };

            // Set to localStorage so usePermissions hook and other parts can find it
            if (typeof window !== "undefined") {
                localStorage.setItem("nexus_user", JSON.stringify(guestUser));
                localStorage.setItem("nexus_permissions", JSON.stringify(mockPermissions));
            }

            setUser(guestUser);
            setIsAuthenticated(true);
            setIsLoading(false);
        } else {
            // Check original nexus_insight_user for backward compatibility
            const storedUser = localStorage.getItem("nexus_insight_user");
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    setIsAuthenticated(true);
                    setIsLoading(false);
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                    setIsLoading(false);
                }
            } else {
                // If no user is found and not on callback page, redirect to SSO
                if (!isCallbackPage && !isLogoutPage) {
                    redirectToSSO();
                } else {
                    setIsLoading(false);
                }
            }
        }
    }, []);

    const login = (username: string) => {
        // This is the old local login, we can keep it or make it call redirectToSSO
        redirectToSSO();
    };

    const logout = () => {
        // Clear all auth-related state
        setUser(null);
        setIsAuthenticated(false);

        // Clear all storage and cookies
        if (typeof window !== "undefined") {
            // 1. Clear LocalStorage and SessionStorage
            localStorage.clear();
            sessionStorage.clear();

            // 2. Clear all Cookies
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                // Clear for current path, root path, and common permutations
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
            }
        }

        // Redirect to logout success page
        window.location.href = "/auth/logout";
    };

    const getAuthData = () => {
        const storedToken = localStorage.getItem("nexus_token");
        return { token: storedToken || undefined };
    };

    const handleCodeExchange = async (code: string) => {
        setIsLoading(true);
        try {
            const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "cli_1mkd41fz";

            // เรียกผ่าน API Route ของเราเอง (ปลอดภัยกว่า)
            const response = await fetch("/api/auth/exchange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, clientId }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to exchange code");
            }

            const { token, user, permissions, settings } = result.data;

            if (token && user) {
                // เก็บข้อมูลลง Storage
                localStorage.setItem("nexus_token", token);
                setToken(token);
                localStorage.setItem("nexus_user", JSON.stringify(user));
                if (permissions) {
                    localStorage.setItem("nexus_permissions", JSON.stringify(permissions));
                    document.cookie = `permissions=${encodeURIComponent(JSON.stringify(permissions))}; path=/`;
                }
                if (settings?.primaryColor) localStorage.setItem("themeColor", settings.primaryColor);

                document.cookie = `auth_token=${token}; path=/`;

                // อัปเดต State
                const nexusUser: User = {
                    id: user.id,
                    username: user.username || user.email,
                    email: user.email,
                    avatarUrl: user.avatarUrl || user.avatar_url,
                    isSuperAdmin: user.username === 'admin'
                };
                setUser(nexusUser);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Code exchange failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, handleCodeExchange, getAuthData }}>
            {isLoading ? (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#000'
                }}>
                    <SpinnerCustom size={32} className="text-white" />
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
