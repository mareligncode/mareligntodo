import { Router } from 'express';
import { getTags, getTagById, createTag, updateTag, deleteTag } from '../controllers/tagController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/', getTags);
router.post('/', createTag);
router.get('/:id', getTagById);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

export default router;

