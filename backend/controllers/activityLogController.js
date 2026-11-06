import ActivityLog from '../models/ActivityLog.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { task, entityType, page = 1, limit = 50 } = req.query;
  const filter = { owner: req.user._id };

  if (task) filter.task = task;
  if (entityType) filter.entityType = entityType;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('actor', 'fullName email avatarUrl')
      .populate('task', 'title')
      .sort({ occurredAt: -1 })
      .skip(skip)
      .limit(limitNum),
    ActivityLog.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    {
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    'Activity logs retrieved'
  );
});

export default {
  getActivityLogs,
};

