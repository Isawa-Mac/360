"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { checkSSOSession } from "@/lib/sso-utils";

interface User {
    id?: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    roles?: string[];
    permissions?: string[];
    isSuperAdmin?: boolean;
}

/** Cookie ชื่อ theme ของแอป 360 เอง (ไม่ใช้แค่จาก SSO) */
const APP_THEME_COOKIE = "bi360_theme";
const APP_THEME_COLOR_COOKIE = "bi360_theme_color";
const THEME_COOKIE_MAX_AGE_DAYS = 365;

interface AuthContextType {
    user: User | null;
    token?: string;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string) => void;
    logout: () => void;
    handleCodeExchange: (code: string) => Promise<void>;
    getAuthData: () => { token?: string } | null;
    /** เก็บ theme/themeColor ลง cookie ของแอป 360 (ใช้เมื่อ user เปลี่ยน theme ในแอปนี้) */
    syncThemeToCookie: (theme: string, themeColor?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SHARED_COOKIE_NAMES = ["nexus_shared_token", "nexus_shared_user"] as const;
const SHARED_COOKIE_MAX_AGE_DAYS = 7;
/** อายุสัญญาณ logout (ms) - ต้องตรงกับ SHARED_LOGOUT_COOKIE_MAX_AGE_SEC ใน nexusSSO */
const SHARED_LOGOUT_MAX_AGE_MS = 120 * 1000;
// Removed: SESSION_VALIDATE_INTERVAL_MS, SHARED_COOKIE_POLL_MS, SHARED_COOKIE_POLL_MAX

const TAB_AUTH_CHANNEL = "nexus_tab_auth_v1";
type TabAuthMessage =
    | { type: "LOGOUT"; userId: string; tenantId?: string }
    | { type: "LOGIN"; userId: string; tenantId?: string };

function postTabAuthMessage(msg: TabAuthMessage, persistentChannel: BroadcastChannel | null) {
    if (typeof BroadcastChannel === "undefined") return;
    try {
        if (persistentChannel) {
            persistentChannel.postMessage(msg);
            return;
        }
        const ch = new BroadcastChannel(TAB_AUTH_CHANNEL);
        ch.postMessage(msg);
        ch.close();
    } catch {
        /* ignore */
    }
}

function nukeCookieName(name: string): void {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const paths = ["/", "/auth", "/api"];
    const hostname = window.location.hostname;
    const sharedDom = process.env.NEXT_PUBLIC_SHARED_COOKIE_DOMAIN?.trim();
    const domains: (string | undefined)[] = [
        undefined,
        hostname,
        `.${hostname}`,
        ...(sharedDom ? [sharedDom.startsWith(".") ? sharedDom : `.${sharedDom}`] : []),
    ];
    const parts = hostname.split(".");
    if (parts.length > 2) {
        let currentParts = [...parts];
        while (currentParts.length > 2) {
            currentParts.shift();
            const parentDomain = currentParts.join(".");
            domains.push(parentDomain, `.${parentDomain}`);
        }
    }
    domains.push("trirex.cloud", ".trirex.cloud");
    paths.forEach((path) => {
        domains.forEach((domain) => {
            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
            if (domain) cookieString += `; domain=${domain}`;
            document.cookie = cookieString;
        });
    });
}

function clear360AuthCookies(resolvedTenantId: string | null | undefined): void {
    if (typeof document === "undefined") return;
    const suffix = resolvedTenantId ? `_${resolvedTenantId}` : "";
    ["auth_token", "permissions"].forEach((n) => nukeCookieName(n));
    const sharedBase = [
        "nexus_shared_token",
        "nexus_shared_user",
        "nexus_shared_permissions",
        "nexus_shared_language",
        "nexus_shared_theme",
        "nexus_shared_theme_color",
    ];
    sharedBase.forEach((name) => {
        nukeCookieName(`${name}${suffix}`);
        nukeCookieName(name);
    });
}

function remove360AuthLocalStorageKeys(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        localStorage.removeItem("nexus_permissions");
        localStorage.removeItem("tenantId");
        localStorage.removeItem("nexus_insight_user");
    } catch {
        /* ignore */
    }
}

