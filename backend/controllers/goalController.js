import Goal from '../models/Goal.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

export const getGoals = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { owner: req.user._id };

  if (status) filter.status = status;

  const goals = await Goal.find(filter).sort({ targetAt: 1, createdAt: -1 });
  return sendSuccess(res, { goals }, 'Goals retrieved successfully');
});

export const getGoalById = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOne({ _id: req.params.id, owner: req.user._id });
  if (!goal) {
    return next(new AppError('Goal not found.', 404));
  }
  return sendSuccess(res, { goal }, 'Goal retrieved');
});

export const createGoal = asyncHandler(async (req, res, next) => {
  const { title, description, targetValue, currentValue, unit, startAt, targetAt, status, color } =
    req.body;

  if (!title) {
    return next(new AppError('Goal title is required.', 400));
  }

  const goal = await Goal.create({
    owner: req.user._id,
    title: title.trim(),
    description: description || '',
    targetValue: targetValue || 0,
    currentValue: currentValue || 0,
    unit: unit || '',
    startAt: startAt || null,
    targetAt: targetAt || null,
    status: status || 'active',
    color: color || '#3B82F6',
  });

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    entityType: 'goal',
    entityId: goal._id,
    action: 'created',
  });

  return sendSuccess(res, { goal }, 'Goal created successfully', 201);
});

export const updateGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOne({ _id: req.params.id, owner: req.user._id });
  if (!goal) {
    return next(new AppError('Goal not found.', 404));
  }

  const fields = [
    'title',
    'description',
    'targetValue',
    'currentValue',
    'unit',
    'startAt',
    'targetAt',
    'status',
    'color',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      goal[field] = req.body[field];
    }
  });

  // Auto-complete check
  if (goal.targetValue > 0 && goal.currentValue >= goal.targetValue && goal.status === 'active') {
    goal.status = 'completed';
  }

  await goal.save();

  return sendSuccess(res, { goal }, 'Goal updated successfully');
});

export const updateGoalProgress = asyncHandler(async (req, res, next) => {
  const { delta, value } = req.body;
  const goal = await Goal.findOne({ _id: req.params.id, owner: req.user._id });
  if (!goal) {
    return next(new AppError('Goal not found.', 404));
  }

  if (value !== undefined) {
    goal.currentValue = value;
  } else if (delta !== undefined) {
    goal.currentValue += delta;
  }

  if (goal.targetValue > 0 && goal.currentValue >= goal.targetValue && goal.status === 'active') {
    goal.status = 'completed';
  }

  await goal.save();

  return sendSuccess(res, { goal }, 'Goal progress updated');
});

export const deleteGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOne({ _id: req.params.id, owner: req.user._id });
  if (!goal) {
    return next(new AppError('Goal not found.', 404));
  }

  await Goal.deleteOne({ _id: goal._id });
  return sendSuccess(res, null, 'Goal deleted successfully');
});

export default {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
};

