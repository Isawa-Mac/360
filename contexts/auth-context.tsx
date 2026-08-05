"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { normalizeProfileImageSrc } from "@/lib/profile-image";
import { checkSSOSession, hasGlobalSSOLogoutSignal, revokeAllSSOSessions } from "@/lib/sso-utils";
import {
    applyThemeAccentProperties,
    getThemeLocalColor,
    resolveThemeAccentColor,
} from "@/lib/theme-local";

interface User {
    id?: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    roles?: string[];
    permissions?: string[];
    isSuperAdmin?: boolean;
}

type AvatarSource = {
    avatarUrl?: string | null;
    avatar_url?: string | null;
    image?: string | null;
    picture?: string | null;
    photoUrl?: string | null;
    photoURL?: string | null;
};

function resolveAvatarUrl(...sources: Array<AvatarSource | null | undefined>): string | undefined {
    for (const source of sources) {
        if (!source) continue;
        const candidates = [
            source.avatarUrl,
            source.avatar_url,
            source.image,
            source.picture,
            source.photoUrl,
            source.photoURL,
        ];
        const avatarUrl = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
        if (avatarUrl) {
            const normalized = normalizeProfileImageSrc(avatarUrl.trim());
            if (normalized) return normalized;
        }
    }
    return undefined;
}

function getCachedUser(): AvatarSource | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("nexus_user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getStoredTheme(): "dark" | "light" | null {
    if (typeof window === "undefined") return null;
    const storedTheme = localStorage.getItem("theme") || localStorage.getItem("nexus_theme");
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
}

function resolveThemePreference(...fallbacks: Array<string | null | undefined>): "dark" | "light" | null {
    const storedTheme = getStoredTheme();
    if (storedTheme) return storedTheme;
    for (const fallback of fallbacks) {
        if (fallback === "dark" || fallback === "light") return fallback;
    }
    return null;
}

