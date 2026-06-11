import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'

// ─── Achievement definitions ──────────────────────────────────────────────────
const ACHIEVEMENTS = [
  // Sessions
  { id: 'first_session',  category: 'sessions', icon: '🚀', title: 'First Step',        desc: 'Complete your first focus session',      color: '#4F46E5', threshold: 1,    getValue: d => d.sessions },
  { id: 'sessions_5',     category: 'sessions', icon: '⚡', title: 'Getting Warm',       desc: 'Complete 5 focus sessions',              color: '#4F46E5', threshold: 5,    getValue: d => d.sessions },
  { id: 'sessions_25',    category: 'sessions', icon: '🎯', title: 'Focused Thinker',    desc: 'Complete 25 focus sessions',             color: '#4F46E5', threshold: 25,   getValue: d => d.sessions },
  { id: 'sessions_100',   category: 'sessions', icon: '💯', title: 'Century Club',       desc: 'Complete 100 focus sessions',            color: '#4F46E5', threshold: 100,  getValue: d => d.sessions },
  // Time
  { id: 'time_1h',        category: 'time',     icon: '⏱', title: 'First Hour',         desc: 'Accumulate 1 hour of focus time',        color: '#7C3AED', threshold: 60,   getValue: d => d.totalMinutes },
  { id: 'time_10h',       category: 'time',     icon: '🌊', title: 'Deep Diver',         desc: 'Accumulate 10 hours of focus time',      color: '#7C3AED', threshold: 600,  getValue: d => d.totalMinutes },
  { id: 'time_50h',       category: 'time',     icon: '🏆', title: 'Focus Legend',       desc: 'Accumulate 50 hours of focus time',      color: '#7C3AED', threshold: 3000, getValue: d => d.totalMinutes },
  // Streak
  { id: 'streak_3',       category: 'streak',   icon: '🔥', title: 'On a Roll',          desc: 'Maintain a 3-day streak',               color: '#F97316', threshold: 3,    getValue: d => d.streak },
  { id: 'streak_7',       category: 'streak',   icon: '⚔️', title: 'Week Warrior',       desc: 'Maintain a 7-day streak',               color: '#F97316', threshold: 7,    getValue: d => d.streak },
  { id: 'streak_30',      category: 'streak',   icon: '💎', title: 'Iron Will',          desc: 'Maintain a 30-day streak',              color: '#F97316', threshold: 30,   getValue: d => d.streak },
  // Blocking
  { id: 'block_1',        category: 'focus',    icon: '🛡️', title: 'First Block',        desc: 'Block your first distracting site',     color: '#06B6D4', threshold: 1,    getValue: d => d.blockedSites },
  { id: 'block_5',        category: 'focus',    icon: '🧘', title: 'Digital Minimalist', desc: 'Block 5 distracting sites',             color: '#06B6D4', threshold: 5,    getValue: d => d.blockedSites },
  // Score
  { id: 'score_50',       category: 'focus',    icon: '📈', title: 'Productive',         desc: 'Reach a productivity score of 50',      color: '#10B981', threshold: 50,   getValue: d => d.productivityScore },
  { id: 'score_80',       category: 'focus',    icon: '🌟', title: 'High Performer',     desc: 'Reach a productivity score of 80',      color: '#10B981', threshold: 80,   getValue: d => d.productivityScore },
]

const CATEGORIES = [
  { key: 'all',      label: 'All' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'time',     label: 'Time' },
  { key: 'streak',   label: 'Streak' },
  { key: 'focus',    label: 'Focus' },
]

// ─── Achievement card ─────────────────────────────────────────────────────────
function AchievementCard({ achievement, userdata }) {
  const raw      = achievement.getValue(userdata)
  const unlocked = raw >= achievement.threshold
  const progress = Math.min(1, raw / achievement.threshold)
  const pct      = Math.round(progress * 100)

  return (
    <div style={{
      ...cardStyle,
      borderColor: unlocked ? achievement.color + '40' : 'var(--border)',
      background:  unlocked ? achievement.color + '08' : 'var(--bg-card)',
      opacity:     unlocked ? 1 : 0.55,
    }}>
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 14, fontSize: 26,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: unlocked ? achievement.color + '18' : 'var(--bg-elevated)',
        border: `1px solid ${unlocked ? achievement.color + '30' : 'var(--border)'}`,
        marginBottom: 12, flexShrink: 0,
        filter: unlocked ? 'none' : 'grayscale(1)',
      }}>
        {achievement.icon}
      </div>

      {/* Text */}
      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-1)', marginBottom: 3 }}>
        {achievement.title}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.4 }}>
        {achievement.desc}
      </div>

      {/* Progress bar */}
      {!unlocked && (
        <div>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: achievement.color, borderRadius: 2,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 4 }}>
            {raw} / {achievement.threshold}
          </div>
        </div>
      )}

      {/* Unlocked badge */}
      {unlocked && (
        <div style={{
          fontSize: 10, fontWeight: 700, color: achievement.color,
          background: achievement.color + '14',
          border: `1px solid ${achievement.color + '30'}`,
          padding: '2px 8px', borderRadius: 99, display: 'inline-block',
        }}>
          ✓ Unlocked
        </div>
      )}
    </div>
  )
}

const cardStyle = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 14, padding: 18,
  display: 'flex', flexDirection: 'column',
  transition: 'border-color 0.2s, background 0.2s',
}

// ─── Main Achievements Page ───────────────────────────────────────────────────
export default function Achievements() {
  const { user } = useAuthStore()
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)
  const [userdata, setUserdata] = useState({ sessions: 0, totalMinutes: 0, streak: 0, blockedSites: 0, productivityScore: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'),
      api.get('/sessions?limit=1&status=completed'),
      api.get('/blocks'),
    ]).then(([summary, sessions, blocks]) => {
      const s = summary.data.data || {}
      setUserdata({
        sessions:          s.totalSessions      || 0,
        totalMinutes:      s.totalFocusMinutes  || 0,
        streak:            s.streak?.current    || 0,
        blockedSites:      (blocks.data.data?.sites || []).length,
        productivityScore: s.productivityScore  || 0,
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered   = filter === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === filter)
  const unlocked   = ACHIEVEMENTS.filter(a => a.getValue(userdata) >= a.threshold).length
  const total      = ACHIEVEMENTS.length
  const percentage = Math.round((unlocked / total) * 100)

  return (
    <div style={{ maxWidth: 1100 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
          Achievements
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
          {unlocked} of {total} unlocked · {percentage}% complete
        </p>
      </div>

      {/* Overall progress bar */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Overall Progress</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--indigo)' }}>{unlocked}/{total}</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${percentage}%`,
            background: 'var(--gradient-brand)', borderRadius: 4,
            transition: 'width 0.8s ease',
          }} />
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Sessions',   value: userdata.sessions },
            { label: 'Focus Hours', value: `${Math.floor(userdata.totalMinutes / 60)}h` },
            { label: 'Day Streak',  value: userdata.streak },
            { label: 'Sites Blocked', value: userdata.blockedSites },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setFilter(c.key)} style={{
            padding: '5px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            background:   filter === c.key ? 'var(--bg-card)' : 'transparent',
            color:        filter === c.key ? 'var(--text-1)'  : 'var(--text-3)',
            boxShadow:    filter === c.key ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            textTransform: 'capitalize',
          }}>{c.label}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-indigo" style={{ width: 32, height: 32 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {filtered.map(a => (
            <AchievementCard key={a.id} achievement={a} userdata={userdata} />
          ))}
        </div>
      )}
    </div>
  )
}
