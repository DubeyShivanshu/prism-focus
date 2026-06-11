import { useEffect } from 'react'
import { useSessionStore } from '../../store/sessionStore'
import { formatDistanceToNow } from 'date-fns'

// Status config 
const STATUS_MAP = {
  completed: { label: 'Completed', color: 'var(--emerald)', bg: 'rgba(16,185,129,0.12)', icon: '✓' },
  abandoned: { label: 'Abandoned', color: 'var(--amber)',   bg: 'rgba(245,158,11,0.12)',  icon: '✕' },
  active:    { label: 'Active',    color: 'var(--indigo)',  bg: 'rgba(79,70,229,0.12)',   icon: '▶' },
}

const TYPE_ICONS = {
  pomodoro:  '◷',
  deep_work: '◈',
  custom:    '⬡',
}

// Single session row 
function SessionRow({ session }) {
  const s      = STATUS_MAP[session.status] || STATUS_MAP.completed
  const icon   = TYPE_ICONS[session.type] || '◷'
  const dur    = session.actualDuration || session.plannedDuration || 0
  const overrides = session.overrides?.length || 0
  const when   = formatDistanceToNow(new Date(session.startTime), { addSuffix: true })

  return (
    <div style={rowStyles.row}>
      {/* Type icon */}
      <div style={rowStyles.icon}>{icon}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={rowStyles.rowTitle}>
          {session.type === 'deep_work' ? 'Deep Work' : session.type === 'pomodoro' ? 'Pomodoro' : 'Custom'}
          {overrides > 0 && (
            <span style={rowStyles.overrideBadge}>
              ⚠ {overrides}
            </span>
          )}
        </div>
        <div style={rowStyles.rowMeta}>{when}</div>
      </div>

      {/* Duration */}
      <div style={rowStyles.dur}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{dur}m</span>
      </div>

      {/* Score */}
      {session.productivityScore != null && (
        <div style={rowStyles.score}>{session.productivityScore}</div>
      )}

      {/* Status */}
      <div style={{ ...rowStyles.statusBadge, color: s.color, background: s.bg }}>
        {s.icon} {s.label}
      </div>
    </div>
  )
}

// RecentSessions 
export default function RecentSessions() {
  const { sessions, isLoading, fetchSessions } = useSessionStore()

  useEffect(() => { fetchSessions({ limit: 8 }) }, [fetchSessions])

  if (isLoading) {
    return (
      <div style={styles.card}>
        <div style={styles.header}><span style={styles.title}>Recent Sessions</span></div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <div className="spinner spinner-indigo"/>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Recent Sessions</span>
        <span style={styles.count}>{sessions.length} sessions</span>
      </div>

      {sessions.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 32, opacity: 0.3 }}>◷</span>
          <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No sessions yet</div>
          <div style={{ color: 'var(--text-4)', fontSize: 12 }}>Start your first session above</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sessions.map((s) => <SessionRow key={s._id} session={s} />)}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-1)',
  },
  count: {
    fontSize: 11,
    color: 'var(--text-3)',
    background: 'var(--bg-elevated)',
    padding: '2px 8px',
    borderRadius: 99,
    border: '1px solid var(--border)',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '40px 0',
  },
}

const rowStyles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    transition: 'background 0.15s',
  },
  icon: {
    fontSize: 18,
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--text-2)',
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-1)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  rowMeta: {
    fontSize: 11,
    color: 'var(--text-3)',
    marginTop: 2,
  },
  overrideBadge: {
    fontSize: 10,
    color: 'var(--amber)',
    background: 'rgba(245,158,11,0.1)',
    padding: '1px 6px',
    borderRadius: 4,
    fontWeight: 600,
  },
  dur: {
    color: 'var(--text-2)',
    flexShrink: 0,
  },
  score: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(79,70,229,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--indigo)',
    flexShrink: 0,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 6,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
}
