import { Router } from 'express';
import {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitEntries,
  recordHabitEntry,
  deleteHabitEntry,
} from '../controllers/habitController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/', getHabits);
router.post('/', createHabit);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

// Habit entries
router.get('/:habitId/entries', getHabitEntries);
router.post('/:habitId/entries', recordHabitEntry);
router.delete('/:habitId/entries/:localDate', deleteHabitEntry);

export default router;

