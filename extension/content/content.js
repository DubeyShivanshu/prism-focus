// Prism Content Script — Cognitive Friction Engine
// Runs at document_start on every page.
// Checks domain against user's blocked rules, then applies friction CSS.

(function () {
  'use strict'

  const domain = location.hostname.replace(/^www\./, '')

  // Ask background for matching rule
  chrome.runtime.sendMessage({ type: 'CHECK_DOMAIN', domain }, (response) => {
    if (chrome.runtime.lastError) return // extension context invalidated
    const rule = response?.rule
    if (!rule || rule.frictionLevel === 0) return
    applyFriction(rule)
  })

  // Apply friction based on level
  function applyFriction(rule) {
    const level = rule.frictionLevel

    // Inject friction CSS
    const style = document.createElement('style')
    style.id = '__prism_friction__'
    style.textContent = getFrictionCSS(level)
    document.documentElement.appendChild(style)

    // For level 3: inject warning overlay (waits for body)
    if (level >= 3) {
      if (document.body) injectOverlay(rule)
      else document.addEventListener('DOMContentLoaded', () => injectOverlay(rule))
    }

    // For level 2+: slow down animations
    if (level >= 2) {
      document.documentElement.style.setProperty('--prism-delay', '1.5s')
    }
  }

  // CSS per friction level
  function getFrictionCSS(level) {
    const filters = {
      1: 'grayscale(30%) brightness(0.95)',
      2: 'grayscale(80%) blur(0.4px) brightness(0.85)',
      3: 'grayscale(100%) blur(1px) brightness(0.7) contrast(1.1)',
    }

    const filter = filters[Math.min(level, 3)] || ''

    return `
      html {
        filter: ${filter} !important;
        transition: filter 0.8s ease !important;
      }
      /* Slow down all animations at level 2+ */
      ${level >= 2 ? `
      *, *::before, *::after {
        animation-duration: 3s !important;
        animation-delay:    1s !important;
        transition-duration: 0.8s !important;
      }` : ''}
      /* Hide algorithmic feeds at level 3 */
      ${level >= 3 ? `
      [data-testid="primaryColumn"] > div > div:nth-child(2),
      [role="feed"] > div:not(:first-child),
      .ytd-rich-grid-renderer:not(:first-child),
      #shorts-container,
      [aria-label="Reels"],
      ._9AhH0 { display: none !important; }
      ` : ''}
      #__prism_overlay__ {
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        width: 100% !important; height: 100% !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: rgba(0,0,0,0.82) !important;
        backdrop-filter: blur(8px) !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      }
      #__prism_card__ {
        background: #0f0f1a !important;
        border: 1px solid rgba(79,70,229,0.4) !important;
        border-radius: 16px !important;
        padding: 36px !important;
        max-width: 420px !important;
        width: 90% !important;
        text-align: center !important;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(79,70,229,0.15) !important;
        color: #fff !important;
      }
    `
  }

  // Friction overlay (level 3)
  function injectOverlay(rule) {
    if (document.getElementById('__prism_overlay__')) return

    const overlay = document.createElement('div')
    overlay.id    = '__prism_overlay__'
    overlay.innerHTML = `
      <div id="__prism_card__">
        <div style="font-size:48px;margin-bottom:12px">⬡</div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;
          background:linear-gradient(90deg,#4F46E5,#7C3AED);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent">
          Cognitive Friction Active
        </div>
        <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:6px;line-height:1.5">
          Prism has flagged <b style="color:rgba(255,255,255,0.8)">${rule.name}</b>
          as a <b style="color:rgba(255,255,255,0.8)">${rule.category}</b> distraction.
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:24px">
          Your friction level is set to <b style="color:#f43f5e">Severe</b>.
        </div>
        <div style="display:flex;gap:10px;justify-content:center">
          <button id="__prism_dismiss__" style="
            padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;
            background:linear-gradient(135deg,#4F46E5,#7C3AED);
            border:none;color:#fff;cursor:pointer;font-family:inherit">
            I understand — Let me in
          </button>
          <button id="__prism_back__" style="
            padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;
            background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
            color:rgba(255,255,255,0.6);cursor:pointer;font-family:inherit">
            ← Go back
          </button>
        </div>
      </div>
    `
    document.body.appendChild(overlay)

    // Dismiss → remove overlay but keep grayscale filter
    document.getElementById('__prism_dismiss__').addEventListener('click', () => {
      overlay.remove()
      // Record override to background
      chrome.runtime.sendMessage({ type: 'RECORD_OVERRIDE', domain, rule })
    })

    // Go back → navigate away
    document.getElementById('__prism_back__').addEventListener('click', () => {
      history.back() || (location.href = 'chrome://newtab')
    })
  }
})()
