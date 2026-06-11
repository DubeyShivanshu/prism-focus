import { userRepository } from '../repositories/userRepository.js'
import { ApiError }       from '../utils/apiError.js'

const ALLOWED_SETTINGS = [
  'pomodoroWork', 'pomodoroBreak', 'dailyGoalHours',
  'notifications', 'theme', 'frictionMode',
]

export const settingsService = {
  // Get current settings
  async get(userId) {
    const user = await userRepository.findByIdPublic(userId)
    if (!user) throw new ApiError(404, 'User not found')
    return user.settings
  },

  // Update settings
  async update(userId, updates) {
    // Only allow whitelisted keys
    const sanitized = {}
    ALLOWED_SETTINGS.forEach((key) => {
      if (updates[key] !== undefined) sanitized[`settings.${key}`] = updates[key]
    })

    if (Object.keys(sanitized).length === 0) {
      throw new ApiError(400, `No valid settings fields provided. Allowed: ${ALLOWED_SETTINGS.join(', ')}`)
    }

    return userRepository.update(userId, { $set: sanitized })
  },

  // Update profile (name, avatar)
  async updateProfile(userId, { name, avatar }) {
    const allowed = {}
    if (name)   allowed.name   = name.trim()
    if (avatar) allowed.avatar = avatar

    if (Object.keys(allowed).length === 0) {
      throw new ApiError(400, 'Nothing to update')
    }

    return userRepository.update(userId, allowed)
  },
}
