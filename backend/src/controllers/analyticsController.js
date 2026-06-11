import { analyticsService } from '../services/analyticsService.js'
import { successResponse } from '../utils/apiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getSummary(req.user._id)
  successResponse(res, 200, 'Analytics summary', { summary })
})

export const getHeatmap = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 90
  const heatmap = await analyticsService.getHeatmap(req.user._id, days)
  successResponse(res, 200, 'Heatmap data', { heatmap })
})

export const getScoreSeries = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30
  const series = await analyticsService.getScoreSeries(req.user._id, days)
  successResponse(res, 200, 'Score series', { series })
})

export const getSiteBreakdown = asyncHandler(async (req, res) => {
  const sites = await analyticsService.getSiteBreakdown(req.user._id)
  successResponse(res, 200, 'Site breakdown', { sites })
})
