import { Router } from 'express';
import {
  getDevices,
  registerDevice,
  revokeDevice,
} from '../controllers/deviceController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/', getDevices);
router.post('/', registerDevice);
router.delete('/:deviceId', revokeDevice);

export default router;

