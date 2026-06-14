import { create } from 'zustand'
import { authAPI } from '../services/api'
import { bridgeExtension } from '../services/extensionBridge'

export const useAuthStore = create((set, get) => ({
  user:            null,
  accessToken:     null,
  isAuthenticated: false,
  isLoading:       true,

  // Internal token helper
  _setToken: (token) => {
    window.__prism_access_token__ = token || null
    bridgeExtension(token)
    set({ accessToken: token })
  },

  // Initialize (called once on app mount)
  init: async () => {
    try {
      const { data } = await authAPI.refresh()
      get()._setToken(data.data.accessToken)
      set({ user: data.data.user, isAuthenticated: true })
    } catch {
      // Only clear auth state if we haven't already successfully logged in
      // (prevents background refresh from erasing a brand new OAuth login)
      if (!get().accessToken) {
        get()._setToken(null)
        set({ user: null, isAuthenticated: false })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  // Register 
  register: async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password })
    get()._setToken(data.data.accessToken)
    set({ user: data.data.user, isAuthenticated: true })
    return data.data.user
  },

  // Login 
  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    get()._setToken(data.data.accessToken)
    set({ user: data.data.user, isAuthenticated: true })
    return data.data.user
  },

  // Logout 
  logout: async () => {
    try { await authAPI.logout() } catch { /* proceed anyway */ }
    get()._setToken(null)
    set({ user: null, isAuthenticated: false })
  },

  // Update local user
  updateUser: (updates) =>
    set((s) => ({ user: s.user ? { ...s.user, ...updates } : s.user })),
}))
