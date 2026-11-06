import Habit from '../models/Habit.js';
import HabitEntry from '../models/HabitEntry.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

export const getHabits = asyncHandler(async (req, res) => {
  const { isActive, today } = req.query;
  const filter = { owner: req.user._id };

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const habits = await Habit.find(filter).sort({ createdAt: -1 });

  // If client provided today's date (YYYY-MM-DD), attach today's entry
  let habitsWithToday = habits;
  if (today) {
    const todayEntries = await HabitEntry.find({
      owner: req.user._id,
      localDate: today,
    });
    const entryMap = new Map(todayEntries.map((e) => [e.habit.toString(), e]));

    habitsWithToday = habits.map((habit) => {
      const habitObj = habit.toObject();
      habitObj.todayEntry = entryMap.get(habit._id.toString()) || null;
      return habitObj;
    });
  }

  return sendSuccess(res, { habits: habitsWithToday }, 'Habits retrieved successfully');
});

export const getHabitById = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({ _id: req.params.id, owner: req.user._id });
  if (!habit) {
    return next(new AppError('Habit not found.', 404));
  }

  // Get last 30 entries for streak / history
  const recentEntries = await HabitEntry.find({ habit: habit._id })
    .sort({ localDate: -1 })
    .limit(30);

  return sendSuccess(res, { habit, recentEntries }, 'Habit details retrieved');
});

export const createHabit = asyncHandler(async (req, res, next) => {
  const { title, description, schedule, reminderTime, timezone, color } = req.body;

  if (!title) {
    return next(new AppError('Habit title is required.', 400));
  }

  const habit = await Habit.create({
    owner: req.user._id,
    title: title.trim(),
    description: description || '',
    schedule: schedule || { frequency: 'daily', interval: 1, daysOfWeek: [], targetCount: 1 },
    reminderTime: reminderTime || null,
    timezone: timezone || 'UTC',
    color: color || '#10B981',
    isActive: true,
  });

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    entityType: 'habit',
    entityId: habit._id,
    action: 'created',
  });

  return sendSuccess(res, { habit }, 'Habit created successfully', 201);
});

export const updateHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({ _id: req.params.id, owner: req.user._id });
  if (!habit) {
    return next(new AppError('Habit not found.', 404));
  }

  const fields = ['title', 'description', 'schedule', 'reminderTime', 'timezone', 'color', 'isActive'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      habit[field] = req.body[field];
    }
  });

  await habit.save();
  return sendSuccess(res, { habit }, 'Habit updated successfully');
});

export const deleteHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findOne({ _id: req.params.id, owner: req.user._id });
  if (!habit) {
    return next(new AppError('Habit not found.', 404));
  }

  await Promise.all([
    Habit.deleteOne({ _id: habit._id }),
    HabitEntry.deleteMany({ habit: habit._id }),
  ]);

  return sendSuccess(res, null, 'Habit and related entries deleted successfully');
});

// Habit entries (logs)
export const getHabitEntries = asyncHandler(async (req, res, next) => {
  const { habitId } = req.params;
  const { startDate, endDate } = req.query;

  const habit = await Habit.findOne({ _id: habitId, owner: req.user._id });
  if (!habit) {
    return next(new AppError('Habit not found.', 404));
  }

  const filter = { habit: habitId };
  if (startDate || endDate) {
    filter.localDate = {};
    if (startDate) filter.localDate.$gte = startDate;
    if (endDate) filter.localDate.$lte = endDate;
  }

  const entries = await HabitEntry.find(filter).sort({ localDate: -1 });
  return sendSuccess(res, { entries }, 'Habit entries retrieved');
});

export const recordHabitEntry = asyncHandler(async (req, res, next) => {
  const { habitId } = req.params;
  const { localDate, completedCount = 1, note = '' } = req.body;

  if (!localDate) {
    return next(new AppError('localDate (YYYY-MM-DD) is required.', 400));
  }

  const habit = await Habit.findOne({ _id: habitId, owner: req.user._id });
  if (!habit) {
    return next(new AppError('Habit not found.', 404));
  }

  const entry = await HabitEntry.findOneAndUpdate(
    { habit: habitId, localDate },
    {
      owner: req.user._id,
      habit: habitId,
      localDate,
      completedCount,
      note,
    },
    { new: true, upsert: true, runValidators: true }
  );

  return sendSuccess(res, { entry }, 'Habit entry recorded successfully');
});

export const deleteHabitEntry = asyncHandler(async (req, res, next) => {
  const { habitId, localDate } = req.params;

  const entry = await HabitEntry.findOneAndDelete({
    habit: habitId,
    localDate,
    owner: req.user._id,
  });

  if (!entry) {
    return next(new AppError('Habit entry not found.', 404));
  }

  return sendSuccess(res, null, 'Habit entry deleted successfully');
});

export default {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitEntries,
  recordHabitEntry,
  deleteHabitEntry,
};

