/**
 * Prism Extension Bridge
 * Called after login to silently send a LONG-LIVED extension token to the
 * Prism Chrome extension (if installed). Fails gracefully if not installed.
 *
 * The extension token lasts 30 days, unlike the short-lived 15-min access token.
 * It is fetched from /api/auth/extension-token using the current access token.
 */
export async function bridgeExtension(accessToken) {
  if (!accessToken) return
  try {
    if (typeof chrome === 'undefined' || !chrome?.runtime?.sendMessage) return

    // Fetch a long-lived extension token from the backend
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const res = await fetch(`${BASE_URL}/auth/extension-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    })

    if (!res.ok) return
    const data = await res.json()
    const extToken = data.data?.token
    if (!extToken) return

    // Send the long-lived token to the extension
    chrome.runtime.sendMessage(
      undefined,
      { type: 'SET_TOKEN', token: extToken },
      () => { /* ignore errors — extension may not be installed */ }
    )
  } catch {
    // Extension not installed — silent fail
  }
}
