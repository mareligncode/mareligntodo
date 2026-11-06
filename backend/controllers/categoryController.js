import Category from '../models/Category.js';
import Task from '../models/Task.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

export const getCategories = asyncHandler(async (req, res) => {
  const { includeArchived } = req.query;
  const filter = { owner: req.user._id };

  if (includeArchived !== 'true') {
    filter.isArchived = false;
  }

  const categories = await Category.find(filter).sort({ name: 1 });
  return sendSuccess(res, { categories }, 'Categories retrieved successfully');
});

export const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ _id: req.params.id, owner: req.user._id });
  if (!category) {
    return next(new AppError('Category not found.', 404));
  }
  return sendSuccess(res, { category }, 'Category retrieved');
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, color, icon, isDefault } = req.body;

  if (!name) {
    return next(new AppError('Category name is required.', 400));
  }

  const existing = await Category.findOne({ owner: req.user._id, name: name.trim() });
  if (existing) {
    return next(new AppError('A category with this name already exists.', 409));
  }

  const category = await Category.create({
    owner: req.user._id,
    name: name.trim(),
    color: color || '#3B82F6',
    icon: icon || null,
    isDefault: isDefault || false,
  });

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    entityType: 'category',
    entityId: category._id,
    action: 'created',
    changes: { name: category.name },
  });

  return sendSuccess(res, { category }, 'Category created successfully', 201);
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, color, icon, isDefault, isArchived } = req.body;

  const category = await Category.findOne({ _id: req.params.id, owner: req.user._id });
  if (!category) {
    return next(new AppError('Category not found.', 404));
  }

  if (name && name.trim() !== category.name) {
    const duplicate = await Category.findOne({
      owner: req.user._id,
      name: name.trim(),
      _id: { $ne: category._id },
    });
    if (duplicate) {
      return next(new AppError('Another category already has this name.', 409));
    }
    category.name = name.trim();
  }

  if (color !== undefined) category.color = color;
  if (icon !== undefined) category.icon = icon;
  if (isDefault !== undefined) category.isDefault = isDefault;
  if (isArchived !== undefined) category.isArchived = isArchived;

  await category.save();

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    entityType: 'category',
    entityId: category._id,
    action: 'updated',
    changes: req.body,
  });

  return sendSuccess(res, { category }, 'Category updated successfully');
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ _id: req.params.id, owner: req.user._id });
  if (!category) {
    return next(new AppError('Category not found.', 404));
  }

  // Remove category reference from user tasks
  await Task.updateMany({ owner: req.user._id, category: category._id }, { $set: { category: null } });
  await Category.deleteOne({ _id: category._id });

  await logActivity({
    actor: req.user._id,
    owner: req.user._id,
    entityType: 'category',
    entityId: category._id,
    action: 'deleted',
  });

  return sendSuccess(res, null, 'Category deleted successfully');
});

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

