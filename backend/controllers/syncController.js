import SyncState from '../models/SyncState.js';
import SyncOperation from '../models/SyncOperation.js';
import Task from '../models/Task.js';
import Category from '../models/Category.js';
import Tag from '../models/Tag.js';
import Reminder from '../models/Reminder.js';
import Goal from '../models/Goal.js';
import Habit from '../models/Habit.js';
import HabitEntry from '../models/HabitEntry.js';
import UserSettings from '../models/UserSettings.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getSyncState = asyncHandler(async (req, res) => {
  let state = await SyncState.findOne({ user: req.user._id });
  if (!state) {
    state = await SyncState.create({
      user: req.user._id,
      lastPulledAt: null,
      serverCursor: new Date().toISOString(),
      schemaVersion: 1,
    });
  }
  return sendSuccess(res, { state }, 'Sync state retrieved');
});

export const pullChanges = asyncHandler(async (req, res) => {
  const { since } = req.query;
  const sinceDate = since ? new Date(since) : new Date(0);
  const now = new Date();

  const [tasks, categories, tags, reminders, goals, habits, habitEntries, settings] =
    await Promise.all([
      Task.find({ owner: req.user._id, updatedAt: { $gt: sinceDate } }),
      Category.find({ owner: req.user._id, updatedAt: { $gt: sinceDate } }),
      Tag.find({ owner: req.user._id, updatedAt: { $gt: sinceDate } }),
      Reminder.find({ owner: req.user._id, updatedAt: { $gt: sinceDate } }),
      Goal.find({ owner: req.user._id, updatedAt: { $gt: sinceDate } }),
      Habit.find({ owner: req.user._id, updatedAt: { $gt: sinceDate } }),
      HabitEntry.find({ owner: req.user._id, updatedAt: { $gt: sinceDate } }),
      UserSettings.findOne({ user: req.user._id, updatedAt: { $gt: sinceDate } }),
    ]);

  // Update sync state
  await SyncState.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      lastPulledAt: now,
      serverCursor: now.toISOString(),
    },
    { upsert: true, new: true }
  );

  return sendSuccess(
    res,
    {
      cursor: now.toISOString(),
      changes: {
        tasks,
        categories,
        tags,
        reminders,
        goals,
        habits,
        habitEntries,
        settings,
      },
    },
    'Pulled latest changes'
  );
});

export const pushOperations = asyncHandler(async (req, res, next) => {
  const { operations } = req.body;

  if (!Array.isArray(operations)) {
    return next(new AppError('operations must be an array of sync operation items.', 400));
  }

  const results = [];

  for (const op of operations) {
    const { clientOperationId, entityType, entityId, operation, payload = {}, baseVersion = 0, deviceId } = op;

    if (!clientOperationId || !entityType || !entityId || !operation) {
      results.push({
        clientOperationId: clientOperationId || null,
        status: 'rejected',
        error: 'Missing required sync operation fields.',
      });
      continue;
    }

    // Idempotency check: see if this operation was already processed
    const existingOp = await SyncOperation.findOne({
      user: req.user._id,
      clientOperationId,
    });

    if (existingOp) {
      results.push({
        clientOperationId,
        status: existingOp.status,
        serverVersion: existingOp.serverVersion,
        processedAt: existingOp.processedAt,
      });
      continue;
    }

    let status = 'applied';
    let serverVersion = baseVersion + 1;
    let conflictData = null;

    try {
      if (entityType === 'task') {
        if (operation === 'create') {
          await Task.create({ ...payload, owner: req.user._id, version: 1 });
        } else if (operation === 'update') {
          const task = await Task.findOne({ _id: entityId, owner: req.user._id });
          if (task) {
            // Version check
            if (task.version > baseVersion) {
              status = 'conflict';
              conflictData = task;
            } else {
              Object.assign(task, payload);
              task.version = (task.version || 1) + 1;
              serverVersion = task.version;
              await task.save();
            }
          }
        } else if (operation === 'delete') {
          await Task.findOneAndUpdate(
            { _id: entityId, owner: req.user._id },
            { $set: { deletedAt: new Date() } }
          );
        }
      } else if (entityType === 'category') {
        if (operation === 'create') {
          await Category.create({ ...payload, owner: req.user._id });
        } else if (operation === 'update') {
          await Category.findOneAndUpdate({ _id: entityId, owner: req.user._id }, payload);
        } else if (operation === 'delete') {
          await Category.findOneAndDelete({ _id: entityId, owner: req.user._id });
        }
      } else if (entityType === 'tag') {
        if (operation === 'create') {
          await Tag.create({ ...payload, owner: req.user._id });
        } else if (operation === 'update') {
          await Tag.findOneAndUpdate({ _id: entityId, owner: req.user._id }, payload);
        } else if (operation === 'delete') {
          await Tag.findOneAndDelete({ _id: entityId, owner: req.user._id });
        }
      } else if (entityType === 'reminder') {
        if (operation === 'create') {
          await Reminder.create({ ...payload, owner: req.user._id });
        } else if (operation === 'update') {
          await Reminder.findOneAndUpdate({ _id: entityId, owner: req.user._id }, payload);
        } else if (operation === 'delete') {
          await Reminder.findOneAndDelete({ _id: entityId, owner: req.user._id });
        }
      }
    } catch (err) {
      status = 'rejected';
      conflictData = { message: err.message };
    }

    const savedOp = await SyncOperation.create({
      user: req.user._id,
      clientOperationId,
      entityType,
      entityId,
      operation,
      baseVersion,
      payload,
      status,
      serverVersion,
      conflictData,
      processedAt: new Date(),
    });

    results.push({
      clientOperationId,
      status: savedOp.status,
      serverVersion: savedOp.serverVersion,
      conflictData: savedOp.conflictData,
    });
  }

  return sendSuccess(res, { results }, 'Operations synced');
});

export default {
  getSyncState,
  pullChanges,
  pushOperations,
};

