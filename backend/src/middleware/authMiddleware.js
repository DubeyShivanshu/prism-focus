import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { userRepository } from '../repositories/userRepository.js'
import { ApiError } from '../utils/apiError.js'
import asyncHandler from '../utils/asyncHandler.js'

// Protect Middleware
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. Please log in.')
  }

  const token = authHeader.split(' ')[1]

  let decoded
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired. Please refresh.')
    }
    throw new ApiError(401, 'Invalid access token.')
  }

  const user = await userRepository.findById(decoded.id)

  if (!user) throw new ApiError(401, 'The user belonging to this token no longer exists.')
  if (!user.isActive) throw new ApiError(403, 'Account has been deactivated.')

  req.user = user
  next()
})

// Role Guard
// Usage: router.delete('/admin-route', protect, restrictTo('admin'), handler)
export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'))
  }
  next()
}

// Optional Auth 
// Attaches user if token present, continues without error if absent
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) return next()

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
    req.user = await userRepository.findById(decoded.id)
  } catch {
  }

  next()
})
