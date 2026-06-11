import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import AddSiteModal from '../../components/UI/AddSiteModal'

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['all', 'social', 'entertainment', 'news', 'gaming', 'shopping', 'other']

const CATEGORY_COLORS = {
  social:        '#4F46E5',
  entertainment: '#7C3AED',
  news:          '#06B6D4',
  gaming:        '#F59E0B',
  shopping:      '#10B981',
  other:         '#6B7280',
}

const FRICTION_LABELS = ['Off', 'Mild', 'Moderate', 'Severe']
const FRICTION_COLORS = ['var(--text-4)', 'var(--amber)', 'var(--orange)', 'var(--rose)']

// ─── Friction bar ─────────────────────────────────────────────────────────────
function FrictionBar({ level }) {
  const color = FRICTION_COLORS[level] || 'var(--text-4)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 14, height: 6, borderRadius: 3,
            background: i <= level && level > 0 ? color : 'var(--bg-elevated)',
            transition: 'background 0.2s',
          }}/>
        ))}
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>
        {FRICTION_LABELS[level]}
      </span>
    </div>
  )
}

// ─── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
        background: checked ? 'var(--indigo)' : 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: checked ? 18 : 2,
        width: 14, height: 14, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}/>
    </div>
  )
}

// ─── Site Card ─────────────────────────────────────────────────────────────────
function SiteCard({ site, onToggle, onDelete, onFrictionChange }) {
  const [deleting, setDeleting] = useState(false)
  const catColor = CATEGORY_COLORS[site.category] || CATEGORY_COLORS.other

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${site.name || site.domain}?`)) return
    setDeleting(true)
    await onDelete(site._id)
  }

  return (
    <div style={{
      ...cardStyle,
      opacity: deleting ? 0.5 : 1,
      borderLeft: `3px solid ${site.isEnabled ? 'var(--indigo)' : 'var(--border)'}`,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
          <img
            src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`}
            style={{ width: 24, height: 24, borderRadius: 4, flexShrink: 0 }}
            alt=""
            onError={e => { e.target.style.display = 'none' }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {site.name || site.domain}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{site.domain}</div>
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
          background: catColor + '18', color: catColor,
          border: `1px solid ${catColor}40`,
          textTransform: 'capitalize', flexShrink: 0,
        }}>
          {site.category}
        </div>
      </div>

      {/* Friction selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Friction Level
        </div>
        <FrictionBar level={site.frictionLevel} />
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {[0, 1, 2, 3].map(lvl => (
            <button
              key={lvl}
              onClick={() => onFrictionChange(site._id, lvl)}
              style={{
                flex: 1, padding: '3px 0', borderRadius: 4, fontSize: 10,
                border: `1px solid ${site.frictionLevel === lvl ? FRICTION_COLORS[lvl] : 'var(--border)'}`,
                background: site.frictionLevel === lvl ? FRICTION_COLORS[lvl] + '18' : 'transparent',
                color: site.frictionLevel === lvl ? FRICTION_COLORS[lvl] : 'var(--text-4)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {FRICTION_LABELS[lvl]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 11, color: 'var(--text-3)' }}>
        <span>⊘ {site.stats?.overrideCount || 0} overrides</span>
        <span>◷ {site.stats?.totalVisitCount || 0} visits</span>
        {site.stats?.totalTimeWasted > 0 && (
          <span>⌛ {site.stats.totalTimeWasted}m wasted</span>
        )}
      </div>

      {/* Bottom row: toggle + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Toggle checked={site.isEnabled} onChange={() => onToggle(site._id)} />
          <span style={{ fontSize: 11, color: site.isEnabled ? 'var(--emerald)' : 'var(--text-4)', fontWeight: 600 }}>
            {site.isEnabled ? 'Active' : 'Paused'}
          </span>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: 'none', border: 'none', color: 'var(--text-4)',
            cursor: 'pointer', fontSize: 16, padding: '2px 6px', borderRadius: 4,
            transition: 'color 0.15s',
          }}
          title="Remove site"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--rose)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 16,
  transition: 'opacity 0.2s',
}

// ─── Main Sites Page ───────────────────────────────────────────────────────────
export default function Sites() {
  const [sites,      setSites]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [showModal,  setShowModal]  = useState(false)
  const [search,     setSearch]     = useState('')

  // ── Load sites ──────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/blocks')
      setSites(data.data.sites || [])
    } catch (err) {
      console.error('Failed to load blocked sites:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Add site ────────────────────────────────────────────────
  const handleAdd = async (payload) => {
    const { data } = await api.post('/blocks', payload)
    setSites(s => [data.data.site, ...s])
  }

  // ── Toggle enable/disable ───────────────────────────────────
  const handleToggle = async (id) => {
    const { data } = await api.patch(`/blocks/${id}/toggle`)
    setSites(s => s.map(site => site._id === id ? data.data.site : site))
  }

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = async (id) => {
    await api.delete(`/blocks/${id}`)
    setSites(s => s.filter(site => site._id !== id))
  }

  // ── Change friction level inline ────────────────────────────
  const handleFriction = async (id, frictionLevel) => {
    const { data } = await api.patch(`/blocks/${id}`, { frictionLevel })
    setSites(s => s.map(site => site._id === id ? data.data.site : site))
  }

  // ── Filtered + searched sites ───────────────────────────────
  const filtered = sites.filter(s => {
    const matchCat    = filter === 'all' || s.category === filter
    const matchSearch = !search || s.domain.includes(search.toLowerCase()) || (s.name || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // ── Summary stats ───────────────────────────────────────────
  const totalActive   = sites.filter(s => s.isEnabled).length
  const totalOverrides = sites.reduce((sum, s) => sum + (s.stats?.overrideCount || 0), 0)

  return (
    <div style={styles.page} className="animate-fade-in">
      {/* Header */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.heading}>Blocked Sites</h1>
          <p style={styles.headingSub}>Manage cognitive friction for distracting sites.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.addBtn}>
          + Add Site
        </button>
      </div>

      {/* Summary row */}
      <div style={styles.summaryRow}>
        {[
          { label: 'Total Sites',  value: sites.length,  icon: '⬡' },
          { label: 'Active',       value: totalActive,    icon: '◉', color: 'var(--emerald)' },
          { label: 'Paused',       value: sites.length - totalActive, icon: '◎', color: 'var(--amber)' },
          { label: 'Overrides',    value: totalOverrides, icon: '⊘', color: 'var(--rose)' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={styles.summaryCard}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: color || 'var(--text-1)' }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={styles.filterRow}>
        <div style={styles.tabs}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{ ...styles.tab, ...(filter === cat ? styles.tabActive : {}) }}
            >
              {cat === 'all' ? 'All' : cat}
              {cat !== 'all' && (
                <span style={styles.tabCount}>
                  {sites.filter(s => s.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          style={styles.search}
          placeholder="Search sites…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Site grid */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
          <div className="spinner spinner-indigo" style={{ width:32, height:32 }}/>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 12 }}>⊘</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>
            {sites.length === 0 ? 'No sites blocked yet' : 'No sites match your filter'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
            {sites.length === 0
              ? 'Add your first distracting site to start applying cognitive friction.'
              : 'Try a different category or clear the search.'}
          </div>
          {sites.length === 0 && (
            <button onClick={() => setShowModal(true)} style={styles.addBtn}>
              + Add Your First Site
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(site => (
            <SiteCard
              key={site._id}
              site={site}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onFrictionChange={handleFriction}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddSiteModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heading:    { fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' },
  headingSub: { fontSize: 13, color: 'var(--text-3)', marginTop: 2 },
  addBtn: {
    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
    background: 'var(--gradient-brand)', border: 'none', color: '#fff',
    cursor: 'pointer', fontFamily: 'var(--font-sans)',
    boxShadow: '0 2px 12px rgba(79,70,229,0.35)',
    transition: 'opacity 0.15s',
  },
  summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  summaryCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '16px 18px',
  },
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  tabs: {
    display: 'flex', gap: 4, background: 'var(--bg-surface)',
    border: '1px solid var(--border)', padding: 4, borderRadius: 10,
    flexWrap: 'wrap', flex: 1,
  },
  tab: {
    padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600,
    color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    border: 'none', background: 'transparent', textTransform: 'capitalize',
    display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
  },
  tabActive: { background: 'var(--bg-card)', color: 'var(--text-1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' },
  tabCount: {
    fontSize: 10, background: 'var(--bg-elevated)', color: 'var(--text-4)',
    padding: '1px 5px', borderRadius: 99, minWidth: 16, textAlign: 'center',
  },
  search: {
    padding: '8px 14px', borderRadius: 8, fontSize: 13, width: 200,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-1)', fontFamily: 'var(--font-sans)', outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '60px 20px', textAlign: 'center',
  },
}
