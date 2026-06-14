import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'

// Stat card for the shareable panel
function StatCard({ icon, label, value, color = 'var(--indigo)', sub }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px 22px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// Leaderboard row
function LeaderRow({ rank, name, score, isYou }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '10px 14px', borderRadius: 10,
      background: isYou ? 'rgba(79,70,229,0.08)' : 'var(--bg-surface)',
      border: isYou ? '1px solid rgba(79,70,229,0.25)' : '1px solid var(--border)',
      marginBottom: 6,
    }}>
      <div style={{ width: 28, textAlign: 'center', fontSize: 16 }}>{medal}</div>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: isYou ? 'var(--gradient-brand)' : 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}>
        {name[0].toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: isYou ? 'var(--text-1)' : 'var(--text-2)' }}>
          {name} {isYou && <span style={{ fontSize: 10, color: 'var(--indigo)', background: 'rgba(79,70,229,0.12)', padding: '1px 6px', borderRadius: 99, marginLeft: 4 }}>You</span>}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: isYou ? 'var(--indigo)' : 'var(--text-2)' }}>
        {score}
      </div>
    </div>
  )
}

// Share card
function ShareCard({ stats, user }) {
  const [copied, setCopied] = useState(false)

  const text = `🔷 My Prism Focus Stats:\n🔥 ${stats.streak} day streak\n⏱ ${Math.floor(stats.totalMinutes / 60)}h focused\n✓ ${stats.sessions} sessions completed\n📈 Score: ${stats.score}/100\n\nBuilding better focus habits with Prism 🧠`

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d0d20 0%, #120a2e 100%)',
      border: '1px solid rgba(79,70,229,0.3)',
      borderRadius: 16, padding: 24,
      boxShadow: '0 0 40px rgba(79,70,229,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--gradient-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: '#fff',
        }}>⬡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Prism Focus Stats</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user?.name || 'Prism User'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Streak',   value: `🔥 ${stats.streak}d`    },
          { label: 'Sessions', value: `✓ ${stats.sessions}`    },
          { label: 'Focused',  value: `⏱ ${Math.floor(stats.totalMinutes / 60)}h` },
          { label: 'Score',    value: `📈 ${stats.score}`      },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      <button onClick={copy} style={{
        width: '100%', padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(79,70,229,0.2)',
        border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(79,70,229,0.3)'}`,
        color: copied ? '#10B981' : '#818cf8',
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
      }}>
        {copied ? '✓ Copied to clipboard!' : '📋 Copy to share'}
      </button>
    </div>
  )
}

// Main Social Page
export default function Social() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats,   setStats]   = useState({ sessions: 0, totalMinutes: 0, streak: 0, score: 0 })

  useEffect(() => {
    api.get('/analytics/summary').then(({ data }) => {
      const s = data.data || {}
      setStats({
        sessions:     s.totalSessions     || 0,
        totalMinutes: s.totalFocusMinutes || 0,
        streak:       s.streak?.current   || 0,
        score:        s.productivityScore || 0,
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Simulated community leaderboard (real would need social backend)
  const leaderboard = [
    { rank: 1, name: 'Rahul',    score: 94 },
    { rank: 2, name: 'Priya',    score: 88 },
    { rank: 3, name: 'Aditya',   score: 81 },
    { rank: 4, name: user?.name || 'You', score: stats.score, isYou: true },
    { rank: 5, name: 'Sneha',    score: 62 },
    { rank: 6, name: 'Kiran',    score: 54 },
  ].sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }))

  return (
    <div style={{ maxWidth: 1000 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Social</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
          Your productivity stats, community leaderboard, and sharing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* My stats */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Your Focus Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <StatCard icon="🔥" label="Current Streak"  value={`${stats.streak} days`}  color="var(--orange)"  sub="Keep it going!" />
              <StatCard icon="⏱" label="Total Focus Time" value={`${Math.floor(stats.totalMinutes / 60)}h`} color="var(--indigo)" sub={`${stats.totalMinutes % 60}m total`} />
              <StatCard icon="✓"  label="Sessions Done"   value={stats.sessions}            color="var(--emerald)" sub="Focus sessions" />
              <StatCard icon="📈" label="Productivity Score" value={`${stats.score}/100`}  color="var(--violet)"  sub="Your current score" />
            </div>
          </div>

          {/* Community leaderboard */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>Community Leaderboard</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Weekly productivity scores</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                color: 'var(--amber)',
              }}>
                Beta
              </div>
            </div>

            {leaderboard.map(r => (
              <LeaderRow key={r.rank} {...r} />
            ))}

            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 12, textAlign: 'center' }}>
              Real multiplayer leaderboard coming soon · Invite friends to compare 🚀
            </div>
          </div>

          {/* Coming soon: Friends */}
          <div style={{
            background: 'var(--bg-card)', border: '1px dashed var(--border)',
            borderRadius: 14, padding: '24px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Friends & Challenges</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
              Challenge friends to focus duels, share goals, and build accountability streaks together.
            </div>
            <div style={{
              marginTop: 14, display: 'inline-block',
              fontSize: 10, fontWeight: 700, padding: '4px 12px',
              background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)',
              borderRadius: 99, color: 'var(--indigo)',
            }}>
              Coming in a future update
            </div>
          </div>
        </div>

        {/* Right column: share card */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
            Share Your Stats
          </div>
          {!loading && <ShareCard stats={stats} user={user} />}

          <div style={{
            marginTop: 14, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>Community Tips</div>
            {[
              'The best time to focus is whenever you actually do it.',
              'A 3-day streak is harder to break than a 1-day one.',
              'Block sites before you need to, not after.',
            ].map((tip, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--text-3)', paddingLeft: 12, position: 'relative', marginBottom: 8, lineHeight: 1.5 }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--indigo)' }}>›</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
