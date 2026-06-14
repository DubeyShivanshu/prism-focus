import { useState, useEffect, useRef } from 'react'
import { useSessionStore } from '../../store/sessionStore'

// Circular Progress Ring
function ProgressRing({ radius = 70, stroke = 6, progress = 0, color = 'var(--indigo)' }) {
  const norm = Math.max(0, Math.min(1, progress))
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - norm)
  return (
    <svg width={radius * 2 + stroke * 2} height={radius * 2 + stroke * 2} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx={radius + stroke} cy={radius + stroke} r={radius}
        fill="none" stroke="var(--border)" strokeWidth={stroke} />
      {/* Progress */}
      <circle cx={radius + stroke} cy={radius + stroke} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  )
}

// Format seconds → mm:ss
const fmt = (sec) => {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Session Type options
const SESSION_TYPES = [
  { value: 'pomodoro',  label: 'Pomodoro',  duration: 25, icon: '◷' },
  { value: 'deep_work', label: 'Deep Work', duration: 90, icon: '◈' },
  { value: 'custom',    label: 'Custom',    duration: 45, icon: '⬡' },
]

// SessionTimer
export default function SessionTimer() {
  const { activeSession, startSession, completeSession, abandonSession, isLoading } = useSessionStore()

  // Start-session form state
  const [selectedType, setSelectedType] = useState('pomodoro')
  const [customMins,   setCustomMins]   = useState(45)
  const [startError,   setStartError]   = useState('')

  // Active-session timer
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!activeSession) { setElapsed(0); return }
    const start = new Date(activeSession.startTime).getTime()
    const planned = activeSession.plannedDuration * 60
    let isCompleted = false

    const tick  = async () => {
      if (isCompleted) return
      
      const e = Math.floor((Date.now() - start) / 1000)
      setElapsed(e)

      if (e >= planned && !isCompleted) {
        isCompleted = true
        clearInterval(intervalRef.current)

        // Play Beep
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const playBeep = (time) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.type = 'sine'
            osc.frequency.setValueAtTime(880, time)
            gain.gain.setValueAtTime(0.1, time)
            osc.start(time)
            osc.stop(time + 0.4)
          }
          playBeep(ctx.currentTime)
          playBeep(ctx.currentTime + 0.6)
          playBeep(ctx.currentTime + 1.2)
        } catch (err) {
          console.error('Audio playback failed', err)
        }

        // Show Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Prism Focus', {
            body: 'Your focus session has ended! Great job.',
            icon: '/assets/icons/icon128.png'
          })
        }

        // Auto-complete the session
        await completeSession(activeSession._id)
      }
    }
    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => clearInterval(intervalRef.current)
  }, [activeSession, completeSession])

  const handleStart = async () => {
    setStartError('')
    
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const type = SESSION_TYPES.find(t => t.value === selectedType)
    const mins = selectedType === 'custom' ? customMins : type.duration
    try {
      await startSession({ type: selectedType, plannedDuration: mins })
    } catch (err) {
      setStartError(err.response?.data?.message || 'Could not start session')
    }
  }

  const handleComplete = async () => {
    if (!activeSession) return
    await completeSession(activeSession._id)
  }

  const handleAbandon = async () => {
    if (!activeSession || !window.confirm('Abandon this session?')) return
    await abandonSession(activeSession._id)
  }

  // ACTIVE STATE
  if (activeSession) {
    const planned = activeSession.plannedDuration * 60
    const progress = Math.min(elapsed / planned, 1)
    const remaining = Math.max(planned - elapsed, 0)
    const overrides = activeSession.overrides?.length || 0
    const typeInfo = SESSION_TYPES.find(t => t.value === activeSession.type) || SESSION_TYPES[0]

    return (
      <div style={styles.activeCard}>
        {/* Header */}
        <div style={styles.activeHeader}>
          <div>
            <span style={styles.activeTypeBadge}>
              {typeInfo.icon} {typeInfo.label}
            </span>
            <div style={styles.activeTitle}>Session in progress</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={styles.overridePill}>
              <span style={{ color: overrides > 0 ? 'var(--amber)' : 'var(--text-3)' }}>
                {overrides} override{overrides !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Ring + time */}
        <div style={styles.ringWrap}>
          <ProgressRing radius={72} stroke={5} progress={progress}
            color={remaining < 60 ? 'var(--rose)' : 'var(--indigo)'} />
          <div style={styles.ringInner}>
            <div style={styles.remainingTime}>{fmt(remaining)}</div>
            <div style={styles.remainingLabel}>remaining</div>
          </div>
        </div>

        {/* Elapsed */}
        <div style={styles.elapsedRow}>
          <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Elapsed</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
            {fmt(elapsed)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            id="session-abandon"
            onClick={handleAbandon}
            disabled={isLoading}
            style={styles.abandonBtn}
          >
            Abandon
          </button>
          <button
            id="session-complete"
            onClick={handleComplete}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ flex: 1, height: 44 }}
          >
            {isLoading ? <div className="spinner" style={{ width: 18, height: 18 }}/> : '✓ Complete'}
          </button>
        </div>
      </div>
    )
  }

  // START STATE
  const selectedInfo = SESSION_TYPES.find(t => t.value === selectedType)

  return (
    <div style={styles.startCard}>
      <div style={styles.startHeader}>
        <span style={styles.startIcon}>◷</span>
        <div>
          <div style={styles.startTitle}>Start Focus Session</div>
          <div style={styles.startSub}>Choose your session type</div>
        </div>
      </div>

      {/* Type selector */}
      <div style={styles.typeGrid}>
        {SESSION_TYPES.map(({ value, label, duration, icon }) => (
          <button
            key={value}
            onClick={() => setSelectedType(value)}
            style={{
              ...styles.typeBtn,
              ...(selectedType === value ? styles.typeBtnActive : {}),
            }}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
            <span style={{ fontSize: 11, color: selectedType === value ? 'rgba(255,255,255,0.7)' : 'var(--text-3)' }}>
              {value === 'custom' ? `${customMins}m` : `${duration}m`}
            </span>
          </button>
        ))}
      </div>

      {/* Custom duration slider */}
      {selectedType === 'custom' && (
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Duration</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--indigo)' }}>
              {customMins} min
            </span>
          </div>
          <input
            type="range" min={15} max={180} step={5}
            value={customMins}
            onChange={e => setCustomMins(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--indigo)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
            <span>15m</span><span>3h</span>
          </div>
        </div>
      )}

      {startError && (
        <div className="alert alert-error" style={{ padding: '8px 12px', fontSize: 13 }}>
          {startError}
        </div>
      )}

      <button
        id="session-start"
        onClick={handleStart}
        disabled={isLoading}
        className="btn btn-primary btn-lg w-full"
        style={{ marginTop: 8 }}
      >
        {isLoading
          ? <><div className="spinner"/>Starting…</>
          : `▶  Start ${selectedInfo?.label} · ${selectedType === 'custom' ? customMins : selectedInfo?.duration}m`
        }
      </button>
    </div>
  )
}

