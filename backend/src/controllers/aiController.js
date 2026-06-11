import { aiService }       from '../services/aiService.js'
import { analyticsService } from '../services/analyticsService.js'
import { userRepository }   from '../repositories/userRepository.js'
import { successResponse }  from '../utils/apiResponse.js'
import asyncHandler         from '../utils/asyncHandler.js'

// POST /api/ai/chat
export const chat = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body

  // Fetch user and analytics context in parallel
  const [user, analytics] = await Promise.all([
    userRepository.findByIdPublic(req.user._id),
    analyticsService.getSummary(req.user._id),
  ])

  const result = await aiService.chat(message, history, user, analytics)
  successResponse(res, 200, 'AI response', result)
})

// GET /api/ai/suggestions
export const getSuggestions = asyncHandler(async (req, res) => {
  const [user, analytics] = await Promise.all([
    userRepository.findByIdPublic(req.user._id),
    analyticsService.getSummary(req.user._id),
  ])

  const suggestions = aiService.getSuggestions(user, analytics)
  successResponse(res, 200, 'Suggestions', { suggestions })
})
