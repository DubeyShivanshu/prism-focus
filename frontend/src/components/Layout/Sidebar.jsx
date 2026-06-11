import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// Nav Items
const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: '⬡' },
  { to: '/analytics',   label: 'Analytics',    icon: '◈' },
  { to: '/coach',       label: 'Aria Coach',   icon: '◉' },
  { to: '/sites',       label: 'Sites',        icon: '⊘' },
  { to: '/achievements',label: 'Achievements', icon: '◆' },
]

const BOTTOM_NAV = [
  { to: '/settings', label: 'Settings', icon: '⊙' },
]

// Prism Logo Mark
const LogoMark = () => (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
    <polygon points="24,3 45,42 3,42" fill="url(#sb-grad)"/>
    <line x1="24" y1="3" x2="24" y2="42" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
    <defs>
      <linearGradient id="sb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#4F46E5"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
)

// Sidebar
export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <LogoMark />
        <span style={styles.logoText}>Prism</span>

        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Main Nav */}
      <nav style={styles.nav}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{icon}</span>
            <span style={styles.navLabel}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={styles.bottom}>
        {BOTTOM_NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{icon}</span>
            <span style={styles.navLabel}>{label}</span>
          </NavLink>
        ))}

        {/* User pill */}
        <div style={styles.userPill}>
          <div style={styles.avatar}>
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : <span>{user?.name?.[0]?.toUpperCase() || 'P'}</span>
            }
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={styles.userName}>{user?.name || 'Prism User'}</div>
            <div style={styles.userScore}>
              Score: {user?.productivityScore || 0}
            </div>
          </div>
          <button
            id="sidebar-logout"
            onClick={handleLogout}
            title="Log out"
            style={styles.logoutBtn}
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  )
}

// Styles
const styles = {
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px 16px',
    borderBottom: '1px solid var(--border)',
    marginBottom: 8,
  },
  logoText: {
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: '-0.02em',
    color: 'var(--text-1)',
    flex: 1,
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '4px 8px',
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 500,
    color: 'var(--text-2)',
    textDecoration: 'none',
    transition: 'background 0.15s ease, color 0.15s ease',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    background: 'rgba(79,70,229,0.12)',
    color: 'var(--indigo)',
  },
  navIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  navLabel: {
    flex: 1,
  },
  bottom: {
    borderTop: '1px solid var(--border)',
    padding: '8px 8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    marginTop: 6,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'var(--gradient-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    overflow: 'hidden',
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-1)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userScore: {
    fontSize: 11,
    color: 'var(--text-3)',
    fontFamily: 'var(--font-mono)',
  },
  logoutBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-3)',
    fontSize: 14,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    flexShrink: 0,
  },
}
