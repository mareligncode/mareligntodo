import { Router } from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/', getActivityLogs);

export default router;

