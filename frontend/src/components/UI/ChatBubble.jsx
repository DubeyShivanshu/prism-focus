import { format } from 'date-fns'

// Simple markdown bold renderer: **text** → <strong>
const renderMarkdown = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-1)', fontWeight: 700 }}>
        {part.slice(2, -2)}
      </strong>
    }
    return part
  })
}

export default function ChatBubble({ message }) {
  const isUser  = message.role === 'user'
  const isError = message.role === 'error'
  const isAria  = message.role === 'assistant'

  const time = message.timestamp
    ? format(new Date(message.timestamp), 'h:mm a')
    : ''

  if (isUser) {
    return (
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <div style={{ maxWidth:'72%' }}>
          <div style={styles.userBubble}>
            {message.content}
          </div>
          <div style={styles.timeRight}>{time}</div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-start' }}>
        <div style={styles.ariaDot}>!</div>
        <div style={{ maxWidth:'80%' }}>
          <div style={styles.errorBubble}>{message.content}</div>
        </div>
      </div>
    )
  }

  // Aria message
  return (
    <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-start' }}>
      {/* Avatar */}
      <div style={styles.ariaAvatar}>A</div>

      <div style={{ maxWidth:'80%' }}>
        <div style={styles.ariaLabel}>Aria · AI Coach</div>
        <div style={styles.ariaBubble}>
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {renderMarkdown(line)}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <div style={styles.timeLeft}>{time}</div>
      </div>
    </div>
  )
}

const styles = {
  userBubble: {
    background: 'var(--gradient-brand)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '14px 14px 4px 14px',
    fontSize: 14,
    lineHeight: 1.5,
    boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
  },
  ariaBubble: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
    padding: '10px 14px',
    borderRadius: '4px 14px 14px 14px',
    fontSize: 14,
    lineHeight: 1.6,
  },
  errorBubble: {
    background: 'rgba(244,63,94,0.08)',
    border: '1px solid rgba(244,63,94,0.2)',
    color: 'var(--rose)',
    padding: '10px 14px',
    borderRadius: '4px 14px 14px 14px',
    fontSize: 13,
    lineHeight: 1.5,
  },
  ariaAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'var(--gradient-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 800,
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 0 2px rgba(79,70,229,0.3)',
    marginTop: 2,
  },
  ariaDot: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'rgba(244,63,94,0.15)',
    border: '1px solid rgba(244,63,94,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 800, color: 'var(--rose)', flexShrink: 0,
  },
  ariaLabel: {
    fontSize: 10,
    color: 'var(--text-4)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
  },
  timeRight: { fontSize: 10, color: 'var(--text-4)', textAlign: 'right', marginTop: 4 },
  timeLeft:  { fontSize: 10, color: 'var(--text-4)', marginTop: 4 },
}
