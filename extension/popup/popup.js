// Prism Popup Script
'use strict'

const DASHBOARD_URL = 'http://localhost:5173'

// Helpers
const $  = (id) => document.getElementById(id)
const bg = (msg) => new Promise((res) => chrome.runtime.sendMessage(msg, res))

const FRICTION_NAMES = ['Off', 'Mild', 'Moderate', 'Severe']
const FRICTION_COLORS = ['transparent', '#F59E0B', '#F97316', '#EF4444']

function timeAgo(ts) {
  if (!ts) return 'Never'
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

function formatDuration(startTime) {
  const secs = Math.floor((Date.now() - new Date(startTime)) / 1000)
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

// Render connected state
function renderConnected(state, currentDomain, currentRule) {
  $('connectedView').classList.remove('hidden')
  $('notConnectedView').classList.add('hidden')
  $('syncRow').style.display = 'flex'

  // Status badge
  $('statusBadge').className = 'status-badge connected'
  $('statusText').textContent = 'Connected'

  // Stats
  $('ruleCount').textContent = state.ruleCount || 0
  $('syncAge').textContent   = timeAgo(state.lastSync)
  $('syncTimeLabel').textContent = `Synced ${timeAgo(state.lastSync)}`

  // Current site
  $('siteDomain').textContent = currentDomain || '—'
  if (currentRule) {
    const lvl = currentRule.frictionLevel
    const color = FRICTION_COLORS[lvl]
    for (let i = 1; i <= 3; i++) {
      const el = $(`f${i}`)
      el.style.background = i <= lvl ? color : 'rgba(255,255,255,0.1)'
    }
    $('frictionLabel').textContent = `${FRICTION_NAMES[lvl]} friction — ${currentRule.name}`
    $('frictionLabel').style.color = lvl > 0 ? color : 'rgba(255,255,255,0.4)'
  } else {
    $('frictionLabel').textContent = 'No rule — site is not blocked'
  }

  // Active session
  if (state.activeSession) {
    $('sessionCard').style.display = 'flex'
    $('noSession').style.display   = 'none'
    const t = state.activeSession.type?.replace('_', ' ')
    $('sessionType').textContent   = t || 'Focus'
    $('sessionTimer').textContent  = formatDuration(state.activeSession.startTime)
    // Live update every second
    setInterval(() => {
      $('sessionTimer').textContent = formatDuration(state.activeSession.startTime)
    }, 1000)
  } else {
    $('sessionCard').style.display = 'none'
    $('noSession').style.display   = 'block'
  }
}

// Render disconnected state
function renderDisconnected() {
  $('connectedView').classList.add('hidden')
  $('notConnectedView').classList.remove('hidden')
  $('syncRow').style.display = 'none'
  $('statusBadge').className = 'status-badge disconnected'
  $('statusText').textContent = 'Not connected'
}

// Get current tab domain 
async function getCurrentDomain() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      try {
        const url    = new URL(tabs[0]?.url || '')
        const domain = url.hostname.replace(/^www\./, '')
        resolve(domain)
      } catch {
        resolve(null)
      }
    })
  })
}

// Get rule for current domain
async function getRuleForDomain(domain) {
  if (!domain) return null
  const { rules = [] } = await chrome.storage.local.get('rules')
  return rules.find(r => domain === r.domain || domain.endsWith('.' + r.domain)) || null
}

// Init
async function init() {
  const [state, currentDomain] = await Promise.all([
    bg({ type: 'GET_STATE' }),
    getCurrentDomain(),
  ])

  if (!state?.connected) {
    renderDisconnected()
    return
  }

  const currentRule = await getRuleForDomain(currentDomain)
  renderConnected(state, currentDomain, currentRule)
}

// Button handlers
document.addEventListener('DOMContentLoaded', () => {
  init()

  // Connect with token
  $('connectBtn').addEventListener('click', async () => {
    const token = $('tokenInput').value.trim()
    if (!token) return
    $('connectBtn').textContent  = 'Connecting…'
    $('connectBtn').disabled     = true
    const res = await bg({ type: 'SET_TOKEN', token })
    if (res?.ok) {
      init()
    } else {
      $('connectBtn').textContent = 'Connect Prism'
      $('connectBtn').disabled    = false
    }
  })

  // Open dashboard (both views)
  const openDash = () => chrome.tabs.create({ url: DASHBOARD_URL })
  $('openDashBtn2').addEventListener('click', openDash)
  $('openDashBtn')?.addEventListener('click', openDash)

  // Sync now
  const doSync = async (btn) => {
    if (btn) btn.textContent = 'Syncing…'
    await bg({ type: 'SYNC_NOW' })
    if (btn) btn.textContent = '↺ Sync Rules Now'
    init()
  }
  $('syncBtn')?.addEventListener('click',  () => doSync($('syncBtn')))
  $('syncBtn2')?.addEventListener('click', () => doSync(null))

  // Disconnect
  $('disconnectBtn')?.addEventListener('click', async () => {
    await bg({ type: 'DISCONNECT' })
    renderDisconnected()
  })
})
