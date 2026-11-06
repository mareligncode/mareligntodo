import SavedView from '../models/SavedView.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getSavedViews = asyncHandler(async (req, res) => {
  const views = await SavedView.find({ owner: req.user._id })
    .populate('filters.categoryIds', 'name color icon')
    .populate('filters.tagIds', 'name color')
    .sort({ isDefault: -1, name: 1 });

  return sendSuccess(res, { views }, 'Saved views retrieved');
});

export const getSavedViewById = asyncHandler(async (req, res, next) => {
  const view = await SavedView.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('filters.categoryIds', 'name color icon')
    .populate('filters.tagIds', 'name color');

  if (!view) {
    return next(new AppError('Saved view not found.', 404));
  }

  return sendSuccess(res, { view }, 'Saved view retrieved');
});

export const createSavedView = asyncHandler(async (req, res, next) => {
  const { name, filters, sort, isDefault } = req.body;

  if (!name) {
    return next(new AppError('Saved view name is required.', 400));
  }

  // If this is set as default, reset other default views
  if (isDefault) {
    await SavedView.updateMany({ owner: req.user._id }, { $set: { isDefault: false } });
  }

  const view = await SavedView.create({
    owner: req.user._id,
    name: name.trim(),
    filters: filters || {},
    sort: sort || { field: 'dueAt', direction: 'asc' },
    isDefault: isDefault || false,
  });

  return sendSuccess(res, { view }, 'Saved view created', 201);
});

export const updateSavedView = asyncHandler(async (req, res, next) => {
  const view = await SavedView.findOne({ _id: req.params.id, owner: req.user._id });
  if (!view) {
    return next(new AppError('Saved view not found.', 404));
  }

  const { name, filters, sort, isDefault } = req.body;

  if (isDefault) {
    await SavedView.updateMany(
      { owner: req.user._id, _id: { $ne: view._id } },
      { $set: { isDefault: false } }
    );
  }

  if (name !== undefined) view.name = name.trim();
  if (filters !== undefined) view.filters = filters;
  if (sort !== undefined) view.sort = sort;
  if (isDefault !== undefined) view.isDefault = isDefault;

  await view.save();

  return sendSuccess(res, { view }, 'Saved view updated');
});

export const deleteSavedView = asyncHandler(async (req, res, next) => {
  const view = await SavedView.findOne({ _id: req.params.id, owner: req.user._id });
  if (!view) {
    return next(new AppError('Saved view not found.', 404));
  }

  await SavedView.deleteOne({ _id: view._id });
  return sendSuccess(res, null, 'Saved view deleted');
});

export default {
  getSavedViews,
  getSavedViewById,
  createSavedView,
  updateSavedView,
  deleteSavedView,
};

