import { format, parseISO, startOfWeek, eachWeekOfInterval, subDays, eachDayOfInterval } from 'date-fns'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['','Mon','','Wed','','Fri','']

const getColor = (mins) => {
  if (!mins || mins === 0) return 'var(--bg-elevated)'
  if (mins < 30)  return 'rgba(79,70,229,0.2)'
  if (mins < 60)  return 'rgba(79,70,229,0.4)'
  if (mins < 120) return 'rgba(79,70,229,0.65)'
  if (mins < 180) return 'rgba(79,70,229,0.85)'
  return 'rgba(79,70,229,1)'
}

/**
 * FullHeatmap — 52-week GitHub-style contribution graph
 * @param {Array} data — [{ date: 'YYYY-MM-DD', minutes: number }]
 */
export default function FullHeatmap({ data = [] }) {
  const map = {}
  data.forEach(({ date, minutes }) => { map[date] = minutes })

  const today = new Date()
  const start = subDays(today, 363) // ~52 weeks

  // Get all weeks
  const weeks = eachWeekOfInterval({ start, end: today }, { weekStartsOn: 0 })

  // Build grid: array of weeks, each with 7 days
  const grid = weeks.map(weekStart => {
    const days = eachDayOfInterval({
      start: weekStart,
      end: new Date(Math.min(new Date(weekStart).setDate(weekStart.getDate() + 6), today)),
    })
    return days.map(d => {
      const key = format(d, 'yyyy-MM-dd')
      return { date: key, minutes: map[key] || 0, day: d }
    })
  })

  // Month label positions
  const monthLabels = []
  grid.forEach((week, wIdx) => {
    const firstDay = week[0]?.day
    if (!firstDay) return
    if (wIdx === 0 || firstDay.getDate() <= 7) {
      const label = MONTHS[firstDay.getMonth()]
      if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== label) {
        monthLabels.push({ label, col: wIdx })
      }
    }
  })

  const totalMinutes = data.reduce((s, d) => s + (d.minutes || 0), 0)
  const activeDays   = data.filter(d => d.minutes > 0).length

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Year in Focus</div>
          <div style={styles.sub}>52-week activity overview</div>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          <div style={styles.stat}>
            <span style={styles.statVal}>{Math.round(totalMinutes / 60)}h</span>
            <span style={styles.statLabel}>total</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statVal}>{activeDays}</span>
            <span style={styles.statLabel}>active days</span>
          </div>
        </div>
      </div>

      <div style={styles.gridWrap}>
        {/* Day-of-week labels */}
        <div style={styles.dowCol}>
          {DAYS.map((d, i) => (
            <div key={i} style={styles.dowLabel}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {/* Month labels */}
          <div style={styles.monthRow}>
            {monthLabels.map(({ label, col }) => (
              <div
                key={`${label}-${col}`}
                style={{
                  ...styles.monthLabel,
                  position: 'absolute',
                  left: col * 14,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={styles.weeksRow}>
            {grid.map((week, wIdx) => (
              <div key={wIdx} style={styles.weekCol}>
                {/* Fill empty days at start of first week */}
                {wIdx === 0 && week[0]?.day &&
                  Array.from({ length: week[0].day.getDay() }).map((_, i) => (
                    <div key={`pre-${i}`} style={styles.cell} />
                  ))
                }
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    style={{ ...styles.cell, background: getColor(day.minutes) }}
                    title={`${day.date}: ${day.minutes}m`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <span style={styles.legendText}>Less</span>
        {[0, 30, 60, 120, 180].map((m, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 3, background: getColor(m === 0 ? 0 : m) }}/>
        ))}
        <span style={styles.legendText}>More</span>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '20px',
    overflowX: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: { fontSize: 14, fontWeight: 700, color: 'var(--text-1)' },
  sub:   { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
  stat:  { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  statVal:   { fontSize: 18, fontWeight: 800, color: 'var(--indigo)', lineHeight: 1 },
  statLabel: { fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  gridWrap: {
    display: 'flex',
    gap: 4,
    minWidth: 'fit-content',
  },
  dowCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    paddingTop: 18,
    flexShrink: 0,
  },
  dowLabel: {
    height: 11,
    fontSize: 9,
    color: 'var(--text-4)',
    display: 'flex',
    alignItems: 'center',
    width: 22,
  },
  monthRow: {
    position: 'relative',
    height: 16,
    marginBottom: 4,
  },
  monthLabel: {
    fontSize: 9,
    color: 'var(--text-3)',
    whiteSpace: 'nowrap',
  },
  weeksRow: {
    display: 'flex',
    gap: 3,
  },
  weekCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  cell: {
    width: 11,
    height: 11,
    borderRadius: 3,
    background: 'var(--bg-elevated)',
    flexShrink: 0,
    transition: 'opacity 0.1s',
    cursor: 'default',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  legendText: { fontSize: 10, color: 'var(--text-4)', marginRight: 2 },
}
