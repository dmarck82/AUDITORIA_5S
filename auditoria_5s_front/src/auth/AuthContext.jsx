import { useCallback, useEffect, useMemo, useState } from 'react'
import api, { AUTH_PERMISSIONS_KEY, AUTH_TOKEN_KEY, AUTH_OPERATOR_KEY } from '../api/axios'
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
  const [operator, setOperator] = useState(() => parseStoredJson(AUTH_OPERATOR_KEY, null))
  const [permissions, setPermissions] = useState(() => parseStoredJson(AUTH_PERMISSIONS_KEY, []))
  const [loading, setLoading] = useState(Boolean(token))

  const clearSession = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_OPERATOR_KEY)
    localStorage.removeItem(AUTH_PERMISSIONS_KEY)
    setToken(null)
    setOperator(null)
    setPermissions([])
  }

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    const nextToken = response.data.token
    const authenticatedOperator = response.data.operator
    const authenticatedPermissions = response.data.permissions || []

    if (!nextToken) {
      throw new Error('Token was not returned by the API.')
    }

    localStorage.setItem(AUTH_TOKEN_KEY, nextToken)
    setToken(nextToken)

    if (authenticatedOperator) {
      localStorage.setItem(AUTH_OPERATOR_KEY, JSON.stringify(authenticatedOperator))
      setOperator(authenticatedOperator)
    }

    localStorage.setItem(AUTH_PERMISSIONS_KEY, JSON.stringify(authenticatedPermissions))
    setPermissions(authenticatedPermissions)

    return authenticatedOperator
  }

  const logout = () => {
    clearSession()
  }

  const hasAccess = useCallback((level) => {
    const currentLevel = Number(operator?.access_level || 0)
    const requiredLevel = Number(level || 0)

    return currentLevel >= requiredLevel
  }, [operator])

  const can = useCallback((permission) => {
    return Boolean(permissions.includes(permission))
  }, [permissions])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    const loadAuthenticatedOperator = async () => {
      try {
        const response = await api.get('/auth/me')
        const authenticatedOperator = response.data.operator
        const authenticatedPermissions = response.data.permissions || []

        setOperator(authenticatedOperator)
        localStorage.setItem(AUTH_OPERATOR_KEY, JSON.stringify(authenticatedOperator))
        setPermissions(authenticatedPermissions)
        localStorage.setItem(AUTH_PERMISSIONS_KEY, JSON.stringify(authenticatedPermissions))
      } catch (error) {
        if (error.response?.status === 404 && localStorage.getItem(AUTH_OPERATOR_KEY)) {
          return
        }

        clearSession()
      } finally {
        setLoading(false)
      }
    }

    loadAuthenticatedOperator()
  }, [token])

  const value = useMemo(
    () => ({
      token,
      operator,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      hasAccess,
      can,
      permissions,
    }),
    [token, operator, permissions, loading, hasAccess, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
