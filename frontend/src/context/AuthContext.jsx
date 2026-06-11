import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

// Context 
const AuthContext = createContext(null)

// Provider 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // true while checking session
  const [error, setError] = useState(null)

  const isAuthenticated = !!user

  // Set token in memory
  const setToken = (token) => {
    window.__prism_access_token__ = token || null
  }

  // Initialize: try silent refresh on app load 
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await authAPI.refresh()
        setToken(data.data.accessToken)
        setUser(data.data.user)
      } catch {
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()

    // Listen for forced logouts (e.g., refresh token expired)
    const handleForceLogout = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  // Register
  const register = useCallback(async (name, email, password) => {
    setError(null)
    const { data } = await authAPI.register({ name, email, password })
    setToken(data.data.accessToken)
    setUser(data.data.user)
    return data.data.user
  }, [])

  // Login 
  const login = useCallback(async (email, password) => {
    setError(null)
    const { data } = await authAPI.login({ email, password })
    setToken(data.data.accessToken)
    setUser(data.data.user)
    return data.data.user
  }, [])

  // Logout 
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      setToken(null)
      setUser(null)
    }
  }, [])

  // Update local user state
  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook
export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>')
  return ctx
}
