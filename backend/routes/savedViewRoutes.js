import { Router } from 'express';
import {
  getSavedViews,
  getSavedViewById,
  createSavedView,
  updateSavedView,
  deleteSavedView,
} from '../controllers/savedViewController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/', getSavedViews);
router.post('/', createSavedView);
router.get('/:id', getSavedViewById);
router.put('/:id', updateSavedView);
router.delete('/:id', deleteSavedView);

export default router;

