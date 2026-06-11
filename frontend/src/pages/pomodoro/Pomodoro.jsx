import { useEffect, useRef, useState } from 'react'
import { useTimerStore } from '../../store/timerStore'
import { format } from 'date-fns'

// ─── Constants ────────────────────────────────────────────────────────────────
const SESSION_TYPES = [
  { key: 'pomodoro',  label: 'Pomodoro',  icon: '⬡', minutes: 25, color: '#4F46E5' },
  { key: 'deep_work', label: 'Deep Work', icon: '◈', minutes: 90, color: '#7C3AED' },
  { key: 'custom',    label: 'Custom',    icon: '◉', minutes: 45, color: '#06B6D4' },
]

const PHASE_LABELS = {
  idle:      'Ready to focus',
  running:   'Focusing…',
  paused:    'Paused',
  break:     'Break time!',
  completed: 'Session complete! 🎉',
}

// ─── SVG Circular timer ───────────────────────────────────────────────────────
function CircleTimer({ timeLeft, totalSeconds, phase, color = '#4F46E5' }) {
  const R   = 110
  const C   = 2 * Math.PI * R
  const pct = totalSeconds > 0 ? timeLeft / totalSeconds : 0
  const off = C * (1 - pct)

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  const glowColor = phase === 'break' ? '#10B981' : color

  return (
    <div style={{ position: 'relative', width: 280, height: 280 }}>
      <svg width={280} height={280} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle cx={140} cy={140} r={R} fill="none" stroke="var(--bg-elevated)" strokeWidth={12} />
        {/* Progress arc */}
        <circle
          cx={140} cy={140} r={R} fill="none"
          stroke={glowColor} strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.9s linear', filter: `drop-shadow(0 0 6px ${glowColor}88)` }}
        />
      </svg>
      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 52, fontWeight: 800, color: 'var(--text-1)',
          letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        }}>
          {mins}:{secs}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6, fontWeight: 600 }}>
          {PHASE_LABELS[phase]}
        </div>
      </div>
    </div>
  )
}

// ─── Session history item ─────────────────────────────────────────────────────
function HistoryItem({ session }) {
  const mins  = session.actualDuration || session.plannedDuration
  const label = SESSION_TYPES.find(t => t.key === session.type)?.label || session.type
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{
        width:28, height:28, borderRadius:'50%',
        background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:12, color:'var(--emerald)', flexShrink:0,
      }}>✓</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{label}</div>
        <div style={{ fontSize:11, color:'var(--text-3)' }}>{mins} min · {format(new Date(session.startTime), 'h:mm a')}</div>
      </div>
      {session.productivityScore != null && (
        <div style={{ fontSize:12, fontWeight:700, color:'var(--indigo)' }}>{session.productivityScore}</div>
      )}
    </div>
  )
}

