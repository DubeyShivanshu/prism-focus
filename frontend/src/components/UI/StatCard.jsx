import { useEffect, useRef } from 'react'

// Animated number counter 
function useCountUp(target, duration = 800) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const start  = 0
    const step   = (target / duration) * 16
    let current  = start
    const timer  = setInterval(() => {
      current = Math.min(current + step, target)
      if (ref.current) ref.current.textContent = Number.isInteger(target)
        ? Math.round(current)
        : current.toFixed(1)
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return ref
}

/**
 * StatCard
 * @param {string}  label       — metric label
 * @param {number}  value       — numeric value
 * @param {string}  unit        — optional suffix (h, %, pts)
 * @param {string}  icon        — emoji or symbol
 * @param {string}  accent      — CSS color variable name
 * @param {number}  trend       — percentage change (positive = up)
 * @param {string}  sublabel    — secondary descriptor
 * @param {boolean} isFloat     — show one decimal place
 */
export default function StatCard({
  label,
  value = 0,
  unit = '',
  icon = '◈',
  accent = 'var(--indigo)',
  trend,
  sublabel,
  isFloat = false,
}) {
  const numRef = useCountUp(isFloat ? parseFloat(value) : parseInt(value), 900)

  const trendPositive = trend > 0
  const trendColor    = trendPositive ? 'var(--emerald)' : trend < 0 ? 'var(--rose)' : 'var(--text-3)'
  const trendArrow    = trendPositive ? '↑' : trend < 0 ? '↓' : '–'

  return (
    <div style={{ ...styles.card }} className="stat-card">
      {/* Icon */}
      <div style={{ ...styles.iconWrap, background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
      </div>

      {/* Value */}
      <div style={styles.value}>
        <span ref={numRef} style={{ color: 'var(--text-1)' }}>
          {isFloat ? parseFloat(value).toFixed(1) : Math.round(value)}
        </span>
        {unit && <span style={styles.unit}>{unit}</span>}
      </div>

      {/* Label */}
      <div style={styles.label}>{label}</div>

      {/* Trend + sublabel */}
      <div style={styles.meta}>
        {trend !== undefined && (
          <span style={{ color: trendColor, fontSize: 11, fontWeight: 600 }}>
            {trendArrow} {Math.abs(trend)}%
          </span>
        )}
        {sublabel && (
          <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{sublabel}</span>
        )}
      </div>

      {/* Accent bottom line */}
      <div style={{ ...styles.accentLine, background: accent }} />
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  value: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 3,
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  unit: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-2)',
    letterSpacing: 0,
  },
  label: {
    fontSize: 13,
    color: 'var(--text-2)',
    fontWeight: 500,
  },
  meta: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginTop: 2,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.5,
  },
}
