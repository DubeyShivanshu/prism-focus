import { useState, useEffect, useRef } from 'react'
import { useCoachStore } from '../../store/coachStore'
import { useAuthStore }  from '../../store/authStore'
import ChatBubble from '../../components/UI/ChatBubble'

// Typing indicator
function TypingIndicator() {
  return (
    <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-start' }}>
      <div style={dotAvatar}>A</div>
      <div style={typingBubble}>
        <span style={dot} className="typing-dot" />
        <span style={{ ...dot, animationDelay: '0.15s' }} className="typing-dot" />
        <span style={{ ...dot, animationDelay: '0.3s'  }} className="typing-dot" />
      </div>
    </div>
  )
}

const dotAvatar = {
  width:32, height:32, borderRadius:'50%',
  background:'var(--gradient-brand)',
  display:'flex', alignItems:'center', justifyContent:'center',
  fontSize:13, fontWeight:800, color:'#fff', flexShrink:0,
  boxShadow:'0 0 0 2px rgba(79,70,229,0.3)',
}
const typingBubble = {
  display:'flex', gap:4, alignItems:'center',
  background:'var(--bg-elevated)',
  border:'1px solid var(--border)',
  padding:'12px 16px',
  borderRadius:'4px 14px 14px 14px',
}
const dot = {
  width:6, height:6, borderRadius:'50%',
  background:'var(--text-3)',
  display:'inline-block',
  animation:'typingBounce 0.9s ease-in-out infinite',
}

// Context sidebar panel
function ContextPanel({ user }) {
  const streak = user?.streak?.current || 0
  const score  = user?.productivityScore || 0
  const hours  = Math.round((user?.totalFocusMinutes || 0) / 60)

  const scoreColor = score >= 70 ? 'var(--emerald)' : score >= 40 ? 'var(--amber)' : 'var(--rose)'

  return (
    <div style={styles.contextPanel}>
      {/* Aria avatar */}
      <div style={styles.avatarSection}>
        <div style={styles.avatarRing}>
          <div style={styles.avatar}>A</div>
          <div style={styles.avatarOnline} />
        </div>
        <div style={styles.ariaName}>Aria</div>
        <div style={styles.ariaRole}>AI Productivity Coach</div>
        <div style={styles.ariaBadge}>● Online</div>
      </div>

      {/* Divider */}
      <div style={{ borderTop:'1px solid var(--border)', margin:'16px 0' }} />

      {/* User context */}
      <div style={styles.contextTitle}>Your context</div>
      <div style={styles.contextItems}>
        <div style={styles.ctxItem}>
          <span style={styles.ctxIcon}>🔥</span>
          <div>
            <div style={styles.ctxVal}>{streak} day{streak !== 1 ? 's' : ''}</div>
            <div style={styles.ctxLabel}>Current streak</div>
          </div>
        </div>
        <div style={styles.ctxItem}>
          <span style={styles.ctxIcon}>◈</span>
          <div>
            <div style={{ ...styles.ctxVal, color: scoreColor }}>{score}/100</div>
            <div style={styles.ctxLabel}>Productivity score</div>
          </div>
        </div>
        <div style={styles.ctxItem}>
          <span style={styles.ctxIcon}>◷</span>
          <div>
            <div style={styles.ctxVal}>{hours}h</div>
            <div style={styles.ctxLabel}>Total focus time</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop:'1px solid var(--border)', margin:'16px 0' }} />

      {/* About */}
      <div style={styles.contextTitle}>About Aria</div>
      <p style={styles.aboutText}>
        Aria analyses your Prism data in real-time to give personalised coaching. She knows your streak, score, and which sites distract you most.
      </p>

      <div style={styles.modelTag}>Powered by Gemini 2.5 Flash</div>
    </div>
  )
}

