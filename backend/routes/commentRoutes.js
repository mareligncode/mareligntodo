import { Router } from 'express';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(protect);

router.get('/task/:taskId', getComments);
router.post('/task/:taskId', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;

