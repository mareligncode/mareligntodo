import Task from '../models/Task.js';
import Reminder from '../models/Reminder.js';
import Comment from '../models/Comment.js';
import Attachment from '../models/Attachment.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

export const getTasks = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    category,
    tag,
    isPinned,
    isArchived,
    includeDeleted,
    parentTask,
    dueFrom,
    dueTo,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
  } = req.query;

  const query = { owner: req.user._id };

  // Soft deletion filter
  if (includeDeleted !== 'true') {
    query.deletedAt = null;
  }

  // Archived filter
  if (isArchived !== undefined) {
    query.isArchived = isArchived === 'true';
  } else {
    query.isArchived = false;
  }

  // Status filter
  if (status) {
    if (status.includes(',')) {
      query.status = { $in: status.split(',').map((s) => s.trim()) };
    } else {
      query.status = status;
    }
  }

  // Priority filter
  if (priority) {
    if (priority.includes(',')) {
      query.priority = { $in: priority.split(',').map((p) => p.trim()) };
    } else {
      query.priority = priority;
    }
  }

  // Category filter
  if (category) {
    query.category = category === 'null' ? null : category;
  }

  // Tag filter
  if (tag) {
    query.tags = tag;
  }

  // Pinned filter
  if (isPinned !== undefined) {
    query.isPinned = isPinned === 'true';
  }

  // Parent task / Subtask filter
  if (parentTask !== undefined) {
    query.parentTask = parentTask === 'null' ? null : parentTask;
  }

  // Due date range filter
  if (dueFrom || dueTo) {
    query.dueAt = {};
    if (dueFrom) query.dueAt.$gte = new Date(dueFrom);
    if (dueTo) query.dueAt.$lte = new Date(dueTo);
  }

  // Text search
  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ title: searchRegex }, { description: searchRegex }, { projectName: searchRegex }];
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions = {};
  sortOptions[sortBy] = sortDirection;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('category', 'name color icon')
      .populate('tags', 'name color')
      .populate('assignedTo', 'fullName email avatarUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Task.countDocuments(query),
  ]);

  return sendSuccess(
    res,
    {
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    'Tasks retrieved successfully'
  );
});

export const getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('category', 'name color icon')
    .populate('tags', 'name color')
    .populate('assignedTo', 'fullName email avatarUrl')
    .populate('parentTask', 'title status priority');

  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  // Also fetch subtasks and active reminders
  const [subtasks, reminders, commentsCount, attachmentsCount] = await Promise.all([
    Task.find({ parentTask: task._id, deletedAt: null }),
    Reminder.find({ task: task._id }),
    Comment.countDocuments({ task: task._id }),
    Attachment.countDocuments({ task: task._id }),
  ]);

  return sendSuccess(
    res,
    {
      task,
      subtasks,
      reminders,
      stats: {
        commentsCount,
        attachmentsCount,
      },
    },
    'Task details retrieved'
  );
});

