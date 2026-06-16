import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import passport from 'passport'
import { env } from './config/env.js'
import { configurePassport } from './config/passport.js'
import { globalLimiter } from './middleware/rateLimiter.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// Security 
app.use(helmet())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      // Allow requests from the defined CLIENT_URL
      // Allow requests from any chrome-extension
      if (!origin || origin === env.CLIENT_URL || origin.startsWith('chrome-extension://')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Rate Limiting 
app.use('/api', globalLimiter)

// Body Parsing 
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser(env.COOKIE_SECRET))

// Passport 
configurePassport()
app.use(passport.initialize())

// Logging 
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Health Check 
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Prism API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  })
})

import authRoutes      from './routes/authRoutes.js'
import sessionRoutes   from './routes/sessionRoutes.js'
import blockRoutes     from './routes/blockRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import settingsRoutes  from './routes/settingsRoutes.js'
import aiRoutes        from './routes/aiRoutes.js'

// API Routes 
app.use('/api/auth',      authRoutes)
app.use('/api/sessions',  sessionRoutes)
app.use('/api/blocks',    blockRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/settings',  settingsRoutes)
app.use('/api/ai',        aiRoutes)
// app.use('/api/friends', friendRoutes)

// Error Handling 
app.use(notFound)
app.use(errorHandler)

export default app
