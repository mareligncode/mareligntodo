import Tag from '../models/Tag.js';
import Task from '../models/Task.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find({ owner: req.user._id }).sort({ name: 1 });
  return sendSuccess(res, { tags }, 'Tags retrieved successfully');
});

export const getTagById = asyncHandler(async (req, res, next) => {
  const tag = await Tag.findOne({ _id: req.params.id, owner: req.user._id });
  if (!tag) {
    return next(new AppError('Tag not found.', 404));
  }
  return sendSuccess(res, { tag }, 'Tag retrieved');
});

export const createTag = asyncHandler(async (req, res, next) => {
  const { name, color } = req.body;

  if (!name) {
    return next(new AppError('Tag name is required.', 400));
  }

  const existing = await Tag.findOne({ owner: req.user._id, name: name.trim() });
  if (existing) {
    return next(new AppError('A tag with this name already exists.', 409));
  }

  const tag = await Tag.create({
    owner: req.user._id,
    name: name.trim(),
    color: color || '#10B981',
  });

  return sendSuccess(res, { tag }, 'Tag created successfully', 201);
});

export const updateTag = asyncHandler(async (req, res, next) => {
  const { name, color } = req.body;

  const tag = await Tag.findOne({ _id: req.params.id, owner: req.user._id });
  if (!tag) {
    return next(new AppError('Tag not found.', 404));
  }

  if (name && name.trim() !== tag.name) {
    const duplicate = await Tag.findOne({
      owner: req.user._id,
      name: name.trim(),
      _id: { $ne: tag._id },
    });
    if (duplicate) {
      return next(new AppError('Another tag already has this name.', 409));
    }
    tag.name = name.trim();
  }

  if (color !== undefined) tag.color = color;

  await tag.save();

  return sendSuccess(res, { tag }, 'Tag updated successfully');
});

export const deleteTag = asyncHandler(async (req, res, next) => {
  const tag = await Tag.findOne({ _id: req.params.id, owner: req.user._id });
  if (!tag) {
    return next(new AppError('Tag not found.', 404));
  }

  // Remove tag from all tasks
  await Task.updateMany({ owner: req.user._id, tags: tag._id }, { $pull: { tags: tag._id } });
  await Tag.deleteOne({ _id: tag._id });

  return sendSuccess(res, null, 'Tag deleted successfully');
});

export default {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};

