import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layout
import AppShell from './components/Layout/AppShell'

// Auth pages
import Login        from './pages/auth/Login'
import Register     from './pages/auth/Register'
import AuthCallback from './pages/auth/AuthCallback'

// Dashboard (Phase 7)
import Dashboard from './pages/dashboard/Dashboard'

// Analytics (Phase 8)
import Analytics from './pages/analytics/Analytics'

// Aria Coach (Phase 9)
import Coach from './pages/coach/Coach'

import Sites from './pages/sites/Sites'
import Pomodoro from './pages/pomodoro/Pomodoro'
import Achievements from './pages/achievements/Achievements'
import Social from './pages/social/Social'
import Settings from './pages/settings/Settings'

const pageStyle = { padding: 8, color: 'var(--text-1)' }

// Loading Splash 
function Splash() {
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', gap: 16,
    }}>
      <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
        <polygon points="24,3 45,42 3,42" fill="url(#sp-g)"/>
        <defs>
          <linearGradient id="sp-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5"/>
            <stop offset="100%" stopColor="#7C3AED"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="spinner spinner-indigo" style={{ width: 28, height: 28 }}/>
    </div>
  )
}

// Route Guards
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <Splash />
  return isAuthenticated ? (
    <AppShell>{children}</AppShell>
  ) : (
    <Navigate to="/login" replace />
  )
}

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <Splash />
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

// App
function AppRoutes() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
    // Force logout: clear state only — don't call API (session already invalid)
    const handleForceLogout = () => {
      window.__prism_access_token__ = null
      useAuthStore.setState({ user: null, isAuthenticated: false })
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [init])

  return (
    <Routes>
      {/* Guest */}
      <Route path="/login"         element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register"      element={<GuestRoute><Register /></GuestRoute>} />
      {/* Google OAuth callback — must be public, no GuestRoute guard */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected — wrapped in AppShell by ProtectedRoute */}
      <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analytics"    element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/coach"        element={<ProtectedRoute><Coach /></ProtectedRoute>} />
      <Route path="/sites"        element={<ProtectedRoute><Sites /></ProtectedRoute>} />
      <Route path="/pomodoro"     element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/social"       element={<ProtectedRoute><Social /></ProtectedRoute>} />
      <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Redirects */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
