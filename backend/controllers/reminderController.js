import Reminder from '../models/Reminder.js';
import Task from '../models/Task.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { calculateNextTriggerAt } from '../services/reminderService.js';
import { logActivity } from '../services/activityService.js';

export const getReminders = asyncHandler(async (req, res) => {
  const { task, enabled, status } = req.query;
  const filter = { owner: req.user._id };

  if (task) filter.task = task;
  if (enabled !== undefined) filter.enabled = enabled === 'true';
  if (status) filter.status = status;

  const reminders = await Reminder.find(filter)
    .populate('task', 'title priority dueAt status')
    .sort({ nextTriggerAt: 1, scheduledAt: 1 });

  return sendSuccess(res, { reminders }, 'Reminders retrieved successfully');
});

export const getReminderById = asyncHandler(async (req, res, next) => {
  const reminder = await Reminder.findOne({ _id: req.params.id, owner: req.user._id }).populate(
    'task',
    'title priority dueAt status'
  );
  if (!reminder) {
    return next(new AppError('Reminder not found.', 404));
  }
  return sendSuccess(res, { reminder }, 'Reminder retrieved');
});

export const createReminder = asyncHandler(async (req, res, next) => {
  const {
    task: taskId,
    title,
    scheduledAt,
    timezone,
    scheduleType,
    recurrence,
    channels,
    leadMinutes,
  } = req.body;

  if (!taskId) {
    return next(new AppError('Task ID is required for a reminder.', 400));
  }

  const task = await Task.findOne({ _id: taskId, owner: req.user._id });
  if (!task) {
    return next(new AppError('Target task not found or you do not have permission.', 404));
  }

  const reminderData = {
    owner: req.user._id,
    task: task._id,
    title: title || `Reminder: ${task.title}`,
    enabled: true,
    status: 'scheduled',
    scheduleType: scheduleType || 'once',
    scheduledAt: scheduledAt || task.dueAt || new Date(),
    timezone: timezone || 'UTC',
    recurrence: recurrence || { frequency: 'none' },
    channels: channels || ['in_app'],
    leadMinutes: leadMinutes || 0,
  };

  reminderData.nextTriggerAt = calculateNextTriggerAt(reminderData);

  const reminder = await Reminder.create(reminderData);

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    task: task._id,
    entityType: 'reminder',
    entityId: reminder._id,
    action: 'created',
  });

  return sendSuccess(res, { reminder }, 'Reminder created successfully', 201);
});

export const updateReminder = asyncHandler(async (req, res, next) => {
  const reminder = await Reminder.findOne({ _id: req.params.id, owner: req.user._id });
  if (!reminder) {
    return next(new AppError('Reminder not found.', 404));
  }

  const updates = req.body;
  const fields = [
    'title',
    'enabled',
    'status',
    'scheduleType',
    'scheduledAt',
    'timezone',
    'recurrence',
    'channels',
    'leadMinutes',
  ];

  fields.forEach((field) => {
    if (updates[field] !== undefined) {
      reminder[field] = updates[field];
    }
  });

  reminder.nextTriggerAt = calculateNextTriggerAt(reminder);
  await reminder.save();

  return sendSuccess(res, { reminder }, 'Reminder updated successfully');
});

export const snoozeReminder = asyncHandler(async (req, res, next) => {
  const { minutes = 15 } = req.body;

  const reminder = await Reminder.findOne({ _id: req.params.id, owner: req.user._id });
  if (!reminder) {
    return next(new AppError('Reminder not found.', 404));
  }

  const snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
  reminder.snoozeUntil = snoozeDate;
  reminder.nextTriggerAt = snoozeDate;
  reminder.status = 'scheduled';

  await reminder.save();

  return sendSuccess(res, { reminder }, `Reminder snoozed for ${minutes} minutes`);
});

export const deleteReminder = asyncHandler(async (req, res, next) => {
  const reminder = await Reminder.findOne({ _id: req.params.id, owner: req.user._id });
  if (!reminder) {
    return next(new AppError('Reminder not found.', 404));
  }

  await Reminder.deleteOne({ _id: reminder._id });

  return sendSuccess(res, null, 'Reminder deleted successfully');
});

export default {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  snoozeReminder,
  deleteReminder,
};

