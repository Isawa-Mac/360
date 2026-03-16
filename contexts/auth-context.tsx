"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
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
/** โพล์ validate session ทุกกี่ ms (แบบ Microsoft 365 — logout ทุก device) */
const SESSION_VALIDATE_INTERVAL_MS = 45 * 1000;
/** โพล์ shared cookie ก่อน redirect SSO (รอ login จาก app อื่น) — ครั้งละ ms, สูงสุดกี่ครั้ง */
const SHARED_COOKIE_POLL_MS = 1500;
const SHARED_COOKIE_POLL_MAX = 6;

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

    /** forceLogin = บังคับแสดงหน้า login, silent = ลอง silent auth (prompt=none) ถ้ามี session อยู่แล้วจะ redirect กลับทันที */
    const redirectToSSO = useCallback((forceLogin: boolean = false, silent: boolean = false) => {
        if (typeof window === "undefined") return;

        const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL || "https://sso360.trirex.cloud";
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || "cli_1mkd41fz";

        let url = `${ssoUrl}/#/login?client_id=${clientId}`;
        if (forceLogin) {
            url += "&prompt=login";
        } else if (silent) {
            // ลอง silent auth ก่อน - ถ้า user login ที่ SSO แล้วจะ redirect กลับทันทีโดยไม่แสดงหน้า login
            url += "&prompt=none";
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
                document.documentElement.style.setProperty("--sidebar-primary", themeColor);
                document.documentElement.style.setProperty("--ring", themeColor);
            } else {
                const fallbackColor = localStorage.getItem("themeColor") || "oklch(0.205 0 0)";
                document.documentElement.style.setProperty("--primary", fallbackColor);
                document.documentElement.style.setProperty("--sidebar-primary", fallbackColor);
                document.documentElement.style.setProperty("--ring", fallbackColor);
            }
        }
    }, []);

    useEffect(() => {
        // Check local storage for Nexus SSO user first
        let nexusUser = localStorage.getItem("nexus_user");
        let nexusToken = localStorage.getItem("nexus_token");

        const isCallbackPage = typeof window !== "undefined" && (
            window.location.pathname.includes("/auth/sso-callback") ||
            window.location.search.includes("code=")
        );
        const isLogoutPage = typeof window !== "undefined" && window.location.pathname.includes("/auth/logout");

        console.log("Auth Check - SKIP_AUTH:", process.env.NEXT_PUBLIC_SKIP_AUTH);

        // ลอง bootstrap จาก shared cookie ก่อน (สำหรับ cross-subdomain auto-login)
        if (!isCallbackPage && !isLogoutPage) {
            if (tryBootstrapFromSharedCookie()) return;
        }

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
                // Cross-subdomain: ถ้ามี shared cookie (login จาก app อื่น) ให้ bootstrap
                if (tryBootstrapFromSharedCookie()) return;
                // ยังไม่มี shared cookie — โพล์สักครู่ (รอ auto login เมื่อมีการ login ที่ระบบอื่น)
                if (!isCallbackPage && !isLogoutPage) {
                    setPollSharedCookie(true);
                } else {
                    setIsLoading(false);
                }
            }
        }
    }, [tryBootstrapFromSharedCookie]);

    // โพล์ shared cookie ก่อน redirect ไป SSO (auto login เมื่อมีการ login ที่ระบบอื่น)
    useEffect(() => {
        if (!pollSharedCookie || typeof window === "undefined") return;
        let count = 0;
        const id = setInterval(() => {
            if (tryBootstrapFromSharedCookie()) {
                clearInterval(id);
                setPollSharedCookie(false);
                return;
            }
            count += 1;
            if (count >= SHARED_COOKIE_POLL_MAX) {
                clearInterval(id);
                setPollSharedCookie(false);
                redirectToSSO(false, true); // silent: ถ้า login ที่ SSO แล้วจะ redirect กลับทันที
            }
        }, SHARED_COOKIE_POLL_MS);
        return () => clearInterval(id);
    }, [pollSharedCookie, tryBootstrapFromSharedCookie]);

    /** โพล์ validate-token และ shared cookie — sync ตาม SSO (logout/login ที่ SSO ส่งผลทุกแอป) */
    useEffect(() => {
        if (!isAuthenticated || typeof window === "undefined") return;
        const isCallbackPage = window.location.pathname.includes("/auth/sso-callback");
        const isLogoutPage = window.location.pathname.includes("/auth/logout");
        if (isCallbackPage || isLogoutPage) return;

        const getSharedTokenFromCookie = (): string | null => {
            const cookies = document.cookie.split(";");
            for (const cookie of cookies) {
                const trimmed = cookie.trim();
                if (trimmed.startsWith("nexus_shared_token")) {
                    const eqIdx = trimmed.indexOf("=");
                    if (eqIdx === -1) continue;
                    try {
                        return decodeURIComponent(trimmed.slice(eqIdx + 1));
                    } catch { return trimmed.slice(eqIdx + 1); }
                }
            }
            return null;
        };

        let lastSharedToken = getSharedTokenFromCookie();

        const tick = async () => {
            const currentSharedToken = getSharedTokenFromCookie();
            if (!currentSharedToken && isAuthenticated) {
                setUser(null);
                setToken(undefined);
                setIsAuthenticated(false);
                redirectToSSO(false, true);
                return;
            }
            if (currentSharedToken && currentSharedToken !== lastSharedToken) {
                lastSharedToken = currentSharedToken;
            }
            const session = await checkSSOSession();
            if (session?.authenticated && session.user) {
                const u = session.user;
                const fullUser = {
                    id: u.id,
                    username: u.username || u.email,
                    email: u.email,
                    avatarUrl: u.avatarUrl,
                    permissions: u.permissions,
                    isSuperAdmin: u.permissions?.includes("*"),
                };
                setUser(fullUser);
                if (currentSharedToken && currentSharedToken !== lastSharedToken) {
                    lastSharedToken = currentSharedToken;
                    setToken(currentSharedToken);
                    localStorage.setItem("nexus_token", currentSharedToken);
                }
                localStorage.setItem("nexus_user", JSON.stringify(fullUser));
            } else if (!session?.authenticated && isAuthenticated) {
                setUser(null);
                setToken(undefined);
                setIsAuthenticated(false);
                localStorage.removeItem("nexus_token");
                localStorage.removeItem("nexus_user");
                redirectToSSO(false, true);
            }
        };

        const cookieInterval = setInterval(() => { tick().catch(() => {}); }, 2000);
        const validateInterval = setInterval(() => { tick().catch(() => {}); }, SESSION_VALIDATE_INTERVAL_MS);
        return () => {
            clearInterval(cookieInterval);
            clearInterval(validateInterval);
        };
    }, [isAuthenticated, redirectToSSO]);

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
            try {
                // 1. Preserve theme settings before clearing
                const preservedTheme = localStorage.getItem("theme");
                const preservedNexusTheme = localStorage.getItem("nexus_theme");
                const preservedThemeUser = localStorage.getItem("theme_user");
                // Also preserve per-user preference keys (theme_, vizPalette_, themeColor_)
                const userPrefKeys: { key: string; value: string }[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith("theme_") || key.startsWith("vizPalette_") || key.startsWith("themeColor_"))) {
                        const value = localStorage.getItem(key);
                        if (value) userPrefKeys.push({ key, value });
                    }
                }

                // 2. Clear LocalStorage and SessionStorage
                console.log("[Logout] Clearing localStorage and sessionStorage...");
                localStorage.clear();
                sessionStorage.clear();

                // 3. Restore theme settings
                if (preservedTheme) localStorage.setItem("theme", preservedTheme);
                if (preservedNexusTheme) localStorage.setItem("nexus_theme", preservedNexusTheme);
                if (preservedThemeUser) localStorage.setItem("theme_user", preservedThemeUser);
                userPrefKeys.forEach(({ key, value }: { key: string; value: string }) => localStorage.setItem(key, value));

                // 4. Force clear all cookies across ALL possible paths and domains
                console.log("[Logout] Nuke clearing cookies...");
                const cookies = document.cookie.split(";");

                const nukeCookie = (name: string) => {
                    const paths = ['/', '/auth', '/api'];
                    const hostname = window.location.hostname;
                    const domains = [undefined, hostname, `.${hostname}`];
                    
                    const parts = hostname.split('.');
                    if (parts.length > 2) {
                        let currentParts = [...parts];
                        while (currentParts.length > 2) {
                            currentParts.shift();
                            const parentDomain = currentParts.join('.');
                            domains.push(parentDomain);
                            domains.push(`.${parentDomain}`);
                        }
                    }
                    
                    // Also try common dev domains
                    domains.push('trirex.cloud');
                    domains.push('.trirex.cloud');

                    paths.forEach(path => {
                        domains.forEach(domain => {
                            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
                            if (domain) cookieString += `; domain=${domain}`;
                            document.cookie = cookieString;
                        });
                    });
                };

                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i];
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                    nukeCookie(name);
                }

                // Explicitly nuke shared cross-subdomain cookies
                const sharedDomain = getSharedCookieDomain() || '.trirex.cloud';
                const tenantId = localStorage.getItem("tenantId");
                const suffix = tenantId ? `_${tenantId}` : '';

                [...SHARED_COOKIE_NAMES, "nexus_shared_permissions", "nexus_shared_language", "nexus_shared_theme", "nexus_shared_theme_color"].forEach(name => {
                    nukeCookie(`${name}${suffix}`);
                    nukeCookie(name);
                });
            } catch (e) {
                console.error("[Logout] Error clearing storage:", e);
            }
        }

        // Final safety check: Clear all cookies on document again
        if (typeof document !== "undefined") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
            }
        }

        // ไปหน้า logout ของแอป (ไม่ redirect ไป SSO)
        window.location.href = '/auth/logout';
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
                    document.documentElement.style.setProperty('--sidebar-primary', themeColor);
                    document.documentElement.style.setProperty('--ring', themeColor);
                }

                document.cookie = `auth_token=${token}; path=/`;

                // Shared cookies across subdomains (e.g. *.trirex.cloud) so login once works for all apps
                const sharedDomain = getSharedCookieDomain();
                if (sharedDomain && typeof window !== "undefined") {
                    const maxAge = SHARED_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
                    const isSecure = window.location.protocol === "https:";
                    const opts = `path=/; domain=${sharedDomain}; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
                    
                    const tenantSuffix = resolvedTenantId && resolvedTenantId !== 'default_tenant' ? `_${resolvedTenantId}` : '';

                    document.cookie = `nexus_shared_token${tenantSuffix}=${encodeURIComponent(token)}; ${opts}`;
                    document.cookie = `nexus_shared_user${tenantSuffix}=${encodeURIComponent(JSON.stringify(user))}; ${opts}`;
                    if (permissions) {
                        document.cookie = `nexus_shared_permissions${tenantSuffix}=${encodeURIComponent(JSON.stringify(permissions))}; ${opts}`;
                    }
                }

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
