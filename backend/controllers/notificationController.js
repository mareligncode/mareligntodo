import Notification from '../models/Notification.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, page = 1, limit = 20 } = req.query;
  const filter = { user: req.user._id };

  if (unreadOnly === 'true') {
    filter.readAt = null;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('task', 'title priority status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, readAt: null }),
  ]);

  return sendSuccess(
    res,
    {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    'Notifications retrieved'
  );
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) {
    return next(new AppError('Notification not found.', 404));
  }

  notification.readAt = new Date();
  await notification.save();

  return sendSuccess(res, { notification }, 'Notification marked as read');
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
  return sendSuccess(res, null, 'All notifications marked as read');
});

export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) {
    return next(new AppError('Notification not found.', 404));
  }

  await Notification.deleteOne({ _id: notification._id });
  return sendSuccess(res, null, 'Notification deleted');
});

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

