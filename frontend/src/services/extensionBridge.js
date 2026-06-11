/**
 * Prism Extension Bridge
 * Called after login to silently send the access token to the Prism
 * Chrome extension (if installed). Fails gracefully if not installed.
 */
export function bridgeExtension(token) {
  if (!token) return
  try {
    // chrome.runtime is only available when the extension is installed
    if (typeof chrome === 'undefined' || !chrome?.runtime?.sendMessage) return

    // The extension ID is set in the manifest — wildcard for dev
    // In production, replace with your actual extension ID
    chrome.runtime.sendMessage(
      undefined, // broadcast to any Prism extension
      { type: 'SET_TOKEN', token },
      () => { /* ignore errors — extension may not be installed */ }
    )
  } catch {
    // Extension not installed — silent fail
  }
}
