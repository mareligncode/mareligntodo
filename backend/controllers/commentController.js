import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getComments = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  const task = await Task.findOne({ _id: taskId, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const comments = await Comment.find({ task: taskId, deletedAt: null })
    .populate('author', 'fullName email avatarUrl')
    .sort({ createdAt: 1 });

  return sendSuccess(res, { comments }, 'Comments retrieved');
});

export const createComment = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const { body } = req.body;

  if (!body || !body.trim()) {
    return next(new AppError('Comment body cannot be empty.', 400));
  }

  const task = await Task.findOne({ _id: taskId, owner: req.user._id });
  if (!task) {
    return next(new AppError('Task not found.', 404));
  }

  const comment = await Comment.create({
    task: taskId,
    author: req.user._id,
    body: body.trim(),
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    'author',
    'fullName email avatarUrl'
  );

  return sendSuccess(res, { comment: populatedComment }, 'Comment created', 201);
});

export const updateComment = asyncHandler(async (req, res, next) => {
  const { body } = req.body;
  if (!body || !body.trim()) {
    return next(new AppError('Comment body cannot be empty.', 400));
  }

  const comment = await Comment.findOne({ _id: req.params.id, author: req.user._id, deletedAt: null });
  if (!comment) {
    return next(new AppError('Comment not found or you are not authorized to edit it.', 404));
  }

  comment.body = body.trim();
  comment.editedAt = new Date();
  await comment.save();

  return sendSuccess(res, { comment }, 'Comment updated');
});

export const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found.', 404));
  }

  // Allow author or task owner to delete
  const isAuthor = comment.author.toString() === req.user._id.toString();
  const task = await Task.findById(comment.task);
  const isTaskOwner = task && task.owner.toString() === req.user._id.toString();

  if (!isAuthor && !isTaskOwner) {
    return next(new AppError('You are not authorized to delete this comment.', 403));
  }

  comment.deletedAt = new Date();
  await comment.save();

  return sendSuccess(res, null, 'Comment deleted');
});

export default {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};