// Main Coach Page
export default function Coach() {
  const { user }                                  = useAuthStore()
  const { messages, suggestions, isTyping,
          sendMessage, fetchSuggestions, clearChat } = useCoachStore()

  const [input, setInput]   = useState('')
  const bottomRef           = useRef(null)
  const inputRef            = useRef(null)

  useEffect(() => { fetchSuggestions() }, [fetchSuggestions])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    const txt = input.trim()
    if (!txt || isTyping) return
    setInput('')
    await sendMessage(txt)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (s) => {
    setInput(s)
    inputRef.current?.focus()
  }

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.layout}>

        {/* ── Left: context panel ── */}
        <ContextPanel user={user} />

        {/* ── Right: chat panel ── */}
        <div style={styles.chatPanel}>
          {/* Chat header */}
          <div style={styles.chatHeader}>
            <div style={styles.chatTitle}>Chat with Aria</div>
            <button
              onClick={clearChat}
              style={styles.clearBtn}
              title="Clear conversation"
            >
              ↺ Clear
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messages}>
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only when few messages) */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <div style={styles.suggestions}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  style={styles.suggestionBtn}
                  onClick={() => handleSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={styles.inputRow}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Aria anything about your focus, habits, or productivity…"
              rows={1}
              style={styles.textarea}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                ...styles.sendBtn,
                opacity: (!input.trim() || isTyping) ? 0.4 : 1,
                cursor:  (!input.trim() || isTyping) ? 'not-allowed' : 'pointer',
              }}
            >
              {isTyping ? '…' : '↑'}
            </button>
          </div>
          <div style={styles.inputHint}>Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>

      {/* Typing animation keyframes */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot { animation: typingBounce 0.9s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

// Styles
const styles = {
  page: { height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' },
  layout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: 20,
    flex: 1,
    minHeight: 0,
  },

  // Context panel
  contextPanel: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 20,
    overflow: 'auto',
  },
  avatarSection: { display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  avatarRing: { position:'relative', width:72, height:72 },
  avatar: {
    width:72, height:72, borderRadius:'50%',
    background:'var(--gradient-brand)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:28, fontWeight:900, color:'#fff',
    boxShadow:'0 0 0 3px rgba(79,70,229,0.3), 0 4px 20px rgba(79,70,229,0.3)',
  },
  avatarOnline: {
    position:'absolute', bottom:3, right:3,
    width:14, height:14, borderRadius:'50%',
    background:'var(--emerald)',
    border:'2px solid var(--bg-card)',
  },
  ariaName: { fontSize:16, fontWeight:800, color:'var(--text-1)' },
  ariaRole: { fontSize:11, color:'var(--text-3)', textAlign:'center' },
  ariaBadge: {
    fontSize:10, color:'var(--emerald)', fontWeight:600,
    background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)',
    padding:'2px 8px', borderRadius:99,
  },
  contextTitle: { fontSize:10, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 },
  contextItems: { display:'flex', flexDirection:'column', gap:10 },
  ctxItem: { display:'flex', gap:10, alignItems:'center' },
  ctxIcon: { fontSize:18, width:24, textAlign:'center', flexShrink:0 },
  ctxVal:  { fontSize:15, fontWeight:800, color:'var(--text-1)', lineHeight:1 },
  ctxLabel:{ fontSize:10, color:'var(--text-4)', marginTop:1 },
  aboutText: { fontSize:12, color:'var(--text-3)', lineHeight:1.6, margin:0 },
  modelTag: {
    marginTop:16, fontSize:10, color:'var(--text-4)',
    background:'var(--bg-surface)', border:'1px solid var(--border)',
    padding:'4px 8px', borderRadius:6, display:'inline-block',
  },

  // Chat panel
  chatPanel: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  chatHeader: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'14px 20px',
    borderBottom:'1px solid var(--border)',
    flexShrink:0,
  },
  chatTitle: { fontSize:14, fontWeight:700, color:'var(--text-1)' },
  clearBtn: {
    fontSize:12, color:'var(--text-3)', cursor:'pointer',
    background:'transparent', border:'none',
    padding:'4px 8px', borderRadius:6,
    fontFamily:'var(--font-sans)',
    transition:'color 0.15s',
  },
  messages: {
    flex:1, overflowY:'auto',
    padding:'20px',
    display:'flex', flexDirection:'column',
  },
  suggestions: {
    display:'flex', flexWrap:'wrap', gap:8,
    padding:'0 20px 12px',
    flexShrink:0,
  },
  suggestionBtn: {
    fontSize:12, color:'var(--indigo)',
    background:'rgba(79,70,229,0.08)',
    border:'1px solid rgba(79,70,229,0.2)',
    borderRadius:99, padding:'6px 12px',
    cursor:'pointer', fontFamily:'var(--font-sans)',
    transition:'all 0.15s',
    textAlign:'left',
    lineHeight:1.3,
  },
  inputRow: {
    display:'flex', gap:10, padding:'12px 20px',
    borderTop:'1px solid var(--border)',
    alignItems:'flex-end',
    flexShrink:0,
  },
  textarea: {
    flex:1,
    background:'var(--bg-surface)',
    border:'1px solid var(--border)',
    borderRadius:10,
    padding:'10px 14px',
    fontSize:14,
    color:'var(--text-1)',
    fontFamily:'var(--font-sans)',
    resize:'none',
    outline:'none',
    lineHeight:1.5,
    transition:'border-color 0.15s',
    maxHeight:120,
  },
  sendBtn: {
    width:40, height:40,
    borderRadius:10,
    background:'var(--gradient-brand)',
    color:'#fff',
    fontSize:20,
    display:'flex', alignItems:'center', justifyContent:'center',
    border:'none',
    flexShrink:0,
    transition:'opacity 0.15s',
    fontWeight:700,
  },
  inputHint: {
    fontSize:10, color:'var(--text-4)',
    textAlign:'center', padding:'0 20px 10px',
    flexShrink:0,
  },
}
