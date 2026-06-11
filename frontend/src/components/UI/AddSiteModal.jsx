import { useState } from 'react'

const CATEGORIES = ['social', 'entertainment', 'news', 'gaming', 'shopping', 'other']

const FRICTION_LEVELS = [
  { value: 0, label: 'Off',      desc: 'Tracking only',        color: 'var(--text-4)' },
  { value: 1, label: 'Mild',     desc: 'Subtle visual noise',   color: 'var(--amber)'  },
  { value: 2, label: 'Moderate', desc: 'Grayscale + blur',      color: 'var(--orange)' },
  { value: 3, label: 'Severe',   desc: 'Full page distortion',  color: 'var(--rose)'   },
]

export default function AddSiteModal({ onClose, onAdd }) {
  const [form,    setForm]    = useState({ domain: '', name: '', category: 'social', frictionLevel: 2 })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.domain.trim()) { setError('Domain is required'); return }

    // Normalise domain (strip https://, www., trailing slash)
    const domain = form.domain.trim()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .toLowerCase()

    setLoading(true)
    setError('')
    try {
      await onAdd({ ...form, domain })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add site')
    } finally {
      setLoading(false)
    }
  }

  const selectedFriction = FRICTION_LEVELS[form.frictionLevel]

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="animate-fade-in-up">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Add Blocked Site</div>
            <div style={styles.sub}>Cognitive friction will be applied when you visit this site</div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {error && (
          <div style={styles.errorBanner}>⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Domain */}
          <div style={styles.field}>
            <label style={styles.label}>Domain *</label>
            <input
              style={styles.input}
              placeholder="youtube.com"
              value={form.domain}
              onChange={e => set('domain', e.target.value)}
              autoFocus
            />
            <div style={styles.hint}>Just the domain — no https:// or www.</div>
          </div>

          {/* Display name */}
          <div style={styles.field}>
            <label style={styles.label}>Display Name <span style={{ color:'var(--text-4)' }}>(optional)</span></label>
            <input
              style={styles.input}
              placeholder="YouTube"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Category */}
          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <div style={styles.catGrid}>
              {CATEGORIES.map(c => (
                <button
                  type="button" key={c}
                  onClick={() => set('category', c)}
                  style={{
                    ...styles.catBtn,
                    ...(form.category === c ? styles.catBtnActive : {}),
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Friction level */}
          <div style={styles.field}>
            <label style={styles.label}>Friction Level</label>
            <div style={styles.frictionGrid}>
              {FRICTION_LEVELS.map(f => (
                <button
                  type="button" key={f.value}
                  onClick={() => set('frictionLevel', f.value)}
                  style={{
                    ...styles.frictionBtn,
                    ...(form.frictionLevel === f.value ? { ...styles.frictionBtnActive, borderColor: f.color } : {}),
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>
                    {f.value === 0 ? '⊘' : f.value === 1 ? '◑' : f.value === 2 ? '◕' : '●'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: form.frictionLevel === f.value ? f.color : 'var(--text-2)' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {form.domain && (
            <div style={styles.preview}>
              <img
                src={`https://www.google.com/s2/favicons?domain=${form.domain}&sz=16`}
                style={{ width:16, height:16 }} alt=""
              />
              <span style={{ color:'var(--text-2)', fontSize:13 }}>
                <b style={{ color:'var(--text-1)' }}>{form.name || form.domain}</b>
                {' '}will receive{' '}
                <span style={{ color: selectedFriction.color, fontWeight:700 }}>
                  {selectedFriction.label}
                </span>
                {' '}friction
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={styles.addBtn}>
              {loading ? 'Adding…' : '+ Add Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 28,
    width: '100%', maxWidth: 520,
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  title:    { fontSize: 17, fontWeight: 800, color: 'var(--text-1)' },
  sub:      { fontSize: 12, color: 'var(--text-3)', marginTop: 4 },
  closeBtn: {
    background: 'none', border: 'none', color: 'var(--text-3)',
    fontSize: 18, cursor: 'pointer', padding: 4, lineHeight: 1,
  },
  errorBanner: {
    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
    color: 'var(--rose)', borderRadius: 8, padding: '8px 12px',
    fontSize: 13, marginBottom: 16,
  },
  field:    { marginBottom: 20 },
  label:    { fontSize: 12, fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 12px', fontSize: 14, color: 'var(--text-1)',
    fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
  },
  hint:     { fontSize: 11, color: 'var(--text-4)', marginTop: 4 },
  catGrid:  { display: 'flex', flexWrap: 'wrap', gap: 6 },
  catBtn: {
    padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
    color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    textTransform: 'capitalize', transition: 'all 0.15s',
  },
  catBtnActive: {
    background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.4)',
    color: 'var(--indigo)',
  },
  frictionGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  frictionBtn: {
    padding: '12px 8px', borderRadius: 10, fontSize: 12,
    border: '1px solid var(--border)', background: 'var(--bg-surface)',
    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
    fontFamily: 'var(--font-sans)',
  },
  frictionBtnActive: { background: 'rgba(79,70,229,0.08)' },
  preview: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 12px', marginBottom: 20,
  },
  actions:   { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
  },
  addBtn: {
    padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700,
    background: 'var(--gradient-brand)', border: 'none',
    color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)',
  },
}
