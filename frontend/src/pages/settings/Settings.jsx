import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuthStore } from '../../store/authStore'

// Section wrapper
function Section({ title, subtitle, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitle}>{title}</div>
        {subtitle && <div style={styles.sectionSub}>{subtitle}</div>}
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  )
}

// Field row
function Field({ label, hint, children }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLeft}>
        <div style={styles.fieldLabel}>{label}</div>
        {hint && <div style={styles.fieldHint}>{hint}</div>}
      </div>
      <div style={styles.fieldRight}>{children}</div>
    </div>
  )
}

// Toggle
function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
      background: checked ? 'var(--indigo)' : 'var(--bg-elevated)',
      border: '1px solid var(--border)', position: 'relative',
      transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3,
        left: checked ? 22 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

// Save button with inline status
function SaveBtn({ onClick, loading, saved, label = 'Save Changes' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
      <button onClick={onClick} disabled={loading} style={styles.saveBtn}>
        {loading ? 'Saving…' : label}
      </button>
      {saved && <span style={{ fontSize: 12, color: 'var(--emerald)', fontWeight: 600 }}>✓ Saved</span>}
    </div>
  )
}

// Number stepper
function Stepper({ value, onChange, min, max, unit }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={styles.stepBtn}
      >−</button>
      <div style={styles.stepValue}>{value}</div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={styles.stepBtn}
      >+</button>
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{unit}</span>
    </div>
  )
}