// Styles
const styles = {
  // Active
  activeCard: {
    background: 'var(--bg-card)',
    border: '1px solid rgba(79,70,229,0.3)',
    borderRadius: 16,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 4px 24px rgba(79,70,229,0.1)',
  },
  activeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activeTypeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 10px',
    borderRadius: 99,
    background: 'rgba(79,70,229,0.12)',
    color: 'var(--indigo)',
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-1)',
  },
  overridePill: { fontSize: 12, color: 'var(--text-3)' },
  ringWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4px 0',
  },
  ringInner: {
    position: 'absolute',
    textAlign: 'center',
  },
  remainingTime: {
    fontFamily: 'var(--font-mono)',
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--text-1)',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  remainingLabel: {
    fontSize: 11,
    color: 'var(--text-3)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  elapsedRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: 8,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
  },
  abandonBtn: {
    height: 44,
    padding: '0 16px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-2)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
    fontFamily: 'var(--font-sans)',
  },
  // Start
  startCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  startHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  startIcon: {
    fontSize: 32,
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'rgba(79,70,229,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  startTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-1)',
  },
  startSub: {
    fontSize: 12,
    color: 'var(--text-3)',
    marginTop: 2,
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  typeBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '12px 8px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    color: 'var(--text-2)',
    fontFamily: 'var(--font-sans)',
  },
  typeBtnActive: {
    background: 'var(--gradient-brand)',
    border: '1px solid transparent',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(79,70,229,0.3)',
    transform: 'translateY(-1px)',
  },
}
