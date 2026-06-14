import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'

// Custom Tooltip 
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 4 }}>
        {payload[0]?.payload?.date ? format(parseISO(payload[0].payload.date), 'MMM d, yyyy') : label}
      </div>
      <div style={{ color: 'var(--indigo)', fontWeight: 700, fontSize: 14 }}>
        Score: {Math.round(payload[0]?.value ?? 0)}
      </div>
    </div>
  )
}

/**
 * ScoreLineChart
 * @param {Array} data — [{ _id: 'YYYY-MM-DD', avgScore: number }]
 */
export default function ScoreLineChart({ data = [] }) {
  const chartData = data.map(d => ({
    date: d._id,
    score: Math.round(d.avgScore ?? 0),
    label: d._id ? format(parseISO(d._id), 'MMM d') : '',
  }))

  const avg = chartData.length
    ? Math.round(chartData.reduce((s, d) => s + d.score, 0) / chartData.length)
    : 0

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Productivity Score Trend</div>
          <div style={styles.sub}>Daily average over selected period</div>
        </div>
        <div style={styles.avgBadge}>
          Avg <span style={{ color: 'var(--indigo)', fontWeight: 700 }}>{avg}</span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div style={styles.empty}>No score data yet — complete sessions to see your trend</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--text-4)' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--text-4)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {avg > 0 && (
              <ReferenceLine
                y={avg}
                stroke="rgba(79,70,229,0.4)"
                strokeDasharray="4 4"
              />
            )}
            <Area
              type="monotone"
              dataKey="score"
              stroke="#4F46E5"
              strokeWidth={2}
              fill="url(#scoreGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#4F46E5', strokeWidth: 0 }}
            />
          </AreaChart>
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
  avgBadge: {
    fontSize: 12,
    color: 'var(--text-2)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    padding: '4px 10px',
    borderRadius: 8,
  },
  empty: {
    height: 180,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-4)',
    fontSize: 13,
    textAlign: 'center',
  },
}
