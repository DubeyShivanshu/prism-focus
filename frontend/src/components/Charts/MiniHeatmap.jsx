/**
 * MiniHeatmap — 12-week grid of daily focus intensity.
 * @param {Array} data  — [{ date: 'YYYY-MM-DD', minutes: number }]
 */
export default function MiniHeatmap({ data = [] }) {
  // Build a lookup map
  const map = {}
  data.forEach(({ date, minutes }) => { map[date] = minutes })

  // Build 12 weeks × 7 days grid (84 days, oldest first)
  const days = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ key, minutes: map[key] || 0, dow: d.getDay() })
  }

  // Color scale based on minutes
  const getColor = (mins) => {
    if (mins === 0) return 'var(--bg-elevated)'
    if (mins < 30)  return 'rgba(79,70,229,0.25)'
    if (mins < 60)  return 'rgba(79,70,229,0.45)'
    if (mins < 120) return 'rgba(79,70,229,0.7)'
    return 'rgba(79,70,229,0.95)'
  }

  // Day labels
  const DOW = ['S','M','T','W','T','F','S']

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>12-Week Activity</span>
        <div style={styles.legend}>
          {[0, 15, 30, 60, 120].map((m, i) => (
            <div key={i} style={{ ...styles.legendDot, background: getColor(m) }} title={`${m}m`}/>
          ))}
        </div>
      </div>

      <div style={styles.gridWrap}>
        {/* Day-of-week labels */}
        <div style={styles.dowLabels}>
          {DOW.map((d, i) => (
            <div key={i} style={styles.dowLabel}>{i % 2 === 0 ? d : ''}</div>
          ))}
        </div>

        {/* 12 columns (weeks) × 7 rows (days) */}
        <div style={styles.grid}>
          {Array.from({ length: 12 }).map((_, week) => (
            <div key={week} style={styles.column}>
              {days.slice(week * 7, week * 7 + 7).map((day) => (
                <div
                  key={day.key}
                  title={`${day.key}: ${day.minutes}m`}
                  style={{ ...styles.cell, background: getColor(day.minutes) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <span>Less</span>
        <div style={{ display:'flex', gap:3 }}>
          {[0,15,30,60,120].map((m,i) => (
            <div key={i} style={{ width:10, height:10, borderRadius:3, background:getColor(m) }}/>
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '16px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 13, fontWeight: 700, color: 'var(--text-1)' },
  legend: { display: 'flex', gap: 3, alignItems: 'center' },
  legendDot: {
    width: 10, height: 10, borderRadius: 3,
  },
  gridWrap: {
    display: 'flex',
    gap: 4,
  },
  dowLabels: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    paddingTop: 1,
  },
  dowLabel: {
    fontSize: 9,
    color: 'var(--text-4)',
    height: 12,
    display: 'flex',
    alignItems: 'center',
    width: 10,
  },
  grid: {
    display: 'flex',
    gap: 3,
    flex: 1,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    flex: 1,
  },
  cell: {
    height: 12,
    borderRadius: 3,
    transition: 'opacity 0.15s',
    cursor: 'default',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    fontSize: 10,
    color: 'var(--text-4)',
  },
}
