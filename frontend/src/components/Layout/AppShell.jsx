import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app-shell">
      {/* Mobile backdrop — closes sidebar when tapped */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
