import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { userRepository } from '../repositories/userRepository.js'
import { ApiError } from '../utils/apiError.js'

// Token Generators 
const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  })

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  })

// Long-lived token for Chrome extension (30 days)
const signExtensionToken = (userId) =>
  jwt.sign({ id: userId, ext: true }, env.JWT_ACCESS_SECRET, {
    expiresIn: '30d',
  })

// Cookie Config
export const REFRESH_TOKEN_COOKIE = 'prism_refresh'

export const refreshCookieOptions = {
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  partitioned: env.NODE_ENV === 'production',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
}

// clearCookie must NOT include maxAge (Express v5 deprecation)
export const clearCookieOptions = {
  httpOnly: true,
  secure:   env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  partitioned: env.NODE_ENV === 'production',
}

// Auth Service
export const authService = {
  // Register
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email)
    if (existing) throw new ApiError(409, 'An account with this email already exists')

    const user = await userRepository.create({ name, email, password })

    const accessToken = signAccessToken(user._id)
    const refreshToken = signRefreshToken(user._id)
    await userRepository.addRefreshToken(user._id, refreshToken)

    return { user, accessToken, refreshToken }
  },

  // Login
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email)
    if (!user) throw new ApiError(401, 'Invalid email or password')

    const isMatch = await user.comparePassword(password)
    if (!isMatch) throw new ApiError(401, 'Invalid email or password')

    if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated')

    const accessToken = signAccessToken(user._id)
    const refreshToken = signRefreshToken(user._id)
    await userRepository.addRefreshToken(user._id, refreshToken)

    return { user, accessToken, refreshToken }
  },

  // Refresh Token Rotation
  async refresh(incomingToken) {
    if (!incomingToken) throw new ApiError(401, 'Refresh token required')

    let payload
    try {
      payload = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET)
    } catch {
      throw new ApiError(401, 'Refresh token is invalid or expired')
    }

    const user = await userRepository.findByEmail(
      (await userRepository.findById(payload.id))?.email
    )
    if (!user) throw new ApiError(401, 'User no longer exists')

    // Validate token is in DB (detect reuse attacks)
    const tokenStored = user.refreshTokens?.some((t) => t.token === incomingToken)
    if (!tokenStored) {
      // Possible token reuse — clear all tokens for safety
      await userRepository.clearAllRefreshTokens(payload.id)
      throw new ApiError(401, 'Token reuse detected. Please log in again.')
    }

    // Rotate: remove old, issue new
    await userRepository.removeRefreshToken(payload.id, incomingToken)
    const accessToken = signAccessToken(payload.id)
    const refreshToken = signRefreshToken(payload.id)
    await userRepository.addRefreshToken(payload.id, refreshToken)

    return { user, accessToken, refreshToken }
  },

  // Logout
  async logout(userId, refreshToken) {
    if (refreshToken) {
      await userRepository.removeRefreshToken(userId, refreshToken)
    }
  },

  // Google OAuth
  async googleAuth({ googleId, email, name, avatar }) {
    // 1. Find by googleId
    let user = await userRepository.findByGoogleId(googleId)

    if (!user) {
      // 2. Find by email (account linking)
      const emailUser = await userRepository.findByEmail(email)

      if (emailUser) {
        // Link Google to existing account
        user = await userRepository.update(emailUser._id, { googleId, avatar })
      } else {
        // 3. Create new user
        user = await userRepository.create({ googleId, email, name, avatar })
      }
    }

    const accessToken = signAccessToken(user._id)
    const refreshToken = signRefreshToken(user._id)
    await userRepository.addRefreshToken(user._id, refreshToken)

    return { user, accessToken, refreshToken }
  },

  // Get Profile
  async getProfile(userId) {
    const user = await userRepository.findByIdPublic(userId)
    if (!user) throw new ApiError(404, 'User not found')
    return user
  },

  // Generate a long-lived extension token (30 days)
  async generateExtensionToken(userId) {
    const user = await userRepository.findById(userId)
    if (!user) throw new ApiError(404, 'User not found')
    const token = signExtensionToken(userId)
    return { token, user }
  },
}
