import { Router } from 'express';
import {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  snoozeReminder,
  deleteReminder,
} from '../controllers/reminderController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/', getReminders);
router.post('/', createReminder);
router.get('/:id', getReminderById);
router.put('/:id', updateReminder);
router.patch('/:id/snooze', snoozeReminder);
router.delete('/:id', deleteReminder);

export default router;

