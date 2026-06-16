import { Router } from 'express'
import passport from 'passport'
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  googleCallback,
  getExtensionToken,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Public Routes 
router.post('/register', authLimiter, register)
router.post('/login',    authLimiter, login)
router.post('/refresh',  refresh)

// Protected Routes 
router.post('/logout', protect, logout)
router.get('/me',      protect, getMe)
router.post('/extension-token', protect, getExtensionToken)

// Google OAuth
// Initiates Google OAuth flow — redirects to Google's consent screen
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({
      success: false,
      message: 'Google OAuth not configured. Add GOOGLE_CLIENT_ID to your .env file.',
    })
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res, next)
})

// Google redirects back here after user grants permission
router.get(
  '/google/callback',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_not_configured`)
    }
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    })(req, res, next)
  },
  googleCallback
)

export default router
