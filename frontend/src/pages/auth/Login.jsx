import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

// Prism Logo
const PrismLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Prism logo">
    <polygon points="24,3 45,42 3,42" fill="url(#lg)" />
    <line x1="24" y1="3" x2="24" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
    <line x1="24" y1="3" x2="3" y2="42"  stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
    <line x1="24" y1="3" x2="45" y2="42" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
    <defs>
      <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#4F46E5"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
)

// Feature item
const Feature = ({ icon, title, description }) => (
  <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
    <div style={{
      width:36, height:36, borderRadius:8, flexShrink:0,
      background:'rgba(79,70,229,0.15)', border:'1px solid rgba(79,70,229,0.25)',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontWeight:600, fontSize:14, color:'#fff', marginBottom:2 }}>{title}</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.5 }}>{description}</div>
    </div>
  </div>
)

// Login Page
export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form,    setForm]    = useState({ email:'', password:'' })
  const [errors,  setErrors]  = useState({})
  const [apiError,setApiError]= useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
    if (apiError)      setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Background glow resembling the image */}
      <div style={{ ...styles.orb, top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255, 255, 255, 0.08)', width: 600, height: 600, borderRadius: '50%', filter: 'blur(120px)' }}/>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:24 }}>
            <PrismLogo size={36} />
            <span style={{ fontSize:24, fontWeight:700, color:'#fff' }}>Prism</span>
          </div>
          <h1 style={styles.headline}>
            Clarity through,<br/>
            <span style={styles.headlineGrad}>friction.</span>
          </h1>
        </div>

        {/* Form Panel */}
        <div style={styles.formCard} className="animate-fade-in-up">
          <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em', marginBottom:6, color:'#fff' }}>
            Welcome back
          </h2>
          <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:28 }}>
            Sign in to your account
          </p>

          {/* API Error */}
          {apiError && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom:20 }}>
              <span>⚠</span> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email" style={{ color: 'var(--text-2)' }}>Email</label>
                <input
                  id="email" name="email" type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Your email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                  style={{ background: '#111', borderColor: 'rgba(255,255,255,0.05)', color: '#fff' }}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <label className="form-label" htmlFor="password" style={{ color: 'var(--text-2)' }}>Password</label>
                </div>
                <input
                  id="password" name="password" type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ background: '#111', borderColor: 'rgba(255,255,255,0.05)', color: '#fff' }}
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop:12, background: 'linear-gradient(90deg, #6b46c1, #8b5cf6)', border: 'none', height: 48, borderRadius: 12, fontWeight: 600, color: '#fff' }}
                disabled={loading}
              >
                {loading ? <><div className="spinner" />Signing in…</> : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="divider" style={{ margin:'24px 0', color: 'rgba(255,255,255,0.2)' }}>OR</div>

          {/* Google OAuth */}
          <button
            id="google-login"
            type="button"
            className="btn btn-google w-full"
            style={{ height:48, background: '#111', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', borderRadius: 12, fontWeight: 500 }}
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'var(--text-2)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#8b5cf6', fontWeight:600 }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Styles
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#050505',
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 20px',
  },
  orb: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 440,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  headline: {
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    color: '#fff',
  },
  headlineGrad: {
    background: 'linear-gradient(90deg, #6b46c1, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  formCard: {
    width: '100%',
    background: '#151518',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
  },
}
