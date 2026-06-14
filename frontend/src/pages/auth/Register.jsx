import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

// Prism Logo
const PrismLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Prism logo">
    <polygon points="24,3 45,42 3,42" fill="url(#rg)" />
    <line x1="24" y1="3" x2="24" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
    <defs>
      <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#4F46E5"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
)

// Password Strength
const getStrength = (pw) => {
  let score = 0
  if (pw.length >= 8)           score++
  if (/[A-Z]/.test(pw))         score++
  if (/[0-9]/.test(pw))         score++
  if (/[^A-Za-z0-9]/.test(pw))  score++
  return score
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', 'var(--rose)', 'var(--amber)', 'var(--indigo)', 'var(--emerald)']

const PasswordStrength = ({ password }) => {
  if (!password) return null
  const score = getStrength(password)
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', gap:4, marginBottom:4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex:1, height:3, borderRadius:99,
            background: i <= score ? strengthColor[score] : 'var(--border-muted)',
            transition: 'background 0.2s ease',
          }}/>
        ))}
      </div>
      <span style={{ fontSize:11, color: strengthColor[score], fontWeight:500 }}>
        {strengthLabel[score]}
      </span>
    </div>
  )
}

// Step indicators
const steps = ['Account', 'Password', 'Done']
const StepDots = ({ current }) => (
  <div style={{ display:'flex', gap:6, marginBottom:32, justifyContent:'center' }}>
    {steps.map((_, i) => (
      <div key={i} style={{
        height:4,
        width: i === current ? 24 : 8,
        borderRadius:99,
        background: i <= current ? 'var(--indigo)' : 'var(--border)',
        transition: 'all 0.3s ease',
      }}/>
    ))}
  </div>
)

// Register Page
export default function Register() {
  const navigate    = useNavigate()
  const { register } = useAuth()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
    if (apiError) setApiError('')
  }

  const validateStep0 = () => {
    const e = {}
    if (!form.name.trim())        e.name  = 'Name is required'
    else if (form.name.length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email)               e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    return e
  }

  const validateStep1 = () => {
    const e = {}
    if (!form.password)          e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (getStrength(form.password) < 2) e.password = 'Password is too weak'
    if (!form.confirm)           e.confirm = 'Please confirm your password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    return e
  }

  const handleNext = () => {
    const errs = validateStep0()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 0) { handleNext(); return }

    const errs = validateStep1()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.')
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* ── Left Brand Panel ── */}
      <div style={styles.brand}>
        <div style={styles.brandContent}>
          <div style={{ ...styles.orb, top:'5%',    left:'15%',  background:'rgba(124,58,237,0.2)' }}/>
          <div style={{ ...styles.orb, bottom:'10%',right:'5%',  background:'rgba(6,182,212,0.15)', width:280, height:280 }}/>

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48 }}>
              <PrismLogo size={40} />
              <span style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>Prism</span>
            </div>

            <h1 style={styles.headline}>
              Your focus,<br/>
              <span style={styles.headlineGrad}>refracted.</span>
            </h1>
            <p style={styles.sub}>
              Join thousands of people who stopped fighting distraction and started
              making it unrewarding with Prism's Cognitive Friction engine.
            </p>

            {/* Social proof */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { stat:'2.4h', label:'average daily focus time gained' },
                { stat:'73%',  label:'reduction in override attempts after 30 days' },
                { stat:'4.8★', label:'average user satisfaction score' },
              ].map(({ stat, label }) => (
                <div key={stat} style={{ display:'flex', alignItems:'center', gap:16,
                  padding:'12px 16px', borderRadius:10,
                  background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize:22, fontWeight:800,
                    background:'linear-gradient(90deg, #4F46E5, #7C3AED)',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                    {stat}
                  </span>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div style={styles.formPanel}>
        <div style={styles.formCard} className="animate-fade-in-up">
          {/* Mobile logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, justifyContent:'center' }} className="mobile-logo">
            <PrismLogo size={30} />
            <span style={{ fontSize:17, fontWeight:700 }}>Prism</span>
          </div>

          <StepDots current={step} />

          <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em', marginBottom:4 }}>
            {step === 0 ? 'Create your account' : 'Secure your account'}
          </h2>
          <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:24 }}>
            {step === 0
              ? 'Start your focus journey in seconds'
              : 'Choose a strong password to protect your data'}
          </p>

          {/* API Error */}
          {apiError && (
            <div className="alert alert-error animate-fade-in" style={{ marginBottom:20 }}>
              <span>⚠</span> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Step 0: Name + Email ── */}
            {step === 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }} className="stagger">
                <div className="form-group animate-fade-in-up">
                  <label className="form-label" htmlFor="name">Full name</label>
                  <input
                    id="name" name="name" type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Your Full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    autoFocus
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group animate-fade-in-up">
                  <label className="form-label" htmlFor="reg-email">Email address</label>
                  <input
                    id="reg-email" name="email" type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Your email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <button
                  id="register-next"
                  type="button"
                  className="btn btn-primary btn-lg w-full"
                  style={{ marginTop:4 }}
                  onClick={handleNext}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── Step 1: Password ── */}
            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }} className="stagger">
                <div className="form-group animate-fade-in-up">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input
                    id="password" name="password" type="password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    autoFocus
                  />
                  {errors.password && <span className="form-error">{errors.password}</span>}
                  <PasswordStrength password={form.password} />
                </div>

                <div className="form-group animate-fade-in-up">
                  <label className="form-label" htmlFor="confirm">Confirm password</label>
                  <input
                    id="confirm" name="confirm" type="password"
                    className={`form-input ${errors.confirm ? 'error' : ''}`}
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {errors.confirm && <span className="form-error">{errors.confirm}</span>}
                </div>

                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex:'0 0 auto' }}
                    onClick={() => setStep(0)}
                  >
                    ← Back
                  </button>
                  <button
                    id="register-submit"
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ flex:1 }}
                    disabled={loading}
                  >
                    {loading ? <><div className="spinner" />Creating account…</> : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="divider" style={{ margin:'24px 0' }}>or</div>

          {/* Google OAuth */}
          <button
            id="google-register"
            type="button"
            className="btn btn-google w-full"
            style={{ height:46 }}
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          {/* Footer */}
          <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'var(--text-2)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--indigo)', fontWeight:600 }}>
              Sign in
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
    background: 'var(--bg-base)',
  },
  brand: {
    flex: '0 0 42%',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0a2e 60%, #0a0a1f 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'none',
  },
  brandContent: {
    position: 'relative',
    zIndex: 1,
    padding: '60px 48px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    width: 320, height: 320,
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  headline: {
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
    color: '#fff',
    marginBottom: 16,
  },
  headlineGrad: {
    background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  sub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.7,
    marginBottom: 36,
    maxWidth: 380,
  },
  formPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '40px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
  },
}

// Responsive brand panel
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @media (min-width: 900px) {
      [style*="flex: 0 0 42%"] { display: block !important; }
      .mobile-logo { display: none !important; }
    }
  `
  if (!document.head.querySelector('[data-prism-responsive]')) {
    style.setAttribute('data-prism-responsive', '1')
    document.head.appendChild(style)
  }
}