// Main Settings Page
export default function Settings() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Profile state
  const [name,         setName]         = useState(user?.name || '')
  const [avatar,       setAvatar]       = useState(user?.avatar || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved,  setProfileSaved]  = useState(false)

  // Timer settings
  const [pomWork,    setPomWork]    = useState(25)
  const [pomBreak,   setPomBreak]   = useState(5)
  const [timerSaving, setTimerSaving] = useState(false)
  const [timerSaved,  setTimerSaved]  = useState(false)

  // Goals
  const [dailyGoal,  setDailyGoal]  = useState(4)
  const [goalSaving, setGoalSaving] = useState(false)
  const [goalSaved,  setGoalSaved]  = useState(false)

  // Preferences
  const [notifications, setNotifications] = useState(true)
  const [frictionMode,  setFrictionMode]  = useState('auto')
  const [prefSaving,    setPrefSaving]    = useState(false)
  const [prefSaved,     setPrefSaved]     = useState(false)

  // Load settings on mount
  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      const s = data.data?.settings || {}
      setPomWork(s.pomodoroWork   || 25)
      setPomBreak(s.pomodoroBreak || 5)
      setDailyGoal(s.dailyGoalHours || 4)
      setNotifications(s.notifications ?? true)
      setFrictionMode(s.frictionMode || 'auto')
    }).catch(() => {})
  }, [])

  // Save helper
  const flash = (setSaved) => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // Save profile
  const saveProfile = async () => {
    setProfileSaving(true)
    try {
      await api.patch('/settings/profile', { name, avatar: avatar || undefined })
      flash(setProfileSaved)
    } finally { setProfileSaving(false) }
  }

  // Save timer settings
  const saveTimer = async () => {
    setTimerSaving(true)
    try {
      await api.patch('/settings', { pomodoroWork: pomWork, pomodoroBreak: pomBreak })
      flash(setTimerSaved)
    } finally { setTimerSaving(false) }
  }

  // Save goals
  const saveGoal = async () => {
    setGoalSaving(true)
    try {
      await api.patch('/settings', { dailyGoalHours: dailyGoal })
      flash(setGoalSaved)
    } finally { setGoalSaving(false) }
  }

  // Save preferences
  const savePreferences = async () => {
    setPrefSaving(true)
    try {
      await api.patch('/settings', { notifications, frictionMode })
      flash(setPrefSaved)
    } finally { setPrefSaving(false) }
  }

  // Logout
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.header}>
        <h1 style={styles.heading}>Settings</h1>
        <p style={styles.headingSub}>Manage your profile, timer, and preferences.</p>
      </div>

      <div style={styles.content}>

        {/* ── Profile ── */}
        <Section title="Profile" subtitle="Your public identity on Prism">
          <div style={styles.avatarRow}>
            <div style={styles.avatarPreview}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} onError={e => e.target.style.display='none'} />
                : <span style={{ fontSize: 28, fontWeight: 800, color:'#fff' }}>{name?.[0]?.toUpperCase() || '?'}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{user?.email}</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>Member since {memberSince}</div>
            </div>
          </div>

          <Field label="Display Name" hint="Your name shown across Prism">
            <input
              style={styles.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </Field>

          <Field label="Avatar URL" hint="Link to a profile picture (optional)">
            <input
              style={styles.input}
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="https://..."
            />
          </Field>

          <Field label="Email" hint="Cannot be changed">
            <input style={{ ...styles.input, opacity: 0.5 }} value={user?.email || ''} disabled />
          </Field>

          <SaveBtn onClick={saveProfile} loading={profileSaving} saved={profileSaved} />
        </Section>

        {/* ── Focus Timer ── */}
        <Section title="Focus Timer" subtitle="Configure your Pomodoro defaults">
          <Field label="Work Duration" hint="How long each Pomodoro focus block lasts">
            <Stepper value={pomWork} onChange={setPomWork} min={5} max={90} unit="min" />
          </Field>
          <Field label="Break Duration" hint="Short break between Pomodoros">
            <Stepper value={pomBreak} onChange={setPomBreak} min={1} max={30} unit="min" />
          </Field>
          <div style={styles.preview}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Pattern: <b style={{ color: 'var(--text-1)' }}>{pomWork}m focus</b>
              {' → '}
              <b style={{ color: 'var(--emerald)' }}>{pomBreak}m break</b>
              {' → '}
              <span style={{ color: 'var(--indigo)' }}>repeat</span>
            </div>
          </div>
          <SaveBtn onClick={saveTimer} loading={timerSaving} saved={timerSaved} />
        </Section>

        {/* ── Goals ── */}
        <Section title="Daily Goals" subtitle="Set your daily focus target">
          <Field label="Daily Focus Goal" hint="How many hours you aim to focus each day">
            <Stepper value={dailyGoal} onChange={setDailyGoal} min={1} max={12} unit="hrs" />
          </Field>
          <div style={styles.goalBar}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${Math.min(100, (dailyGoal / 12) * 100)}%`,
              background: 'var(--gradient-brand)',
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>
            {dailyGoal}h = {dailyGoal * 2} Pomodoros
          </div>
          <SaveBtn onClick={saveGoal} loading={goalSaving} saved={goalSaved} />
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences" subtitle="Notifications and friction behaviour">
          <Field label="Notifications" hint="Browser alerts when sessions complete">
            <Toggle checked={notifications} onChange={() => setNotifications(v => !v)} />
          </Field>
          <Field label="Friction Mode" hint="How cognitive friction levels are applied">
            <div style={{ display: 'flex', gap: 8 }}>
              {['auto', 'manual'].map(m => (
                <button
                  key={m} onClick={() => setFrictionMode(m)}
                  style={{
                    ...styles.modeBtn,
                    ...(frictionMode === m ? styles.modeBtnActive : {}),
                  }}
                >
                  {m === 'auto' ? '⬡ Auto' : '◉ Manual'}
                </button>
              ))}
            </div>
          </Field>
          <div style={styles.modeDesc}>
            {frictionMode === 'auto'
              ? '⬡ Auto — Aria adjusts friction levels based on your productivity patterns.'
              : '◉ Manual — You control friction levels for each site directly.'}
          </div>
          <SaveBtn onClick={savePreferences} loading={prefSaving} saved={prefSaved} />
        </Section>

        {/* ── Account ── */}
        <Section title="Account" subtitle="Manage your session and account">
          <div style={styles.accountRow}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Sign Out</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                You'll be redirected to the login page.
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-4)', lineHeight: 1.6 }}>
              Prism stores your focus data, site rules, and session history securely.
              Your data is never sold or shared with third parties.
            </div>
          </div>
        </Section>

      </div>
    </div>
  )
}

// Styles
const styles = {
  page:    { display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 720 },
  header:  { marginBottom: 24 },
  heading: { fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' },
  headingSub: { fontSize: 13, color: 'var(--text-3)', marginTop: 4 },
  content: { display: 'flex', flexDirection: 'column', gap: 16 },

  section: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 14, overflow: 'hidden',
  },
  sectionHeader: {
    padding: '16px 24px', borderBottom: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.015)',
  },
  sectionTitle: { fontSize: 14, fontWeight: 800, color: 'var(--text-1)' },
  sectionSub:   { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
  sectionBody:  { padding: '20px 24px' },

  field: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    gap: 16, marginBottom: 16,
  },
  fieldLeft:  { flex: 1 },
  fieldRight: { flexShrink: 0 },
  fieldLabel: { fontSize: 13, fontWeight: 600, color: 'var(--text-1)' },
  fieldHint:  { fontSize: 11, color: 'var(--text-3)', marginTop: 2 },

  input: {
    width: 240, padding: '8px 12px', borderRadius: 8, fontSize: 13,
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
    color: 'var(--text-1)', fontFamily: 'var(--font-sans)', outline: 'none',
    boxSizing: 'border-box',
  },

  avatarRow: {
    display: 'flex', gap: 14, alignItems: 'center',
    marginBottom: 20, padding: '12px 16px',
    background: 'var(--bg-surface)', borderRadius: 10,
    border: '1px solid var(--border)',
  },
  avatarPreview: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'var(--gradient-brand)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, overflow: 'hidden',
    boxShadow: '0 0 0 2px rgba(79,70,229,0.3)',
  },

  preview: {
    padding: '10px 14px', background: 'var(--bg-surface)',
    border: '1px solid var(--border)', borderRadius: 8, marginTop: 4,
  },

  goalBar: {
    height: 6, background: 'var(--bg-elevated)', borderRadius: 4,
    overflow: 'hidden', marginTop: 12,
  },

  modeBtn: {
    padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
    color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s',
  },
  modeBtnActive: {
    background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.4)',
    color: 'var(--indigo)',
  },
  modeDesc: {
    fontSize: 12, color: 'var(--text-3)', marginTop: 10,
    padding: '8px 12px', background: 'var(--bg-surface)',
    border: '1px solid var(--border)', borderRadius: 8,
  },

  saveBtn: {
    padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
    background: 'var(--gradient-brand)', border: 'none', color: '#fff',
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
    boxShadow: '0 2px 10px rgba(79,70,229,0.3)',
  },

  stepBtn: {
    width: 32, height: 32, borderRadius: 8, fontSize: 18, fontWeight: 700,
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
    color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stepValue: {
    width: 44, textAlign: 'center', fontSize: 18, fontWeight: 800,
    color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums',
  },

  accountRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
  },
  logoutBtn: {
    padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
    background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
    color: 'var(--rose)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s', flexShrink: 0,
  },
}
