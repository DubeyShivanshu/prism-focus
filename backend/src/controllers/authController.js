import { authService, REFRESH_TOKEN_COOKIE, refreshCookieOptions, clearCookieOptions } from '../services/authService.js'
import { successResponse, createdResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

// POST /api/auth/register 
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  const { user, accessToken, refreshToken } = await authService.register({ name, email, password })

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions)

  createdResponse(res, 'Account created successfully', { user, accessToken })
})

// POST /api/auth/login 
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const { user, accessToken, refreshToken } = await authService.login({ email, password })

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions)

  successResponse(res, 200, 'Logged in successfully', { user, accessToken })
})

// POST /api/auth/refresh 
export const refresh = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies[REFRESH_TOKEN_COOKIE]
  const { user, accessToken, refreshToken } = await authService.refresh(incomingToken)

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions)

  successResponse(res, 200, 'Token refreshed', { user, accessToken })
})

// POST /api/auth/logout 
export const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies[REFRESH_TOKEN_COOKIE]
  await authService.logout(req.user._id, incomingToken)

  res.clearCookie(REFRESH_TOKEN_COOKIE, clearCookieOptions)
  successResponse(res, 200, 'Logged out successfully')
})

// GET /api/auth/me 
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id)
  successResponse(res, 200, 'Profile retrieved', { user })
})

// GET /api/auth/google/callback 
export const googleCallback = asyncHandler(async (req, res) => {
  // req.user is set by Passport after OAuth success
  const { googleId, emails, displayName, photos } = req.user

  const { user, accessToken, refreshToken } = await authService.googleAuth({
    googleId: googleId || req.user.id,
    email: emails?.[0]?.value,
    name: displayName,
    avatar: photos?.[0]?.value,
  })

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions)

  // Redirect to frontend with access token in query param
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  res.redirect(`${clientUrl}/auth/callback?token=${accessToken}`)
})

// POST /api/auth/extension-token
// Issues a long-lived (30-day) token for the Chrome extension
export const getExtensionToken = asyncHandler(async (req, res) => {
  const { token } = await authService.generateExtensionToken(req.user._id)
  successResponse(res, 200, 'Extension token generated', { token })
})
