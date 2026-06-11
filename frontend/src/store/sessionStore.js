import { create } from 'zustand'
import api from '../services/api'

export const useSessionStore = create((set, get) => ({
  activeSession:  null,
  sessions:       [],
  totalSessions:  0,
  isLoading:      false,
  error:          null,

  // Fetch active session 
  fetchActive: async () => {
    try {
      const { data } = await api.get('/sessions/active')
      set({ activeSession: data.data.session })
    } catch {
      set({ activeSession: null })
    }
  },

  // Fetch session list 
  fetchSessions: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get('/sessions', { params })
      set({ sessions: data.sessions, totalSessions: data.total })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load sessions' })
    } finally {
      set({ isLoading: false })
    }
  },

  // Start a session 
  startSession: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/sessions', payload)
      set({ activeSession: data.data.session, isLoading: false })
      return data.data.session
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message })
      throw err
    }
  },

  // Complete a session 
  completeSession: async (sessionId, payload = {}) => {
    const { data } = await api.patch(`/sessions/${sessionId}/complete`, payload)
    set({ activeSession: null })
    // Prepend to list
    set((s) => ({ sessions: [data.data.session, ...s.sessions] }))
    return data.data.session
  },

  //  Abandon 
  abandonSession: async (sessionId) => {
    await api.patch(`/sessions/${sessionId}/abandon`)
    set({ activeSession: null })
  },

  // Record override 
  recordOverride: async (sessionId, payload) => {
    const { data } = await api.post(`/sessions/${sessionId}/override`, payload)
    set({ activeSession: data.data.session })
  },

  clearError: () => set({ error: null }),
}))
