import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  pomodoro:  { fill: '#4F46E5', label: 'Pomodoro' },
  deep_work: { fill: '#7C3AED', label: 'Deep Work' },
  custom:    { fill: '#06B6D4', label: 'Custom' },
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <div style={{ color: payload[0].payload.color, fontWeight: 700 }}>
        {payload[0].name}
      </div>
      <div style={{ color: 'var(--text-2)' }}>
        {payload[0].value} sessions ({payload[0].payload.pct}%)
      </div>
    </div>
  )
}

/**
 * SessionTypeChart — donut chart of session type distribution
 * @param {Array} sessions — raw session list from store
 */
export default function SessionTypeChart({ sessions = [] }) {
  // Count by type
  const counts = { pomodoro: 0, deep_work: 0, custom: 0 }
  sessions.forEach(s => { if (counts[s.type] !== undefined) counts[s.type]++ })
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([type, count]) => ({
      name:  COLORS[type]?.label || type,
      value: count,
      color: COLORS[type]?.fill || '#6B7280',
      pct:   total > 0 ? Math.round((count / total) * 100) : 0,
    }))

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>Session Types</div>
        <div style={styles.sub}>{total} total sessions</div>
      </div>

      {total === 0 ? (
        <div style={styles.empty}>
          <span style={{ fontSize: 28, opacity: 0.3 }}>◷</span>
          <div>No sessions yet</div>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div style={styles.centerLabel}>
            <div style={styles.centerNum}>{total}</div>
            <div style={styles.centerTxt}>sessions</div>
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            {data.map((d, i) => (
              <div key={i} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: d.color }} />
                <span style={styles.legendName}>{d.name}</span>
                <span style={styles.legendPct}>{d.pct}%</span>
              </div>
            ))}
          </div>
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
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)' },
  sub:   { fontSize: 12, color: 'var(--text-3)' },
  empty: {
    height: 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    color: 'var(--text-3)',
    fontSize: 13,
  },
  centerLabel: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -65%)',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  centerNum: {
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text-1)',
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  centerTxt: { fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  legend: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendName: { flex: 1, fontSize: 12, color: 'var(--text-2)' },
  legendPct:  { fontSize: 12, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-mono)' },
}
