import { blockService } from '../services/blockService.js'
import { successResponse, createdResponse, noContentResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const listBlocks = asyncHandler(async (req, res) => {
  const sites = await blockService.list(req.user._id)
  successResponse(res, 200, 'Blocked sites', { sites })
})

export const getEnabledRules = asyncHandler(async (req, res) => {
  const rules = await blockService.getEnabledRules(req.user._id)
  successResponse(res, 200, 'Enabled rules', { rules })
})

export const addBlock = asyncHandler(async (req, res) => {
  const site = await blockService.add(req.user._id, req.body)
  createdResponse(res, 'Site added to block list', { site })
})

export const updateBlock = asyncHandler(async (req, res) => {
  const site = await blockService.update(req.params.id, req.user._id, req.body)
  successResponse(res, 200, 'Site updated', { site })
})

export const deleteBlock = asyncHandler(async (req, res) => {
  await blockService.remove(req.params.id, req.user._id)
  noContentResponse(res)
})

export const toggleBlock = asyncHandler(async (req, res) => {
  const site = await blockService.toggle(req.params.id, req.user._id)
  successResponse(res, 200, `Site ${site.isEnabled ? 'enabled' : 'disabled'}`, { site })
})
