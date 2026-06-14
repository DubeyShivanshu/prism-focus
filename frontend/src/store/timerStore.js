import { create } from 'zustand'
import api from '../services/api'

const SESSION_CONFIGS = {
  pomodoro:  { label: 'Pomodoro',  minutes: 25, breakMinutes: 5  },
  deep_work: { label: 'Deep Work', minutes: 90, breakMinutes: 15 },
  custom:    { label: 'Custom',    minutes: 45, breakMinutes: 10 },
}

export const useTimerStore = create((set, get) => ({
  // Config
  sessionType:    'pomodoro',
  customMinutes:  45,

  // Runtime
  phase:          'idle',   // idle | running | paused | break | completed
  timeLeft:       25 * 60,  // seconds
  totalSeconds:   25 * 60,
  activeSession:  null,
  todaySessions:  [],

  // Selectors 
  getConfig: () => {
    const { sessionType, customMinutes } = get()
    const cfg = SESSION_CONFIGS[sessionType]
    return sessionType === 'custom' ? { ...cfg, minutes: customMinutes } : cfg
  },

  // Set session type 
  setType: (type) => {
    if (get().phase !== 'idle') return
    const cfg   = SESSION_CONFIGS[type]
    const mins  = cfg.minutes
    set({ sessionType: type, timeLeft: mins * 60, totalSeconds: mins * 60 })
  },

  setCustomMinutes: (m) => {
    const mins = Math.max(5, Math.min(180, m))
    set({ customMinutes: mins, timeLeft: mins * 60, totalSeconds: mins * 60 })
  },

  // Tick (called by interval)
  tick: () => {
    const { timeLeft } = get()
    if (timeLeft <= 1) {
      get()._autoComplete()
      return
    }
    set({ timeLeft: timeLeft - 1 })
  },

  // Start session
  start: async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const { sessionType, getConfig, phase } = get()
    if (phase === 'running') return
    const cfg = getConfig()

    if (phase === 'paused' && get().activeSession) {
      set({ phase: 'running' })
      return
    }

    try {
      const { data } = await api.post('/sessions', {
        type: sessionType,
        plannedDuration: cfg.minutes,
      })
      set({
        activeSession: data.data.session,
        phase:         'running',
        timeLeft:      cfg.minutes * 60,
        totalSeconds:  cfg.minutes * 60,
      })
    } catch (err) {
      console.error('Failed to start session:', err)
    }
  },

  // Pause
  pause: () => {
    if (get().phase === 'running') set({ phase: 'paused' })
  },

  // Abandon
  abandon: async () => {
    const { activeSession } = get()
    if (activeSession) {
      try { await api.post(`/sessions/${activeSession._id}/abandon`) } catch {}
    }
    get()._reset()
    get().loadToday()
  },

  // Complete (manual or auto)
  complete: async (notes = '') => {
    const { activeSession } = get()
    if (activeSession) {
      try {
        await api.post(`/sessions/${activeSession._id}/complete`, { notes })
      } catch {}
    }
    set({ phase: 'completed', timeLeft: 0 })
    get().loadToday()
  },

  _autoComplete: async () => {
    // 1. Play a beep sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      
      const playBeep = (time) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, time) // A5 note
        gain.gain.setValueAtTime(0.1, time)
        osc.start(time)
        osc.stop(time + 0.4)
      }
      
      playBeep(ctx.currentTime)
      playBeep(ctx.currentTime + 0.6)
      playBeep(ctx.currentTime + 1.2)
    } catch (e) {
      console.error('Audio playback failed', e)
    }

    // 2. Show browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Prism Focus', {
        body: 'Your focus session has ended! Great job.',
        icon: '/assets/icons/icon128.png'
      })
    }

    await get().complete()
  },

  // Start break 
  startBreak: () => {
    const { getConfig } = get()
    const breakSecs = getConfig().breakMinutes * 60
    set({ phase: 'break', timeLeft: breakSecs, totalSeconds: breakSecs, activeSession: null })
  },

  endBreak: () => {
    get()._reset()
  },

  // Reset to idle 
  _reset: () => {
    const { sessionType, customMinutes } = get()
    const cfg  = SESSION_CONFIGS[sessionType]
    const mins = sessionType === 'custom' ? customMinutes : cfg.minutes
    set({ phase: 'idle', timeLeft: mins * 60, totalSeconds: mins * 60, activeSession: null })
  },

  // Load today's sessions
  loadToday: async () => {
    try {
      const { data } = await api.get('/sessions?limit=20&status=completed')
      const sessions = data.data || []
      const today    = new Date().toDateString()
      set({ todaySessions: sessions.filter(s => new Date(s.startTime).toDateString() === today) })
    } catch {}
  },
}))