// ─── Main Pomodoro Page ───────────────────────────────────────────────────────
export default function Pomodoro() {
  const {
    sessionType, phase, timeLeft, totalSeconds, todaySessions,
    customMinutes, setType, setCustomMinutes,
    start, pause, abandon, complete, startBreak, endBreak,
    tick, loadToday,
  } = useTimerStore()

  const intervalRef  = useRef(null)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  const activeType = SESSION_TYPES.find(t => t.key === sessionType) || SESSION_TYPES[0]
  const color      = phase === 'break' ? '#10B981' : activeType.color

  // ── Tick interval ──────────────────────────────────────────
  useEffect(() => {
    if (phase === 'running' || phase === 'break') {
      intervalRef.current = setInterval(() => tick(), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [phase, tick])

  // ── Load today history on mount ────────────────────────────
  useEffect(() => { loadToday() }, [loadToday])

  // ── Today stats ────────────────────────────────────────────
  const todayMins = todaySessions.reduce((s, sess) => s + (sess.actualDuration || sess.plannedDuration || 0), 0)

  const handleComplete = async () => {
    await complete(notes)
    setNotes('')
    setShowNotes(false)
  }

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.layout}>

        {/* ── LEFT: Timer panel ── */}
        <div style={styles.timerPanel}>
          {/* Session type tabs */}
          {phase === 'idle' && (
            <div style={styles.typeTabs}>
              {SESSION_TYPES.map(t => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  style={{
                    ...styles.typeTab,
                    ...(sessionType === t.key ? { ...styles.typeTabActive, borderColor: t.color, color: t.color, background: t.color + '18' } : {}),
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span>{t.label}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{t.key === 'custom' ? `${customMinutes}m` : `${t.minutes}m`}</span>
                </button>
              ))}
            </div>
          )}

          {/* Custom duration input */}
          {phase === 'idle' && sessionType === 'custom' && (
            <div style={styles.customRow}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Duration (minutes):</span>
              <input
                type="number" min={5} max={180}
                value={customMinutes}
                onChange={e => setCustomMinutes(Number(e.target.value))}
                style={styles.customInput}
              />
            </div>
          )}

          {/* Phase label for non-idle */}
          {phase !== 'idle' && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>
              {phase === 'break' ? '☕ Break time' : `${activeType.icon} ${activeType.label}`}
            </div>
          )}

          {/* Circle timer */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 24px' }}>
            <CircleTimer timeLeft={timeLeft} totalSeconds={totalSeconds} phase={phase} color={color} />
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            {phase === 'idle' && (
              <button onClick={start} style={{ ...styles.primaryBtn, background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                ▶ Start {activeType.label}
              </button>
            )}

            {phase === 'running' && (
              <>
                <button onClick={pause} style={styles.secondaryBtn}>⏸ Pause</button>
                <button onClick={() => { setShowNotes(true) }} style={styles.dangerBtn}>■ End Session</button>
              </>
            )}

            {phase === 'paused' && (
              <>
                <button onClick={start} style={{ ...styles.primaryBtn, background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>▶ Resume</button>
                <button onClick={abandon} style={styles.dangerBtn}>✕ Abandon</button>
              </>
            )}

            {phase === 'completed' && (
              <>
                <button onClick={startBreak} style={{ ...styles.primaryBtn, background: 'linear-gradient(135deg,#10B981,#059669)' }}>
                  ☕ Start Break ({activeType.key === 'pomodoro' ? 5 : 15}m)
                </button>
                <button onClick={() => useTimerStore.getState()._reset()} style={styles.secondaryBtn}>
                  ↺ New Session
                </button>
              </>
            )}

            {phase === 'break' && (
              <button onClick={endBreak} style={styles.secondaryBtn}>Skip Break →</button>
            )}
          </div>

          {/* End session notes dialog */}
          {showNotes && (
            <div style={styles.notesBox}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
                Session notes (optional)
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What did you accomplish?"
                style={styles.notesInput}
                rows={3}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => setShowNotes(false)} style={styles.secondaryBtn}>Cancel</button>
                <button onClick={handleComplete} style={{ ...styles.primaryBtn, background: `linear-gradient(135deg,${color},${color}cc)` }}>
                  ✓ Complete Session
                </button>
              </div>
            </div>
          )}

          {/* Progress dots (pomodoro count) */}
          {todaySessions.length > 0 && (
            <div style={styles.dots}>
              {Array.from({ length: Math.min(todaySessions.length, 8) }).map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)' }} />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Stats + History ── */}
        <div style={styles.sidePanel}>
          {/* Today stats */}
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>Today's Focus</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)' }}>
                  {Math.floor(todayMins / 60)}h {todayMins % 60}m
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Total focus time</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)' }}>
                  {todaySessions.length}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Sessions</div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div style={{ ...styles.sideCard, background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Focus Tips
            </div>
            {[
              'Close all unneeded tabs before starting',
              'Put your phone in another room',
              'Use headphones with ambient sound',
            ].map((tip, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', paddingLeft: 14, position: 'relative', marginBottom: 6 }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--indigo)' }}>›</span>
                {tip}
              </div>
            ))}
          </div>

          {/* Session history */}
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>Today's Sessions</div>
            {todaySessions.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 12, textAlign: 'center', padding: '20px 0' }}>
                No sessions yet today.<br />Start your first one! 🚀
              </div>
            ) : (
              <div style={{ marginTop: 8 }}>
                {todaySessions.map(s => <HistoryItem key={s._id} session={s} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page:   { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, flex: 1, minHeight: 0 },

  timerPanel: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '28px 32px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    overflowY: 'auto',
  },

  typeTabs: { display: 'flex', gap: 8, marginBottom: 20, width: '100%', maxWidth: 480 },
  typeTab: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
    color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s',
  },
  typeTabActive: { fontWeight: 700 },

  customRow: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
  },
  customInput: {
    width: 70, padding: '6px 10px', borderRadius: 8, fontSize: 14,
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
    color: 'var(--text-1)', fontFamily: 'var(--font-sans)', textAlign: 'center',
    outline: 'none',
  },

  controls: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 400 },
  primaryBtn: {
    flex: 1, padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700,
    border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    minWidth: 140, boxShadow: '0 2px 12px rgba(79,70,229,0.3)', transition: 'opacity 0.15s',
  },
  secondaryBtn: {
    flex: 1, padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
    color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-sans)', minWidth: 120,
  },
  dangerBtn: {
    flex: 1, padding: '13px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
    border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.08)',
    color: 'var(--rose)', cursor: 'pointer', fontFamily: 'var(--font-sans)', minWidth: 120,
  },
  notesBox: {
    marginTop: 20, padding: 16, borderRadius: 12, width: '100%', maxWidth: 400,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
  },
  notesInput: {
    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text-1)',
    fontFamily: 'var(--font-sans)', resize: 'none', outline: 'none',
    boxSizing: 'border-box',
  },
  dots: { display: 'flex', gap: 6, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' },

  sidePanel:  { display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' },
  sideCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '16px 18px',
  },
  sideTitle: { fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' },
}