export const createTask = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    status,
    priority,
    startAt,
    dueAt,
    category,
    tags,
    projectName,
    parentTask,
    assignedTo,
    checklist,
    estimatedMinutes,
    actualMinutes,
    color,
    isPinned,
    source,
    customFields,
  } = req.body;

  if (!title) {
    return next(new AppError('Task title is required.', 400));
  }

  const task = await Task.create({
    owner: req.user._id,
    title: title.trim(),
    description: description ? description.trim() : '',
    status: status || 'inbox',
    priority: priority || 'none',
    startAt: startAt || null,
    dueAt: dueAt || null,
    category: category || null,
    tags: tags || [],
    projectName: projectName || null,
    parentTask: parentTask || null,
    assignedTo: assignedTo || [],
    checklist: checklist || [],
    estimatedMinutes: estimatedMinutes || 0,
    actualMinutes: actualMinutes || 0,
    color: color || null,
    isPinned: isPinned || false,
    source: source || 'manual',
    customFields: customFields || {},
    version: 1,
  });

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    task: task._id,
    entityType: 'task',
    entityId: task._id,
    action: 'created',
    changes: { title: task.title, status: task.status },
  });

  const populatedTask = await Task.findById(task._id)
    .populate('category', 'name color icon')
    .populate('tags', 'name color');

  return sendSuccess(res, { task: populatedTask }, 'Task created successfully', 201);
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const updates = req.body;
  const changes = {};

  // If status is transitioned to completed, set completedAt
  if (updates.status && updates.status !== task.status) {
    changes.oldStatus = task.status;
    changes.newStatus = updates.status;
    if (updates.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    } else if (updates.status !== 'completed') {
      task.completedAt = null;
    }
  }

  // Handle archive toggle
  if (updates.isArchived !== undefined && updates.isArchived !== task.isArchived) {
    task.isArchived = updates.isArchived;
    task.archivedAt = updates.isArchived ? new Date() : null;
  }

  const updatableFields = [
    'title',
    'description',
    'status',
    'priority',
    'startAt',
    'dueAt',
    'completedAt',
    'category',
    'tags',
    'projectName',
    'parentTask',
    'assignedTo',
    'checklist',
    'estimatedMinutes',
    'actualMinutes',
    'color',
    'isPinned',
    'source',
    'customFields',
  ];

  updatableFields.forEach((field) => {
    if (updates[field] !== undefined) {
      task[field] = updates[field];
    }
  });

  task.version = (task.version || 1) + 1;
  task.clientUpdatedAt = updates.clientUpdatedAt ? new Date(updates.clientUpdatedAt) : new Date();

  await task.save();

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    task: task._id,
    entityType: 'task',
    entityId: task._id,
    action: 'updated',
    changes: { ...changes, ...updates },
  });

  const updatedTask = await Task.findById(task._id)
    .populate('category', 'name color icon')
    .populate('tags', 'name color')
    .populate('assignedTo', 'fullName email avatarUrl');

  return sendSuccess(res, { task: updatedTask }, 'Task updated successfully');
});

export const updateTaskStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    return next(new AppError('Status is required.', 400));
  }

  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const oldStatus = task.status;
  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date();
  } else {
    task.completedAt = null;
  }

  task.version = (task.version || 1) + 1;
  await task.save();

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    task: task._id,
    entityType: 'task',
    entityId: task._id,
    action: 'status_changed',
    changes: { oldStatus, newStatus: status },
  });

  return sendSuccess(res, { task }, 'Task status updated');
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  const { permanent } = req.query;
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  if (permanent === 'true') {
    // Hard delete
    await Promise.all([
      Task.deleteOne({ _id: task._id }),
      Task.deleteMany({ parentTask: task._id }),
      Reminder.deleteMany({ task: task._id }),
      Comment.deleteMany({ task: task._id }),
      Attachment.deleteMany({ task: task._id }),
    ]);

    await logActivity({
      actor: req.user._id,
      owner: req.user._id,
      entityType: 'task',
      entityId: task._id,
      action: 'permanently_deleted',
    });

    return sendSuccess(res, null, 'Task permanently deleted');
  }

  // Soft delete
  task.deletedAt = new Date();
  await task.save();

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    task: task._id,
    entityType: 'task',
    entityId: task._id,
    action: 'soft_deleted',
  });

  return sendSuccess(res, { task }, 'Task moved to trash');
});

// Checklist item handlers
export const addChecklistItem = asyncHandler(async (req, res, next) => {
  const { text, position } = req.body;
  if (!text) {
    return next(new AppError('Checklist item text is required.', 400));
  }

  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const pos = position !== undefined ? position : task.checklist.length;
  task.checklist.push({
    text: text.trim(),
    isCompleted: false,
    position: pos,
  });

  await task.save();
  return sendSuccess(res, { checklist: task.checklist }, 'Checklist item added', 201);
});

export const updateChecklistItem = asyncHandler(async (req, res, next) => {
  const { text, isCompleted, position } = req.body;
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const item = task.checklist.id(req.params.itemId);
  if (!item) {
    return next(new AppError('Checklist item not found.', 404));
  }

  if (text !== undefined) item.text = text.trim();
  if (position !== undefined) item.position = position;
  if (isCompleted !== undefined) {
    item.isCompleted = isCompleted;
    item.completedAt = isCompleted ? new Date() : null;
  }

  await task.save();
  return sendSuccess(res, { checklist: task.checklist }, 'Checklist item updated');
});

export const deleteChecklistItem = asyncHandler(async (req, res, next) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  task.checklist.pull({ _id: req.params.itemId });
  await task.save();

  return sendSuccess(res, { checklist: task.checklist }, 'Checklist item deleted');
});

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
};