function resolveThemeColorPreference(...fallbacks: Array<string | null | undefined>): string | null {
    const fromThemeLocal = getThemeLocalColor();
    if (fromThemeLocal) return fromThemeLocal;

    for (const fallback of fallbacks) {
        if (fallback?.trim()) return fallback.trim();
    }
    return null;
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
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    for (let index = 1; index <= pathParts.length; index += 1) {
        paths.push(`/${pathParts.slice(0, index).join("/")}`);
    }
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

export function clearBrowserSession(): void {
    if (typeof window === "undefined") return;

    // Clear all browser-side state so no app data or shared SSO value can
    // repopulate the session after logout (same behavior as crm360).
    const savedTheme = localStorage.getItem("theme");
    const savedNexusTheme = localStorage.getItem("nexus_theme");
    try {
        localStorage.clear();
        if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") localStorage.setItem("theme", savedTheme);
        if (savedNexusTheme === "light" || savedNexusTheme === "dark" || savedNexusTheme === "system") localStorage.setItem("nexus_theme", savedNexusTheme);
    } catch {
        /* ignore storage errors */
    }
    try {
        sessionStorage.clear();
    } catch {
        /* ignore storage errors */
    }

    if (typeof document === "undefined") return;
    const cookieNames = document.cookie
        .split(";")
        .map((cookie) => cookie.trim().split("=", 1)[0])
        .filter((name) => Boolean(name) && !name.startsWith("nexus_shared_logout"));
    cookieNames.forEach(nukeCookieName);
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

function applyThemeColorProperties(themeColor: string): void {
    applyThemeAccentProperties(themeColor);
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

    /** ดึง avatar/profile จาก SSO validate-token แล้ว merge กลับ state + localStorage */
    const syncUserFromSSOSession = useCallback(async (baseUser?: User) => {
        try {
            const session = await checkSSOSession();
            if (!session?.authenticated || !session.user) return;

            const u = session.user;
            let stored: AvatarSource = {};
            try {
                const raw = localStorage.getItem("nexus_user");
                stored = raw ? JSON.parse(raw) : {};
            } catch {
                stored = {};
            }

            const avatarUrl = resolveAvatarUrl(u, stored, baseUser);
            const fullUser: User = {
                id: u.id ?? baseUser?.id ?? (stored as { id?: string }).id,
                username: u.username || u.email || baseUser?.username || "",
                email: u.email ?? baseUser?.email,
                avatarUrl,
                roles: u.roles ?? baseUser?.roles ?? [],
                permissions: u.permissions ?? baseUser?.permissions,
                isSuperAdmin: u.isSuperAdmin ?? u.permissions?.includes("*") ?? baseUser?.isSuperAdmin,
            };

            setUser(fullUser);
            localStorage.setItem("nexus_user", JSON.stringify({ ...stored, ...fullUser, avatarUrl }));
        } catch {
            // ignore
        }
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
            const cachedUser = getCachedUser();
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
            
            const theme = resolveThemePreference(appTheme, sharedTheme);
            const themeColor = resolveThemeColorPreference(appThemeColor, sharedThemeColor);

            if (theme) {
                localStorage.setItem("nexus_theme", theme);
                localStorage.setItem("theme", theme);
                document.documentElement.classList.toggle("dark", theme === "dark");
            }
            if (themeColor) {
                localStorage.setItem("themeColor", themeColor);
                applyThemeColorProperties(themeColor);
            }

            const nexusInsightUser: User = {
                id: userObj.id,
                username: userObj.username || userObj.email,
                email: userObj.email,
                avatarUrl: resolveAvatarUrl(userObj, cachedUser),
                roles: [],
                permissions: userPermissions,
                isSuperAdmin: userObj.username === "admin",
            };
            localStorage.setItem("nexus_user", JSON.stringify({ ...userObj, avatarUrl: nexusInsightUser.avatarUrl }));
            setUser(nexusInsightUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            if (userObj.id) {
                postTabAuthMessage(
                    { type: "LOGIN", userId: String(userObj.id), tenantId: foundTenantId ?? undefined },
                    null
                );
            }
            void syncUserFromSSOSession(nexusInsightUser);
            return true;
        } catch (e) {
            console.error("Failed to bootstrap from shared cookie", e);
            return false;
        }
    }, [syncUserFromSSOSession]);

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
    const logoutInProgressRef = useRef(false);
    useEffect(() => {
        userRef.current = user;
    }, [user]);
    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated]);

    const logoutLocalOnly = useCallback(() => {
        setUser(null);
        setToken(undefined);
        setIsAuthenticated(false);
        if (typeof window === "undefined") return;
        clearBrowserSession();
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
                avatarUrl: resolveAvatarUrl(userObj),
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
                    logoutLocalOnly();
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
        // อ่าน theme: ให้ localStorage ของแอปมาก่อน เพื่อไม่ให้ reload ทับค่าที่ผู้ใช้เลือกไว้
        if (typeof window !== "undefined") {
            const appTheme = getCookie(APP_THEME_COOKIE);
            const appThemeColor = getCookie(APP_THEME_COLOR_COOKIE);
            const sharedTheme = getCookie("nexus_shared_theme");
            const sharedThemeColor = getCookie("nexus_shared_theme_color");

            const theme = resolveThemePreference(appTheme, sharedTheme);

            const themeColor = resolveThemeColorPreference(appThemeColor, sharedThemeColor);

            if (theme) {
                localStorage.setItem("nexus_theme", theme);
                localStorage.setItem("theme", theme);
                document.documentElement.classList.toggle("dark", theme === "dark");
            }

            if (themeColor) {
                localStorage.setItem("themeColor", themeColor);
                applyThemeColorProperties(themeColor);
            } else {
                applyThemeColorProperties(resolveThemeAccentColor(appThemeColor, sharedThemeColor));
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

        if (nexusToken === "dev-token" || nexusUser?.includes('"id":"dev-1"')) {
            localStorage.removeItem("nexus_user");
            localStorage.removeItem("nexus_token");
            localStorage.removeItem("nexus_permissions");
            nexusUser = null;
            nexusToken = null;
        }

        if (nexusUser && nexusToken) {
            try {
                const userObj = JSON.parse(nexusUser);
                const nexusInsightUser: User = {
                    username: userObj.username || userObj.email,
                    email: userObj.email,
                    avatarUrl: resolveAvatarUrl(userObj),
                    roles: [],
                    isSuperAdmin: userObj.username === 'admin'
                };
                setUser(nexusInsightUser);
                setIsAuthenticated(true);
                setIsLoading(false);
                void syncUserFromSSOSession(nexusInsightUser);
            } catch (e) {
                console.error("Failed to parse nexus user", e);
                setIsLoading(false);
            }
        } else {
            localStorage.removeItem("nexus_insight_user");
            if (!isCallbackPage && !isLogoutPage) {
                redirectToSSO();
            } else {
                setIsLoading(false);
            }
        }
    }, [tryBootstrapFromSharedCookie, redirectToSSO, syncUserFromSSOSession]);

    // Removed: SHARED_COOKIE_POLL useEffect


    // Removed: Auto logout and session polling useEffect


    const login: AuthContextType["login"] = () => {
        // This is the old local login, we can keep it or make it call redirectToSSO
        redirectToSSO();
    };

    const logout = () => {
        if (logoutInProgressRef.current || typeof window === "undefined") return;
        logoutInProgressRef.current = true;

        const uid = user?.id;
        let tid: string | null = null;
        if (typeof window !== "undefined") {
            try {
                tid = localStorage.getItem("tenantId");
            } catch {
                tid = null;
            }
        }
        const currentToken = localStorage.getItem("nexus_token");
        const finishLogout = () => {
            if (uid) {
                postTabAuthMessage({ type: "LOGOUT", userId: uid, tenantId: tid ?? undefined }, channelRef.current);
            }
            logoutLocalOnly();
            const returnUrl = `${window.location.origin}/auth/logout`;
            const ssoBaseUrl = (process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud").replace(/\/$/, "");
            const logoutParams = new URLSearchParams({ redirect_uri: returnUrl, return_url: returnUrl });
            window.location.replace(`${ssoBaseUrl}/#/logout?${logoutParams.toString()}`);
        };
        if (currentToken && uid) {
            void revokeAllSSOSessions(currentToken, uid).catch(() => undefined).finally(finishLogout);
        } else {
            finishLogout();
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const checkGlobalLogout = () => {
            if (
                hasGlobalSSOLogoutSignal() &&
                isAuthenticatedRef.current &&
                !window.location.pathname.includes("/auth/logout")
            ) {
                logoutLocalOnly();
                window.location.replace("/auth/logout");
            }
        };
        checkGlobalLogout();
        const intervalId = window.setInterval(checkGlobalLogout, 2000);
        return () => window.clearInterval(intervalId);
    }, [logoutLocalOnly]);

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
                const cachedUser = getCachedUser();
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
                
                // นำ theme: ใช้ localStorage ของแอปก่อน แล้วค่อย cookie/shared หรือ settings
                const appTheme = getCookie(APP_THEME_COOKIE);
                const appThemeColor = getCookie(APP_THEME_COLOR_COOKIE);
                const sharedTheme = getCookie("nexus_shared_theme");
                const sharedThemeColor = getCookie("nexus_shared_theme_color");
                const theme = resolveThemePreference(appTheme, sharedTheme);
                if (theme) {
                    localStorage.setItem("nexus_theme", theme);
                    localStorage.setItem("theme", theme);
                    document.documentElement.classList.toggle("dark", theme === "dark");
                }
                const themeColor = resolveThemeColorPreference(appThemeColor, sharedThemeColor, settings?.primaryColor);
                if (themeColor) {
                    localStorage.setItem("themeColor", themeColor);
                    applyThemeColorProperties(themeColor);
                }

                document.cookie = `auth_token=${token}; path=/`;

                // Removed: Shared cookies creation


                // อัปเดต State
                const nexusUser: User = {
                    id: user.id,
                    username: user.username || user.email,
                    email: user.email,
                    avatarUrl: resolveAvatarUrl(user, cachedUser),
                    isSuperAdmin: user.username === 'admin'
                };
                localStorage.setItem("nexus_user", JSON.stringify({ ...user, avatarUrl: nexusUser.avatarUrl }));
                setUser(nexusUser);
                setIsAuthenticated(true);
                if (nexusUser.id) {
                    postTabAuthMessage(
                        { type: "LOGIN", userId: nexusUser.id, tenantId: resolvedTenantId },
                        channelRef.current
                    );
                }
                await syncUserFromSSOSession(nexusUser);
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
