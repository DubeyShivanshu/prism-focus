import { Router } from 'express'
import {
  listBlocks, getEnabledRules, addBlock,
  updateBlock, deleteBlock, toggleBlock,
} from '../controllers/blockController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

router.use(protect)

router.get('/',           listBlocks)
router.get('/rules',      getEnabledRules)   // lightweight — polled by extension
router.post('/',          addBlock)
router.patch('/:id',      updateBlock)
router.delete('/:id',     deleteBlock)
router.patch('/:id/toggle', toggleBlock)

export default router
