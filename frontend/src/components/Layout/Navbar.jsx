import { useLocation } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'

// Route → Title map
const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/analytics':    'Analytics',
  '/coach':        'Saathi Coach',
  '/sites':        'Blocked Sites',
  '/achievements': 'Achievements',
  '/settings':     'Settings',
}

// Navbar
export default function Navbar({ onMenuToggle }) {
  const { pathname }     = useLocation()
  const { activeSession } = useSessionStore()

  const title = PAGE_TITLES[pathname] || 'Prism'
  const now   = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <header style={styles.navbar}>
      {/* Hamburger — mobile only */}
      <button
        className="hamburger-btn"
        onClick={onMenuToggle}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Page title */}
      <div>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>
          {now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Right cluster */}
      <div style={styles.right}>
        {/* Active session pill */}
        {activeSession && (
          <div style={styles.sessionPill}>
            <span style={styles.sessionDot}/>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--emerald)', fontFamily:'var(--font-mono)' }}>
              Session active
            </span>
          </div>
        )}

        {/* Clock */}
        <div style={styles.clock}>{timeStr}</div>
      </div>
    </header>
  )
}

const styles = {
  navbar: {
    height: 60,
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    background: 'var(--bg-surface)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--text-1)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 11,
    color: 'var(--text-3)',
    marginTop: 1,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  sessionPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 99,
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--emerald)',
    animation: 'glow-pulse 2s infinite',
    display: 'inline-block',
  },
  clock: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--text-3)',
    letterSpacing: '0.05em',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 15,
    transition: 'background 0.15s',
    color: 'var(--text-2)',
  },
}
