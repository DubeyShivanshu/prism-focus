import { Router } from 'express'
import {
  getSettings, updateSettings, updateProfile,
} from '../controllers/settingsController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/',           getSettings)
router.patch('/',         updateSettings)
router.patch('/profile',  updateProfile)

export default router
