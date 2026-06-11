import { sessionService } from '../services/sessionService.js'
import { successResponse, createdResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const startSession = asyncHandler(async (req, res) => {
  const session = await sessionService.start(req.user._id, req.body)
  createdResponse(res, 'Session started', { session })
})

export const listSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const result = await sessionService.list(req.user._id, {
    page: Number(page), limit: Number(limit), status,
  })
  res.status(200).json({ success: true, ...result })
})

export const getActiveSession = asyncHandler(async (req, res) => {
  const session = await sessionService.getActive(req.user._id)
  successResponse(res, 200, 'Active session', { session })
})

export const completeSession = asyncHandler(async (req, res) => {
  const session = await sessionService.complete(req.params.id, req.user._id, req.body)
  successResponse(res, 200, 'Session completed', { session })
})

export const abandonSession = asyncHandler(async (req, res) => {
  const session = await sessionService.abandon(req.params.id, req.user._id)
  successResponse(res, 200, 'Session abandoned', { session })
})

export const recordOverride = asyncHandler(async (req, res) => {
  const session = await sessionService.recordOverride(req.params.id, req.user._id, req.body)
  successResponse(res, 200, 'Override recorded', { session })
})
