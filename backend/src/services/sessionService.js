import { sessionRepository } from '../repositories/sessionRepository.js'
import { userRepository }    from '../repositories/userRepository.js'
import { ApiError }          from '../utils/apiError.js'

export const sessionService = {
  // Start a new session
  async start(userId, { type = 'pomodoro', plannedDuration, notes = '', tags = [] }) {
    // Prevent duplicate active sessions
    const existing = await sessionRepository.findActive(userId)
    if (existing) throw new ApiError(409, 'You already have an active session. Complete or abandon it first.')

    if (!plannedDuration || plannedDuration < 1) {
      throw new ApiError(400, 'plannedDuration must be at least 1 minute')
    }

    const session = await sessionRepository.create({
      user: userId,
      type,
      plannedDuration,
      notes,
      tags,
      startTime: new Date(),
      status: 'active',
    })

    return session
  },

  // Complete a session
  async complete(sessionId, userId, { productivityScore, notes } = {}) {
    const session = await sessionRepository.findByIdAndUser(sessionId, userId)
    if (!session) throw new ApiError(404, 'Session not found')
    if (session.status !== 'active') throw new ApiError(400, `Session is already ${session.status}`)

    const endTime = new Date()
    const actualDuration = Math.round((endTime - session.startTime) / 60000)

    const updated = await sessionRepository.update(sessionId, {
      status: 'completed',
      endTime,
      actualDuration,
      ...(productivityScore !== undefined && { productivityScore }),
      ...(notes && { notes }),
    })

    // Update user's total focus time
    await userRepository.incrementFocusTime(userId, actualDuration)

    return updated
  },

  // Abandon a session
  async abandon(sessionId, userId) {
    const session = await sessionRepository.findByIdAndUser(sessionId, userId)
    if (!session) throw new ApiError(404, 'Session not found')
    if (session.status !== 'active') throw new ApiError(400, `Session is already ${session.status}`)

    return sessionRepository.update(sessionId, {
      status: 'abandoned',
      endTime: new Date(),
      actualDuration: Math.round((Date.now() - session.startTime) / 60000),
    })
  },

  // Record an override
  async recordOverride(sessionId, userId, { site, frictionLevel }) {
    const session = await sessionRepository.findByIdAndUser(sessionId, userId)
    if (!session) throw new ApiError(404, 'Session not found')

    return sessionRepository.pushOverride(sessionId, {
      site,
      frictionLevel,
      timestamp: new Date(),
    })
  },

  // List sessions
  async list(userId, { page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit
    const [sessions, total] = await Promise.all([
      sessionRepository.findByUser(userId, { limit, skip, status }),
      sessionRepository.countByUser(userId, status ? { status } : {}),
    ])
    return { sessions, total, page, totalPages: Math.ceil(total / limit) }
  },

  // Get active session
  async getActive(userId) {
    return sessionRepository.findActive(userId)
  },
}
