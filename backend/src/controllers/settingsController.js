import { settingsService } from '../services/settingsService.js'
import { successResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.get(req.user._id)
  successResponse(res, 200, 'Settings retrieved', { settings })
})

export const updateSettings = asyncHandler(async (req, res) => {
  const user = await settingsService.update(req.user._id, req.body)
  successResponse(res, 200, 'Settings updated', { settings: user.settings })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await settingsService.updateProfile(req.user._id, req.body)
  successResponse(res, 200, 'Profile updated', { user })
})
