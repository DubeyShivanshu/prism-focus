import { useState, useEffect } from 'react'
import StatCard      from '../../components/UI/StatCard'
import SessionTimer  from '../../components/UI/SessionTimer'
import RecentSessions from '../../components/UI/RecentSessions'
import MiniHeatmap   from '../../components/Charts/MiniHeatmap'
import { useSessionStore } from '../../store/sessionStore'
import { useAuthStore }    from '../../store/authStore'
import api from '../../services/api'

// Top Distraction card
function TopDistractionCard({ site }) {
  if (!site) return (
    <div style={cardStyle}>
      <div style={cardHeader}>
        <span style={cardTitle}>Top Distraction</span>
      </div>
      <div style={{ padding:'20px', textAlign:'center', color:'var(--text-4)', fontSize:13 }}>
        No distraction data yet 🎉
      </div>
    </div>
  )
  return (
    <div style={cardStyle}>
      <div style={cardHeader}>
        <span style={cardTitle}>Top Distraction</span>
        <span style={pill}>{site.overrideCount} overrides</span>
      </div>
      <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{
          width:40, height:40, borderRadius:10,
          background:'rgba(244,63,94,0.12)', border:'1px solid rgba(244,63,94,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
        }}>⊘</div>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)' }}>{site.name || site.domain}</div>
          <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{site.domain}</div>
        </div>
      </div>
    </div>
  )
}

// Streak Card
function StreakCard({ streak }) {
  const cur  = streak?.current || 0
  const best = streak?.best || 0
  return (
    <div style={{ ...cardStyle, background:'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(124,58,237,0.05))' }}>
      <div style={cardHeader}>
        <span style={cardTitle}>Streak</span>
      </div>
      <div style={{ padding:'16px 20px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, marginBottom:8 }}>
          <span style={{ fontSize:40, fontWeight:800, color:'var(--indigo)', lineHeight:1 }}>{cur}</span>
          <span style={{ fontSize:14, color:'var(--text-2)', marginBottom:4 }}>day{cur !== 1 ? 's' : ''}</span>
        </div>
        {/* Streak flame bar */}
        <div style={{ display:'flex', gap:4, marginBottom:10 }}>
          {Array.from({ length: Math.min(cur, 14) }).map((_, i) => (
            <div key={i} style={{
              flex:1, height:6, borderRadius:99,
              background: `rgba(79,70,229,${0.3 + (i / 14) * 0.7})`,
            }}/>
          ))}
          {Array.from({ length: Math.max(0, 14 - cur) }).map((_, i) => (
            <div key={`e${i}`} style={{
              flex:1, height:6, borderRadius:99,
              background:'var(--border)',
            }}/>
          ))}
        </div>
        <div style={{ fontSize:12, color:'var(--text-3)' }}>
          Best streak: <span style={{ color:'var(--text-2)', fontWeight:600 }}>{best} days</span>
        </div>
      </div>
    </div>
  )
}

// Dashboard
export default function Dashboard() {
  const { user }        = useAuthStore()
  const { fetchActive } = useSessionStore()

  const [summary,  setSummary]  = useState(null)
  const [heatmap,  setHeatmap]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [sum, heat] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/heatmap?days=84'),
        ])
        if (!mounted) return
        setSummary(sum.data.data.summary)
        setHeatmap(heat.data.data.heatmap)
      } catch (err) {
        console.error('Dashboard fetch failed:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    fetchActive()
    return () => { mounted = false }
  }, [fetchActive])

  const w = summary?.weekly || {}
  const hourStr = h => `${h}h`

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div style={styles.page} className="animate-fade-in">
      {/* ── Welcome bar ── */}
      <div style={styles.welcomeBar}>
        <div>
          <h1 style={styles.welcomeTitle}>
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} !
          </h1>
          <p style={styles.welcomeSub}>
            {loading ? 'Loading your stats…' : (
              w.sessions > 0
                ? `You've had ${w.sessions} session${w.sessions !== 1 ? 's' : ''} and ${w.focusMinutes} minutes of focus this week.`
                : 'Start a session below to begin your first focus block.'
            )}
          </p>
        </div>
        {/* Productivity badge */}
        {!loading && summary && (
          <div style={styles.scoreBadge}>
            <div style={styles.scoreValue}>{summary.productivityScore || 0}</div>
            <div style={styles.scoreLabel}>Productivity<br/>Score</div>
          </div>
        )}
      </div>

      {/* ── Stat cards row ── */}
      <div style={styles.statGrid} className="stagger">
        <StatCard
          label="Weekly Focus"
          value={w.focusMinutes || 0}
          unit="m"
          icon="◷"
          accent="var(--indigo)"
          sublabel="this week"
          className="animate-fade-in-up"
        />
        <StatCard
          label="Total Hours"
          value={summary?.totalFocusHours || 0}
          unit="h"
          icon="◈"
          accent="var(--violet)"
          sublabel="all time"
          isFloat
          className="animate-fade-in-up"
        />
        <StatCard
          label="Sessions"
          value={w.sessions || 0}
          icon="⬡"
          accent="var(--cyan)"
          sublabel="this week"
          className="animate-fade-in-up"
        />
        <StatCard
          label="Overrides"
          value={w.overrides || 0}
          icon="⊘"
          accent={w.overrides > 5 ? 'var(--rose)' : 'var(--emerald)'}
          sublabel={w.overrides > 5 ? 'reduce this' : 'great control'}
          className="animate-fade-in-up"
        />
      </div>

      {/* ── Main content grid ── */}
      <div style={styles.mainGrid}>
        {/* Left column */}
        <div style={styles.leftCol}>
          {/* Session Timer */}
          <SessionTimer />

          {/* Recent sessions */}
          <RecentSessions />
        </div>

        {/* Right column */}
        <div style={styles.rightCol}>
          {/* Streak */}
          <StreakCard streak={summary?.streak} />

          {/* Heatmap */}
          <MiniHeatmap data={heatmap} />

          {/* Top distraction */}
          <TopDistractionCard site={summary?.topDistraction} />
        </div>
      </div>
    </div>
  )
}

// Shared mini styles
const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  overflow: 'hidden',
}
const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 20px',
  borderBottom: '1px solid var(--border)',
}
const cardTitle = { fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }
const pill = {
  fontSize: 11,
  color: 'var(--rose)',
  background: 'rgba(244,63,94,0.1)',
  padding: '2px 8px',
  borderRadius: 99,
  border: '1px solid rgba(244,63,94,0.2)',
  fontWeight: 600,
}

// Layout styles
const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    maxWidth: 1280,
  },
  welcomeBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--text-1)',
    letterSpacing: '-0.02em',
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 14,
    color: 'var(--text-2)',
    lineHeight: 1.5,
  },
  scoreBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: 14,
    background: 'var(--gradient-brand)',
    minWidth: 90,
    boxShadow: '0 4px 20px rgba(79,70,229,0.3)',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 800,
    color: '#fff',
    lineHeight: 1,
    letterSpacing: '-0.03em',
  },
  scoreLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 1.3,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: 20,
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
}
