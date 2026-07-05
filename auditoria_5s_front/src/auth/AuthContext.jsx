import { useCallback, useEffect, useMemo, useState } from 'react'
import api, { AUTH_PERMISSIONS_KEY, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../api/axios'
import { AuthContext } from './authContextValue'

function parseStoredJson(key, fallback) {
  const storedValue = localStorage.getItem(key)

  if (!storedValue) {
    return fallback
  }

  try {
    return JSON.parse(storedValue)
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY))
  const [user, setUser] = useState(() => parseStoredJson(AUTH_USER_KEY, null))
  const [permissions, setPermissions] = useState(() => parseStoredJson(AUTH_PERMISSIONS_KEY, []))
  const [loading, setLoading] = useState(Boolean(token))

  const clearSession = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem(AUTH_PERMISSIONS_KEY)
    setToken(null)
    setUser(null)
    setPermissions([])
  }

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    const nextToken = response.data.token
    const authenticatedUser = response.data.user
    const authenticatedPermissions = response.data.permissions || []

    if (!nextToken) {
      throw new Error('Token was not returned by the API.')
    }

    localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
    setToken(nextToken)

    if (authenticatedUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser))
      setUser(authenticatedUser)
    }

    localStorage.setItem(AUTH_PERMISSIONS_KEY, JSON.stringify(authenticatedPermissions))
    setPermissions(authenticatedPermissions)

    return authenticatedUser
  }

  const logout = () => {
    clearSession()
  }

  const hasAccess = useCallback((level) => {
    const currentLevel = Number(user?.access_level || 0)
    const requiredLevel = Number(level || 0)

    return currentLevel >= requiredLevel
  }, [user])

  const can = useCallback((permission) => {
    return Boolean(permissions.includes(permission))
  }, [permissions])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const loadAuthenticatedUser = async () => {
      try {
        const response = await api.get('/auth/me')
        const authenticatedUser = response.data.user
        const authenticatedPermissions = response.data.permissions || []

        setUser(authenticatedUser)
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authenticatedUser))
        setPermissions(authenticatedPermissions)
        localStorage.setItem(AUTH_PERMISSIONS_KEY, JSON.stringify(authenticatedPermissions))
      } catch (error) {
        if (error.response?.status === 404 && localStorage.getItem(AUTH_USER_KEY)) {
          return
        }

        clearSession()
      } finally {
        setLoading(false)
      }
    }

    loadAuthenticatedUser()
  }, [token])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      hasAccess,
      can,
      permissions,
    }),
    [token, user, permissions, loading, hasAccess, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
