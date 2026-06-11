// Custom API Error Class 
export class ApiError extends Error { 
  constructor(statusCode, message, errors = [], stack = '') {
    super(message)
    this.statusCode = statusCode
    this.success = false
    this.errors = errors

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

// Common Error Factories 
export const badRequest = (message = 'Bad Request', errors = []) =>
  new ApiError(400, message, errors)

export const unauthorized = (message = 'Unauthorized') =>
  new ApiError(401, message)

export const forbidden = (message = 'Forbidden') =>
  new ApiError(403, message)

export const notFoundError = (message = 'Resource not found') =>
  new ApiError(404, message)

export const conflict = (message = 'Conflict') =>
  new ApiError(409, message)

export const tooManyRequests = (message = 'Too many requests') =>
  new ApiError(429, message)

export const internalError = (message = 'Internal Server Error') =>
  new ApiError(500, message)
