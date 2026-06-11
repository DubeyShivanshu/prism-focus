import { z } from 'zod'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env') })

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  CLIENT_URL: z.string().url({ message: 'CLIENT_URL must be a valid URL' }),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Google OAuth 
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  // Gemini AI  
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('100'),
  AUTH_RATE_LIMIT_MAX: z.string().default('10'),

  // Cookie
  COOKIE_SECRET: z.string().min(16).optional(),
})

// Validate
const _parsed = envSchema.safeParse(process.env)

if (!_parsed.success) {
  console.error('\n❌ Invalid environment variables:\n')
  const errors = _parsed.error.flatten().fieldErrors
  Object.entries(errors).forEach(([key, messages]) => {
    console.error(`  ${key}: ${messages.join(', ')}`)
  })
  console.error('\n📋 Copy backend/.env.example to backend/.env and fill in the values.\n')
  process.exit(1)
}

export const env = _parsed.data
