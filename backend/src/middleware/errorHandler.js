import { env } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'

// 404 Handler 
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found — ${req.method} ${req.originalUrl}`))
}

// Global Error Handler 
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  // Mongoose: CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

  // Mongoose: Duplicate key
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue)[0]
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  }

  // Mongoose: Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  // Log in development
  if (env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${statusCode} — ${message}`)
    if (statusCode === 500) console.error(err.stack)
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
