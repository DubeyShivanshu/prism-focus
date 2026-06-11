import { Router } from 'express'
import {
  getSummary, getHeatmap, getScoreSeries, getSiteBreakdown,
} from '../controllers/analyticsController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/summary',    getSummary)
router.get('/heatmap',    getHeatmap)        // ?days=90
router.get('/scores',     getScoreSeries)    // ?days=30
router.get('/sites',      getSiteBreakdown)

export default router
