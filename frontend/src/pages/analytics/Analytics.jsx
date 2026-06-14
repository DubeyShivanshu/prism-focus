import { useState, useEffect, useCallback } from 'react'
import ScoreLineChart   from '../../components/Charts/ScoreLineChart'
import SiteBarChart     from '../../components/Charts/SiteBarChart'
import SessionTypeChart from '../../components/Charts/SessionTypeChart'
import FullHeatmap      from '../../components/Charts/FullHeatmap'
import api from '../../services/api'

// Period tabs
const PERIODS = [
  { label: '7 days',  days: 7  },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

// Summary stat card
function SummaryCard({ icon, label, value, unit = '', accent, sub }) {
  return (
    <div style={{ ...cardStyle, borderTop: `2px solid ${accent}` }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
        <span style={{ fontSize:28, fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.03em' }}>
          {value}
        </span>
        {unit && <span style={{ fontSize:13, color:'var(--text-3)', fontWeight:600 }}>{unit}</span>}
      </div>
      <div style={{ fontSize:12, color:'var(--text-2)', marginTop:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2 }}>{sub}</div>}
    </div>
  )
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '16px 18px',
}

// Analytics Page
export default function Analytics() {
  const [period,    setPeriod]    = useState(30)
  const [loading,   setLoading]   = useState(true)
  const [summary,   setSummary]   = useState(null)
  const [scores,    setScores]    = useState([])
  const [heatmap,   setHeatmap]   = useState([])
  const [sites,     setSites]     = useState([])
  const [sessions,  setSessions]  = useState([])

  const load = useCallback(async (days) => {
    setLoading(true)
    try {
      const [sumRes, scoreRes, heatRes, siteRes, sessRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get(`/analytics/scores?days=${days}`),
        api.get('/analytics/heatmap?days=364'),
        api.get('/analytics/sites'),
        api.get(`/sessions?limit=200&status=completed`),
      ])
      setSummary(sumRes.data.data.summary)
      setScores(scoreRes.data.data.series)
      setHeatmap(heatRes.data.data.heatmap)
      setSites(siteRes.data.data.sites)
      setSessions(sessRes.data.sessions || [])
    } catch (err) {
      console.error('Analytics load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(period) }, [period, load])

  const w = summary?.weekly || {}
  const overrideRate = w.sessions > 0
    ? Math.round((w.overrides / w.sessions) * 100)
    : 0

  return (
    <div style={styles.page} className="animate-fade-in">
      {/* ── Header ── */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.heading}>Analytics</h1>
          <p style={styles.headingSub}>Your focus patterns, visualized.</p>
        </div>

        {/* Period tabs */}
        <div style={styles.periodTabs}>
          {PERIODS.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              style={{
                ...styles.periodBtn,
                ...(period === days ? styles.periodBtnActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
          <div className="spinner spinner-indigo" style={{ width:32, height:32 }}/>
        </div>
      ) : (
        <>
          {/* ── Summary row ── */}
          <div style={styles.summaryGrid}>
            <SummaryCard
              icon="◷" label="Focus This Week" accent="var(--indigo)"
              value={w.focusMinutes || 0} unit="m"
              sub={`${Math.round((w.focusMinutes||0)/60*10)/10}h total`}
            />
            <SummaryCard
              icon="⬡" label="Sessions" accent="var(--violet)"
              value={w.sessions || 0}
              sub={`${period}-day window`}
            />
            <SummaryCard
              icon="◈" label="Avg Score" accent="var(--cyan)"
              value={Math.round(w.avgScore || 0)}
              sub="productivity index"
            />
            <SummaryCard
              icon="⊘" label="Override Rate" accent={overrideRate > 20 ? 'var(--rose)' : 'var(--emerald)'}
              value={overrideRate} unit="%"
              sub={overrideRate > 20 ? 'needs attention' : 'excellent control'}
            />
          </div>

          {/* ── Score trend chart ── */}
          <ScoreLineChart data={scores} />

          {/* ── Full Heatmap ── */}
          <FullHeatmap data={heatmap} />

          {/* ── Bottom row: site breakdown + session types ── */}
          <div style={styles.bottomGrid}>
            <SiteBarChart sites={sites} />
            <SessionTypeChart sessions={sessions} />
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: 1200,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 800,
    color: 'var(--text-1)',
    letterSpacing: '-0.02em',
  },
  headingSub: { fontSize: 13, color: 'var(--text-3)', marginTop: 2 },
  periodTabs: {
    display: 'flex',
    gap: 4,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    padding: 4,
    borderRadius: 10,
  },
  periodBtn: {
    padding: '6px 14px',
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-3)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s ease',
    border: 'none',
    background: 'transparent',
  },
  periodBtnActive: {
    background: 'var(--bg-card)',
    color: 'var(--text-1)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: 20,
    alignItems: 'start',
  },
}
