import { Router } from 'express';
import { getSyncState, pullChanges, pushOperations } from '../controllers/syncController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/state', getSyncState);
router.get('/pull', pullChanges);
router.post('/push', pushOperations);

export default router;

