import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// ─── OAuth Callback Handler ───────────────────────────────────────────────────
// The backend redirects here after Google OAuth:
//   /auth/callback?token=<accessToken>   ← success
//   /auth/callback?error=<reason>        ← failure
export default function AuthCallback() {
  const navigate       = useNavigate()
  const [params]       = useSearchParams()
  const [status, setStatus] = useState('Processing…')
  const _setToken = useAuthStore(s => s._setToken)

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      const messages = {
        google_auth_failed:   'Google sign-in was cancelled or failed.',
        oauth_not_configured: 'Google OAuth is not configured on this server.',
      }
      setStatus(messages[error] || 'Authentication failed.')
      setTimeout(() => navigate('/login', { replace: true }), 2500)
      return
    }

    if (!token) {
      setStatus('No token received. Redirecting…')
      setTimeout(() => navigate('/login', { replace: true }), 2000)
      return
    }

    // Store the access token first
    _setToken(token)

    // Fetch user profile directly using the access token
    // Do NOT call init() — it triggers POST /api/auth/refresh which causes
    // "token reuse detected" when StrictMode fires the effect twice.
    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.user) {
          useAuthStore.setState({
            user:            data.data.user,
            isAuthenticated: true,
            isLoading:       false,
          })
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/login', { replace: true })
        }
      })
      .catch(() => navigate('/login', { replace: true }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isError = params.get('error')

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <svg width={40} height={40} viewBox="0 0 48 48" fill="none" style={{ marginBottom: 20 }}>
          <polygon points="24,3 45,42 3,42" fill="url(#cb-grad)" />
          <defs>
            <linearGradient id="cb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>

        {/* Spinner or error icon */}
        {isError ? (
          <div style={{ fontSize: 36, marginBottom: 14 }}>⚠️</div>
        ) : (
          <div style={styles.spinner} />
        )}

        <div style={styles.title}>
          {isError ? 'Sign-in Failed' : 'Signing you in…'}
        </div>
        <div style={styles.sub}>{status}</div>

        {isError && (
          <button onClick={() => navigate('/login')} style={styles.btn}>
            Back to Login
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-base)',
  },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 20, padding: '40px 48px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    minWidth: 320,
  },
  spinner: {
    width: 40, height: 40, borderRadius: '50%', marginBottom: 20,
    border: '3px solid var(--bg-elevated)',
    borderTop: '3px solid var(--indigo)',
    animation: 'spin 0.8s linear infinite',
  },
  title: {
    fontSize: 18, fontWeight: 800, color: 'var(--text-1)',
    letterSpacing: '-0.02em', marginBottom: 8,
  },
  sub: {
    fontSize: 13, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5,
  },
  btn: {
    marginTop: 20, padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700,
    background: 'var(--gradient-brand)', border: 'none', color: '#fff',
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
  },
}
