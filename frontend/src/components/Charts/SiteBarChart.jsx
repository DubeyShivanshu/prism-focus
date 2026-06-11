import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'

const CATEGORY_COLORS = {
  social:        '#4F46E5',
  entertainment: '#7C3AED',
  news:          '#06B6D4',
  gaming:        '#F59E0B',
  shopping:      '#10B981',
  other:         '#6B7280',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-1)', fontWeight: 600, marginBottom: 4 }}>
        {d.name || d.domain}
      </div>
      <div style={{ color: 'var(--rose)' }}>Overrides: <b>{d.overrides}</b></div>
      <div style={{ color: 'var(--text-3)' }}>Visits: {d.visits}</div>
      <div style={{ color: 'var(--text-3)' }}>Time: {d.timeWasted}m</div>
    </div>
  )
}

/**
 * SiteBarChart — horizontal bars of top distracting sites
 * @param {Array} sites — from /api/analytics/sites
 */
export default function SiteBarChart({ sites = [] }) {
  const data = sites.slice(0, 8).map(s => ({
    domain:     s.domain,
    name:       s.name || s.domain,
    overrides:  s.stats?.overrideCount    || 0,
    visits:     s.stats?.totalVisitCount  || 0,
    timeWasted: s.stats?.totalTimeWasted  || 0,
    category:   s.category || 'other',
  })).sort((a, b) => b.overrides - a.overrides)

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Top Distracting Sites</div>
          <div style={styles.sub}>Ranked by override count</div>
        </div>
        <div style={styles.totalBadge}>
          {data.reduce((s, d) => s + d.overrides, 0)} total overrides
        </div>
      </div>

      {data.length === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 28, opacity: 0.3 }}>⊘</span>
          <div>No blocked sites yet</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Add sites in the Sites page</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 160)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            barSize={20}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11, fill: 'var(--text-2)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="overrides" radius={[0, 6, 6, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other}
                  opacity={0.85}
                />
              ))}
              <LabelList
                dataKey="overrides"
                position="right"
                style={{ fontSize: 11, fill: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)' },
  sub:   { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
  totalBadge: {
    fontSize: 11,
    color: 'var(--rose)',
    background: 'rgba(244,63,94,0.08)',
    border: '1px solid rgba(244,63,94,0.2)',
    padding: '4px 10px',
    borderRadius: 8,
    fontWeight: 600,
  },
  empty: {
    height: 120,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    color: 'var(--text-3)',
    fontSize: 13,
  },
}
