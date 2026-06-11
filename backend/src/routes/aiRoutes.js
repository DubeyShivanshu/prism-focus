import { Router }          from 'express'
import { chat, getSuggestions } from '../controllers/aiController.js'
import { protect }         from '../middleware/authMiddleware.js'
import { aiLimiter }       from '../middleware/rateLimiter.js'

const router = Router()

router.use(protect)
router.use(aiLimiter)  // stricter rate limit for AI endpoints

router.post('/chat',        chat)
router.get('/suggestions',  getSuggestions)

export default router
