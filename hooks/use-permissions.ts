
import { useMemo } from "react"
import { getPermissionsFromCookie } from "@/lib/utils"

/**
 * Hook for checking permissions in 360 system
 * Supports checking permissions from Cookie and LocalStorage
 */
export function usePermissions(cookieName: string = "permissions") {
    const permissions = useMemo(() => {
        if (typeof window === "undefined") return []

        // 1. Try getting from Cookie first
        let perms = getPermissionsFromCookie(cookieName)

        // 2. If no cookie, check LocalStorage (set by SSO callback/login)
        if (!perms || perms.length === 0) {
            try {
                const raw = localStorage.getItem("nexus_permissions")
                perms = raw ? JSON.parse(raw) : []
            } catch (e) {
                console.error("Error parsing permissions from localStorage:", e)
            }
        }

        return perms
    }, [cookieName])

    /**
     * Check permission function
     * @param requiredPermission "module.scope.action" or "module" or array of them
     */
    const hasPermission = (requiredPermission: string | string[]): boolean => {
        if (!permissions || permissions.length === 0) return false

        // Super Admin
        if (permissions.includes("*")) return true

        const checkSingle = (perm: string) => {
            // Direct match
            if (permissions.includes(perm)) return true

            // Check with standard patterns
            // Convert to dot notation if it uses colons
            const normalizedPerm = perm.replace(/:/g, '.')

            // Also normalize user permissions for comparison? 
            // The permissions in token probably use dot notation?
            // bi360 uses dots. 

            const parts = normalizedPerm.split('.')
            const moduleName = parts[0]
            const scope = parts[1] || moduleName

            const checks = [
                `sso.${moduleName}.${scope}.full`,
                `sso.${moduleName}.${scope}.read`,
                `sso.${moduleName}.${scope}.view`,
                `sso.${moduleName}.${scope}.*`,
                `sso.${moduleName}.*`,
                `${moduleName}.${scope}.full`,
                `${moduleName}.${scope}.read`,
                `${moduleName}.${scope}.view`,
                `${moduleName}.${scope}.*`,
                `${moduleName}.*`,
                // Also check for colon notation compatibility if needed, but easier to just check normalized
            ]

            // Should also check if existing permissions in array are using colons?
            // Assuming permissions in token match the format or we normalize everything.
            // For now, let's trust the logic from bi360

            return checks.some(p => permissions.includes(p))
        }

        if (Array.isArray(requiredPermission)) {
            return requiredPermission.some(p => checkSingle(p))
        }

        return checkSingle(requiredPermission)
    }

    return { permissions, hasPermission }
}
