import { create } from 'zustand'
import api from '../services/api'

const SAATHI_WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content: `Hi! I'm **Saathi**, your Prism productivity coach. I have access to your focus data and I'm here to help you build better habits, overcome distractions, and hit your goals.\n\nWhat would you like to work on today?`,
  timestamp: new Date().toISOString(),
}

export const useCoachStore = create((set, get) => ({
  messages:    [SAATHI_WELCOME],
  suggestions: [],
  isTyping:    false,
  isLoading:   false,
  error:       null,

  // Fetch dynamic suggestions 
  fetchSuggestions: async () => {
    try {
      const { data } = await api.get('/ai/suggestions')
      set({ suggestions: data.data.suggestions })
    } catch {
      set({ suggestions: [
        'How do I get started with deep focus?',
        'What should I focus on this week?',
        'Explain cognitive friction',
        'Help me build a focus habit',
      ]})
    }
  },

  // Send a message 
  sendMessage: async (content) => {
    if (!content?.trim() || get().isTyping) return

    const userMsg = {
      id:        Date.now().toString(),
      role:      'user',
      content:   content.trim(),
      timestamp: new Date().toISOString(),
    }

    set(s => ({ messages: [...s.messages, userMsg], isTyping: true, error: null }))

    // Build history (exclude welcome + last user msg)
    const history = get().messages
      .filter(m => m.id !== 'welcome' && m.role !== 'user' || m.id !== userMsg.id)
      .slice(-12)  // last 6 exchanges
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const { data } = await api.post('/ai/chat', { message: content.trim(), history })

      const saathiMsg = {
        id:        Date.now().toString() + '-saathi',
        role:      'assistant',
        content:   data.data.reply,
        timestamp: new Date().toISOString(),
      }

      set(s => ({ messages: [...s.messages, saathiMsg], isTyping: false }))
    } catch (err) {
      const errMsg = {
        id:        Date.now().toString() + '-err',
        role:      'error',
        content:   err.response?.data?.message || 'Saathi is unavailable right now. Please check your GEMINI_API_KEY.',
        timestamp: new Date().toISOString(),
      }
      set(s => ({ messages: [...s.messages, errMsg], isTyping: false, error: errMsg.content }))
    }
  },

  clearChat: () => set({ messages: [SAATHI_WELCOME], error: null }),
}))
