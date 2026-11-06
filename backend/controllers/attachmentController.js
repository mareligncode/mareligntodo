import Attachment from '../models/Attachment.js';
import Task from '../models/Task.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAttachments = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  const task = await Task.findOne({ _id: taskId, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const attachments = await Attachment.find({ task: taskId }).sort({ createdAt: -1 });
  return sendSuccess(res, { attachments }, 'Attachments retrieved');
});

export const createAttachment = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const { fileName, storageKey, mimeType, sizeBytes, url } = req.body;

  if (!fileName || !storageKey || !url) {
    return next(new AppError('File name, storage key, and url are required.', 400));
  }

  const task = await Task.findOne({ _id: taskId, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const attachment = await Attachment.create({
    owner: req.user._id,
    task: taskId,
    fileName: fileName.trim(),
    storageKey: storageKey.trim(),
    mimeType: mimeType || null,
    sizeBytes: sizeBytes || 0,
    url: url.trim(),
  });

  return sendSuccess(res, { attachment }, 'Attachment created', 201);
});

export const deleteAttachment = asyncHandler(async (req, res, next) => {
  const attachment = await Attachment.findOne({ _id: req.params.id, owner: req.user._id });
  if (!attachment) {
    return next(new AppError('Attachment not found.', 404));
  }

  await Attachment.deleteOne({ _id: attachment._id });
  return sendSuccess(res, null, 'Attachment deleted');
});

export default {
  getAttachments,
  createAttachment,
  deleteAttachment,
};

