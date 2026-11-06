import { Router } from 'express';
import {
  getAttachments,
  createAttachment,
  deleteAttachment,
} from '../controllers/attachmentController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/task/:taskId', getAttachments);
router.post('/task/:taskId', createAttachment);
router.delete('/:id', deleteAttachment);

export default router;

