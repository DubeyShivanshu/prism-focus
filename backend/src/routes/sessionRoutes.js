import { Router } from 'express'
import {
  startSession, listSessions, getActiveSession,
  completeSession, abandonSession, recordOverride,
} from '../controllers/sessionController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)  // all session routes require auth

router.get('/',           listSessions)
router.get('/active',     getActiveSession)
router.post('/',          startSession)
router.patch('/:id/complete', completeSession)
router.patch('/:id/abandon',  abandonSession)
router.post('/:id/override',  recordOverride)

export default router
