import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

const isDev = env.NODE_ENV === 'development'

// Global Limiter 
export const globalLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max:      parseInt(env.RATE_LIMIT_MAX),
  skip:     () => isDev,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
})

// Auth Limiter: Stricter limiter for /api/auth/* routes to prevent brute-force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      parseInt(env.AUTH_RATE_LIMIT_MAX),
  skip:     () => isDev,
  standardHeaders: true,
  legacyHeaders:   false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' },
})

// AI Limiter: Prevents excessive Gemini API calls
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,                             // 1 minute
  max: 10,                                          // 10 AI requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit reached, please wait a moment.',
  },
})
