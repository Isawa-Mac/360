"use client"

import { useAuth } from "@/contexts/auth-context"
import { useMemo, useState, useEffect } from "react"

/**
 * Custom hook สำหรับตรวจสอบ permission จาก auth context และ API
 * @returns Object ที่มี functions สำหรับตรวจสอบ permission
 */
export function usePermission() {
  const { user, token, isAuthenticated, getAuthData } = useAuth()
  const [permissionsData, setPermissionsData] = useState<{
    permissions: string[]
    isSuperAdmin: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user permissions from API
  useEffect(() => {
    const fetchPermissions = async () => {
      // เช็คว่าอยู่ในหน้า logout หรือไม่
      if (typeof window !== 'undefined' && window.location.pathname.includes('/logout')) {
        console.log('⚠️ usePermission - On logout page, skipping API call')
        setPermissionsData({ permissions: [], isSuperAdmin: false })
        setIsLoading(false)
        return
      }

      console.log('🔍 usePermission - Fetching permissions:', {
        isAuthenticated,
        hasUser: !!user,
        userId: user?.id,
        userPermissions: user?.permissions?.length || 0
      })
      
      if (!isAuthenticated || !user) {
        console.log('⚠️ usePermission - Not authenticated or no user, setting empty permissions')
        setPermissionsData({ permissions: [], isSuperAdmin: false })
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const authData = getAuthData()
        const authToken = token || authData?.token

        // เช็คว่า token เป็น JWT token จริงๆ หรือไม่ (ไม่ใช่ 'sso-session' string literal)
        const isValidJWT = authToken && 
          authToken !== 'sso-session' && 
          typeof authToken === 'string' &&
          authToken.length > 20 // JWT tokens มักจะยาวกว่า 20 characters

        console.log('🔍 usePermission - Calling /api/sso/permissions', {
          hasToken: !!authToken,
          isValidJWT,
          tokenType: authToken === 'sso-session' ? 'sso-session' : 'jwt'
        })
        
        const response = await fetch('/api/sso/permissions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // ส่ง Authorization header เฉพาะเมื่อเป็น JWT token จริงๆ
            // API endpoint ใช้ cookies สำหรับ SSO session authentication
            ...(isValidJWT && { 'Authorization': `Bearer ${authToken}` }),
          },
          credentials: 'include',
        })

        console.log('🔍 usePermission - Response status:', response.status)

        // Handle 401 (Unauthorized) - ไม่ throw error แต่ set empty permissions
        if (response.status === 401) {
          console.warn('⚠️ usePermission - 401 Unauthorized, user may have logged out')
          setPermissionsData({ permissions: [], isSuperAdmin: false })
          setIsLoading(false)
          return
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          console.error('❌ usePermission - API error:', response.status, errorText)
          // ไม่ throw error แต่ใช้ fallback permissions
          throw new Error('Failed to fetch permissions')
        }

        const result = await response.json()
        const data = result.data || { permissions: [], isSuperAdmin: false }
        
        console.log('✅ usePermission - API response:', {
          permissionsCount: data.permissions?.length || 0,
          isSuperAdmin: data.isSuperAdmin,
          userPermissionsCount: user?.permissions?.length || 0
        })
        
        // Fallback to user permissions from context if API fails
        const finalPermissions = data.permissions?.length > 0 
          ? data.permissions 
          : (user?.permissions || [])
        const finalIsSuperAdmin = data.isSuperAdmin !== undefined 
          ? data.isSuperAdmin 
          : (user?.isSuperAdmin || false)

        console.log('✅ usePermission - Final permissions:', {
          permissionsCount: finalPermissions.length,
          isSuperAdmin: finalIsSuperAdmin,
          permissions: finalPermissions.slice(0, 5) // แสดง 5 ตัวแรก
        })

        setPermissionsData({
          permissions: finalPermissions,
          isSuperAdmin: finalIsSuperAdmin,
        })
      } catch (error) {
        console.error('❌ usePermission - Error fetching permissions:', error)
        // ถ้าไม่ authenticated หรือไม่มี user แล้ว ให้ set empty permissions
        if (!isAuthenticated || !user) {
          setPermissionsData({ permissions: [], isSuperAdmin: false })
        } else {
          // Fallback to user permissions from context
          const fallbackPermissions = user?.permissions || []
          console.log('⚠️ usePermission - Using fallback permissions:', {
            permissionsCount: fallbackPermissions.length,
            permissions: fallbackPermissions.slice(0, 5)
          })
          setPermissionsData({
            permissions: fallbackPermissions,
            isSuperAdmin: user?.isSuperAdmin || false,
          })
        }
      } finally {
        setIsLoading(false)
        console.log('✅ usePermission - Loading complete')
      }
    }

    fetchPermissions()
  }, [isAuthenticated, user?.id, token, getAuthData, user])

  const permissions = useMemo(() => {
    return permissionsData?.permissions || user?.permissions || []
  }, [permissionsData?.permissions, user?.permissions])

  const isSuperAdmin = useMemo(() => {
    return permissionsData?.isSuperAdmin || user?.isSuperAdmin || false
  }, [permissionsData?.isSuperAdmin, user?.isSuperAdmin])

  /**
   * ตรวจสอบว่า user มี permission นี้หรือไม่
   * @param permissionName - ชื่อ permission ที่ต้องการตรวจสอบ (เช่น 'data:create', 'user:delete')
   * หรือ array ของ permissions (จะ return true ถ้ามี permission ใด permission หนึ่ง)
   * @returns true ถ้ามี permission
   */
  const hasPermission = useMemo(() => {
    return (permissionName: string | string[]): boolean => {
      // ถ้าเป็น superadmin ให้ return true เสมอ
      if (isSuperAdmin) {
        return true
      }

      const permissionsToCheck = Array.isArray(permissionName) ? permissionName : [permissionName]
      
      // ตรวจสอบว่ามี permission ใด permission หนึ่งหรือไม่
      return permissionsToCheck.some(perm => 
        permissions.includes(perm)
      )
    }
  }, [permissions, isSuperAdmin])

  /**
   * ตรวจสอบว่า user มี permission ใด permission หนึ่งใน array หรือไม่ (OR condition)
   * @param permissionNames - Array ของ permission names
   * @returns true ถ้ามี permission ใด permission หนึ่ง
   */
  const hasAnyPermission = useMemo(() => {
    return (permissionNames: string[]): boolean => {
      return hasPermission(permissionNames)
    }
  }, [hasPermission])

  /**
   * ตรวจสอบว่า user มี permission ทั้งหมดใน array หรือไม่ (AND condition)
   * @param permissionNames - Array ของ permission names
   * @returns true ถ้ามี permission ทั้งหมด
   */
  const hasAllPermissions = useMemo(() => {
    return (permissionNames: string[]): boolean => {
      // ถ้าเป็น superadmin ให้ return true เสมอ
      if (isSuperAdmin) {
        return true
      }

      return permissionNames.every(perm => permissions.includes(perm))
    }
  }, [permissions, isSuperAdmin])

  /**
   * ตรวจสอบว่า user มี permission สำหรับ resource และ action หรือไม่
   * รองรับหลายรูปแบบ: SSO:profile:read, sso:profile:read, profile:read
   * @param resource - ชื่อ resource (เช่น 'profile', 'bi', 'sso')
   * @param actions - Array ของ actions (เช่น ['read', 'write'])
   * @returns true ถ้ามี permission
   */
  const hasResourcePermission = useMemo(() => {
    return (resource: string, actions: string[] = ['read', 'write']): boolean => {
      if (isSuperAdmin) return true
      if (!permissions || permissions.length === 0) return false
      
      const resourceLower = resource.toLowerCase()
      
      // Map actions ที่เทียบเท่ากัน (write = create + update)
      const actionMap: Record<string, string[]> = {
        'write': ['write', 'create', 'update'],
        'create': ['create', 'write'],
        'update': ['update', 'write', 'edit'],
        'edit': ['edit', 'update', 'write'],
        'delete': ['delete', 'remove'],
      }
      
      return permissions.some(perm => {
        const permLower = perm.toLowerCase()
        // เช็คหลายรูปแบบ: module:resource:action, resource:action, หรือ resource
        return actions.some(action => {
          const actionLower = action.toLowerCase()
          const equivalentActions = actionMap[actionLower] || [actionLower]
          
          return equivalentActions.some(eqAction => {
            // เช็ครูปแบบ SSO:profile:read, sso:profile:read
            if (permLower.includes(`${resourceLower}:${eqAction}`) || 
                permLower.includes(`:${resourceLower}:${eqAction}`)) {
              return true
            }
            // เช็ครูปแบบ profile:read
            if (permLower === `${resourceLower}:${eqAction}`) {
              return true
            }
            // เช็คว่ามี resource และ action ใน permission หรือไม่
            if (permLower.includes(resourceLower) && permLower.includes(eqAction)) {
              return true
            }
            return false
          })
        })
      })
    }
  }, [permissions, isSuperAdmin])

  return {
    permissions,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasResourcePermission,
    isLoading,
  }
}