/** Returns domain for shared cookie (e.g. ".trirex.cloud") so all subdomains can read; null for localhost/single host. */
function getSharedCookieDomain(): string | null {
    if (typeof window === "undefined") return null;
    // ใช้ env บังคับ domain ได้ (เช่น .trirex.cloud)
    const envDomain = process.env.NEXT_PUBLIC_SHARED_COOKIE_DOMAIN;
    if (envDomain && envDomain.trim()) {
        const d = envDomain.trim();
        return d.startsWith(".") ? d : "." + d;
    }
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.indexOf(".") === -1) return null;
    const parts = hostname.split(".");
    if (parts.length >= 2) return "." + parts.slice(-2).join(".");
    return null;
}

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name.replace(/[\-.]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pollSharedCookie, setPollSharedCookie] = useState(false);

    const redirectToSSO = useCallback((forceLogin: boolean = false) => {
        if (typeof window === "undefined") return;

        const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud";
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "cli_1mkd41fz";

        let url = `${ssoUrl}/#/login?client_id=${clientId}`;
        if (forceLogin) {
            url += "&prompt=login";
        }

        window.location.href = url;
    }, []);

    /** ลอง bootstrap จาก shared cookie (รองรับ tenant suffix). คืน true ถ้าสำเร็จ */
    const tryBootstrapFromSharedCookie = useCallback((): boolean => {
        if (typeof document === "undefined") return false;
        
        const isCallbackPage = window.location.pathname.includes("/auth/sso-callback") || window.location.search.includes("code=");
        const isLogoutPage = window.location.pathname.includes("/auth/logout");
        if (isCallbackPage || isLogoutPage) return false;

        const cookies = document.cookie.split(";");
        let sharedToken: string | null = null;
        let foundTenantId: string | null = null;
        let sharedUser: string | null = null;
        let suffix = "";

        // 1. หา token ก่อน — ใช้วิธีเดียวกับ bi360-project (วนหา nexus_shared_token ทั้งแบบมีและไม่มี suffix)
        for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith("nexus_shared_token")) {
                const eqIdx = trimmed.indexOf("=");
                if (eqIdx === -1) continue;
                const namePart = trimmed.slice(0, eqIdx);
                const tokenVal = decodeURIComponent(trimmed.slice(eqIdx + 1));
                if (!tokenVal) continue;

                const nameParts = namePart.split("_");
                const tid = nameParts.length >= 4 ? nameParts.slice(3).join("_") : null;
                const userSuffix = tid ? `_${tid}` : "";
                const userVal = getCookie(`nexus_shared_user${userSuffix}`);

                if (userVal) {
                    sharedToken = tokenVal;
                    sharedUser = userVal;
                    foundTenantId = tid;
                    suffix = userSuffix;
                    break;
                }
            }
        }

        if (!sharedToken || !sharedUser) return false;

        try {
            const userObj = JSON.parse(sharedUser);
            console.log("🔑 [Auth] Bootstrapping from SHARED COOKIE user:", userObj.username, foundTenantId ? `(Tenant: ${foundTenantId})` : "");

            let userPermissions: string[] = [];
            try {
                const perms = getCookie(`nexus_shared_permissions${suffix}`);
                if (perms) userPermissions = JSON.parse(perms);
            } catch (_) {}
            
            if (!userPermissions.length && Array.isArray(userObj.permissions)) {
                userPermissions = userObj.permissions;
            }

            localStorage.setItem("nexus_token", sharedToken);
            setToken(sharedToken);
            localStorage.setItem("nexus_user", sharedUser);
            if (foundTenantId) {
                localStorage.setItem("tenantId", foundTenantId);
            }
            if (userPermissions.length) {
                localStorage.setItem("nexus_permissions", JSON.stringify(userPermissions));
            }

            // Theme/Color logic
            const appTheme = getCookie(APP_THEME_COOKIE);
            const appThemeColor = getCookie(APP_THEME_COLOR_COOKIE);
            const sharedTheme = getCookie("nexus_shared_theme" + suffix);
            const sharedThemeColor = getCookie("nexus_shared_theme_color" + suffix);
            
            const theme = (sharedTheme === "dark" || sharedTheme === "light")
                ? sharedTheme
                : (appTheme === "dark" || appTheme === "light" ? appTheme : null);
            const themeColor = sharedThemeColor || appThemeColor;

            if (theme) {
                localStorage.setItem("nexus_theme", theme);
                localStorage.setItem("theme", theme);
                document.documentElement.classList.toggle("dark", theme === "dark");
            }
            if (themeColor) {
                localStorage.setItem("themeColor", themeColor);
                document.documentElement.style.setProperty("--primary", themeColor);
                document.documentElement.style.setProperty("--sidebar", themeColor);
                document.documentElement.style.setProperty("--sidebar-primary", themeColor);
                document.documentElement.style.setProperty("--ring", themeColor);
            }

            const nexusInsightUser: User = {
                id: userObj.id,
                username: userObj.username || userObj.email,
                email: userObj.email,
                avatarUrl: userObj.avatarUrl || userObj.avatar_url,
                roles: [],
                permissions: userPermissions,
                isSuperAdmin: userObj.username === "admin",
            };
            setUser(nexusInsightUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            if (userObj.id) {
                postTabAuthMessage(
                    { type: "LOGIN", userId: String(userObj.id), tenantId: foundTenantId ?? undefined },
                    null
                );
            }
            return true;
        } catch (e) {
            console.error("Failed to bootstrap from shared cookie", e);
            return false;
        }
    }, []);

    function setCookie(name: string, value: string, maxAgeDays: number = THEME_COOKIE_MAX_AGE_DAYS) {
        if (typeof document === "undefined") return;
        const maxAge = maxAgeDays * 24 * 60 * 60;
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }

    const syncThemeToCookie = (theme: string, themeColor?: string) => {
        if (theme === "dark" || theme === "light") {
            setCookie(APP_THEME_COOKIE, theme);
        }
        if (themeColor !== undefined && themeColor !== "") {
            setCookie(APP_THEME_COLOR_COOKIE, themeColor);
        }
    };

    const userRef = useRef<User | null>(null);
    const isAuthenticatedRef = useRef(false);
    const channelRef = useRef<BroadcastChannel | null>(null);
    useEffect(() => {
        userRef.current = user;
    }, [user]);
    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated]);

    const logoutLocalOnly = useCallback((params: { userId?: string | null; tenantId?: string | null }) => {
        let tid: string | null = params.tenantId ?? null;
        if (tid === null && typeof window !== "undefined") {
            try {
                tid = localStorage.getItem("tenantId");
            } catch {
                tid = null;
            }
        }
        setUser(null);
        setToken(undefined);
        setIsAuthenticated(false);
        if (typeof window === "undefined") return;
        remove360AuthLocalStorageKeys();
        clear360AuthCookies(tid ?? undefined);
    }, []);

    const applySessionFromLocalStorageForUser = useCallback((expectedUserId: string) => {
        if (typeof window === "undefined") return;
        const nexusUserRaw = localStorage.getItem("nexus_user");
        const nexusToken = localStorage.getItem("nexus_token");
        if (!nexusUserRaw || !nexusToken) return;
        try {
            const userObj = JSON.parse(nexusUserRaw) as {
                id?: string;
                username?: string;
                email?: string;
                avatarUrl?: string;
                avatar_url?: string;
                permissions?: string[];
            };
            if (userObj.id !== expectedUserId) return;
            const nexusInsightUser: User = {
                id: userObj.id,
                username: userObj.username || userObj.email || "",
                email: userObj.email,
                avatarUrl: userObj.avatarUrl || userObj.avatar_url,
                roles: [],
                permissions: userObj.permissions,
                isSuperAdmin: userObj.username === "admin",
            };
            setUser(nexusInsightUser);
            setToken(nexusToken);
            setIsAuthenticated(true);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
        const ch = new BroadcastChannel(TAB_AUTH_CHANNEL);
        channelRef.current = ch;
        ch.onmessage = (event: MessageEvent<TabAuthMessage>) => {
            const msg = event.data;
            if (!msg || typeof msg !== "object") return;
            if (msg.type === "LOGOUT") {
                if (userRef.current?.id === msg.userId) {
                    let tidFromLs: string | null = null;
                    try {
                        tidFromLs = localStorage.getItem("tenantId");
                    } catch {
                        tidFromLs = null;
                    }
                    logoutLocalOnly({
                        userId: msg.userId,
                        tenantId: msg.tenantId ?? tidFromLs,
                    });
                    window.location.href = "/auth/logout";
                }
                return;
            }
            if (msg.type === "LOGIN") {
                if (isAuthenticatedRef.current && userRef.current?.id && userRef.current.id !== msg.userId) {
                    return;
                }
                applySessionFromLocalStorageForUser(msg.userId);
            }
        };
        return () => {
            ch.close();
            channelRef.current = null;
        };
    }, [logoutLocalOnly, applySessionFromLocalStorageForUser]);

    useEffect(() => {
        // อ่าน theme: ให้ shared (SSO) มาก่อน แล้วค่อย theme ของแอป 360 เอง
        if (typeof window !== "undefined") {
            const appTheme = getCookie(APP_THEME_COOKIE);
            const appThemeColor = getCookie(APP_THEME_COLOR_COOKIE);
            const sharedTheme = getCookie("nexus_shared_theme");
            const sharedThemeColor = getCookie("nexus_shared_theme_color");

            const theme =
                (sharedTheme === "dark" || sharedTheme === "light")
                    ? sharedTheme
                    : (appTheme === "dark" || appTheme === "light" ? appTheme : null);

            // Accent color: บังคับให้ใช้สีจาก SSO ก่อนเสมอ
            const themeColor = sharedThemeColor || appThemeColor;

            if (theme) {
                localStorage.setItem("nexus_theme", theme);
                localStorage.setItem("theme", theme);
                document.documentElement.classList.toggle("dark", theme === "dark");
            }

            if (themeColor) {
                localStorage.setItem("themeColor", themeColor);
                document.documentElement.style.setProperty("--primary", themeColor);
                document.documentElement.style.setProperty("--sidebar", themeColor);
                document.documentElement.style.setProperty("--sidebar-primary", themeColor);
                document.documentElement.style.setProperty("--ring", themeColor);
            } else {
                const fallbackColor = localStorage.getItem("themeColor") || "oklch(0.205 0 0)";
                document.documentElement.style.setProperty("--primary", fallbackColor);
                document.documentElement.style.setProperty("--sidebar", fallbackColor);
                document.documentElement.style.setProperty("--sidebar-primary", fallbackColor);
                document.documentElement.style.setProperty("--ring", fallbackColor);
            }
        }
    }, []);

    useEffect(() => {
        const isCallbackPage = typeof window !== "undefined" && (
            window.location.pathname.includes("/auth/sso-callback") ||
            window.location.search.includes("code=")
        );
        const isLogoutPage = typeof window !== "undefined" && window.location.pathname.includes("/auth/logout");

        // Check local storage for Nexus SSO user first
        let nexusUser = localStorage.getItem("nexus_user");
        let nexusToken = localStorage.getItem("nexus_token");

        if (!isCallbackPage && !isLogoutPage) {
            if (tryBootstrapFromSharedCookie()) return;
        }

        nexusUser = localStorage.getItem("nexus_user");
        nexusToken = localStorage.getItem("nexus_token");

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
                // ดึง session ทันทีเพื่ออัปเดต avatarUrl (แก้รูปหายตอน reload)
                checkSSOSession().then((session) => {
                    if (session?.authenticated && session.user) {
                        const u = session.user;
                        const fullUser: User = {
                            id: u.id,
                            username: u.username || u.email,
                            email: u.email,
                            avatarUrl: u.avatarUrl || userObj.avatarUrl || userObj.avatar_url,
                            roles: [],
                            permissions: u.permissions,
                            isSuperAdmin: u.permissions?.includes("*"),
                        };
                        setUser(fullUser);
                        localStorage.setItem("nexus_user", JSON.stringify(fullUser));
                    }
                }).catch(() => {});
            } catch (e) {
                console.error("Failed to parse nexus user", e);
                setIsLoading(false);
            }
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
                if (!isCallbackPage && !isLogoutPage) {
                    redirectToSSO();
                } else {
                    setIsLoading(false);
                }
            }
        }
    }, [tryBootstrapFromSharedCookie]);

    // Removed: SHARED_COOKIE_POLL useEffect


    // Removed: Auto logout and session polling useEffect


    const login = (username: string) => {
        // This is the old local login, we can keep it or make it call redirectToSSO
        redirectToSSO();
    };

    const logout = () => {
        const uid = user?.id;
        let tid: string | null = null;
        if (typeof window !== "undefined") {
            try {
                tid = localStorage.getItem("tenantId");
            } catch {
                tid = null;
            }
        }
        if (uid) {
            postTabAuthMessage({ type: "LOGOUT", userId: uid, tenantId: tid ?? undefined }, channelRef.current);
        }
        logoutLocalOnly({ userId: uid ?? null, tenantId: tid });
        window.location.href = "/auth/logout";
    };

    const getAuthData = () => {
        const storedToken = localStorage.getItem("nexus_token");
        return { token: storedToken || undefined };
    };

    const handleCodeExchange = async (code: string) => {
        // Do not set global isLoading(true) here, as it causes the AuthProvider to unmount the children (including the CallbackPage),
        // destroying the component state and causing a double-request which fails with "code expired".
        // The CallbackPage itself is responsible for showing a loading state if needed.

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
                
                // Save Tenant ID
                const resolvedTenantId = user.tenantId || 'default_tenant';
                localStorage.setItem("tenantId", resolvedTenantId);

                if (permissions) {
                    localStorage.setItem("nexus_permissions", JSON.stringify(permissions));
                    document.cookie = `permissions=${encodeURIComponent(JSON.stringify(permissions))}; path=/`;
                }
                
                // นำ theme: ใช้ของแอป 360 ก่อน แล้วค่อย shared หรือ settings
                const appTheme = getCookie(APP_THEME_COOKIE);
                const appThemeColor = getCookie(APP_THEME_COLOR_COOKIE);
                const sharedTheme = getCookie("nexus_shared_theme");
                const sharedThemeColor = getCookie("nexus_shared_theme_color");
                const theme = appTheme === "dark" || appTheme === "light" ? appTheme : (sharedTheme === "dark" || sharedTheme === "light" ? sharedTheme : null);
                if (theme) {
                    localStorage.setItem("nexus_theme", theme);
                    localStorage.setItem("theme", theme);
                    document.documentElement.classList.toggle("dark", theme === "dark");
                }
                const themeColor = appThemeColor || sharedThemeColor || settings?.primaryColor;
                if (themeColor) {
                    localStorage.setItem("themeColor", themeColor);
                    document.documentElement.style.setProperty('--primary', themeColor);
                    document.documentElement.style.setProperty('--sidebar', themeColor);
                    document.documentElement.style.setProperty('--sidebar-primary', themeColor);
                    document.documentElement.style.setProperty('--ring', themeColor);
                }

                document.cookie = `auth_token=${token}; path=/`;

                // Removed: Shared cookies creation


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
                if (nexusUser.id) {
                    postTabAuthMessage(
                        { type: "LOGIN", userId: nexusUser.id, tenantId: resolvedTenantId },
                        channelRef.current
                    );
                }
            }
        } catch (error) {
            console.error("Code exchange failed:", error);
            throw error;
        }
        // finally block removed as we are not managing global loading here anymore
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, handleCodeExchange, getAuthData, syncThemeToCookie }}>
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
