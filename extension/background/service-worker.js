// Prism Background Service Worker
// Responsibilities:
//  1. Sync blocked site rules from the Prism API every 5 minutes
//  2. Store rules & auth token in chrome.storage.local
//  3. Respond to messages from content script and popup

const API_BASE = 'http://localhost:5000/api'
const SYNC_ALARM = 'prism-sync'
const SYNC_INTERVAL_MINUTES = 5

// Install / startup 
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Prism] Extension installed')
  chrome.alarms.create(SYNC_ALARM, { periodInMinutes: SYNC_INTERVAL_MINUTES })
  syncRules()
})

chrome.runtime.onStartup.addListener(() => {
  syncRules()
})

// Alarm: periodic sync 
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM) syncRules()
})

// Map string friction levels to numbers for the content script
const FRICTION_MAP = { off: 0, mild: 1, moderate: 2, severe: 3 }
function frictionNum(level) {
  if (typeof level === 'number') return level
  return FRICTION_MAP[String(level).toLowerCase()] ?? 1
}

// Sync blocked rules from API
async function syncRules() {
  try {
    const { accessToken } = await chrome.storage.local.get('accessToken')
    if (!accessToken) {
      console.log('[Prism] No token — skipping sync')
      return
    }

    const res = await fetch(`${API_BASE}/blocks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (res.status === 401) {
      console.warn('[Prism] Token expired — clearing')
      await chrome.storage.local.remove(['accessToken', 'rules'])
      return
    }

    if (!res.ok) throw new Error(`API ${res.status}`)

    const data  = await res.json()
    const sites = data.data?.sites || []

    // Only store enabled sites with friction > 0
    const rules = sites
      .filter(s => s.isEnabled)
      .map(s => ({
        domain:        s.domain,
        name:          s.name || s.domain,
        frictionLevel: frictionNum(s.frictionLevel),
        category:      s.category,
      }))
      .filter(r => r.frictionLevel > 0)

    await chrome.storage.local.set({ rules, lastSync: Date.now() })
    console.log(`[Prism] Synced ${rules.length} rules`, rules)
  } catch (err) {
    console.error('[Prism] Sync failed:', err.message)
  }
}


// Fetch active session 
async function getActiveSession() {
  try {
    const { accessToken } = await chrome.storage.local.get('accessToken')
    if (!accessToken) return null

    const res = await fetch(`${API_BASE}/sessions/active`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data?.session || null
  } catch {
    return null
  }
}

// Message handler
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {

    // Content script asks: is this domain blocked?
    case 'CHECK_DOMAIN': {
      chrome.storage.local.get('rules').then(({ rules = [] }) => {
        const domain = msg.domain?.toLowerCase()
        const rule   = rules.find(r => domain === r.domain || domain.endsWith('.' + r.domain))
        sendResponse({ rule: rule || null })
      })
      return true // async
    }

    // Popup requests full state
    case 'GET_STATE': {
      Promise.all([
        chrome.storage.local.get(['accessToken', 'rules', 'lastSync']),
        getActiveSession(),
      ]).then(([store, session]) => {
        sendResponse({
          connected:    !!store.accessToken,
          ruleCount:    (store.rules || []).length,
          lastSync:     store.lastSync || null,
          activeSession: session,
        })
      })
      return true
    }

    // Dashboard sends token after login
    case 'SET_TOKEN': {
      chrome.storage.local.set({ accessToken: msg.token }).then(() => {
        syncRules()
        sendResponse({ ok: true })
      })
      return true
    }

    // Popup requests immediate sync
    case 'SYNC_NOW': {
      syncRules().then(() => sendResponse({ ok: true }))
      return true
    }

    // Popup disconnects
    case 'DISCONNECT': {
      chrome.storage.local.remove(['accessToken', 'rules']).then(() => {
        sendResponse({ ok: true })
      })
      return true
    }
  }
})
