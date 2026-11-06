import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { signToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.security;
  return obj;
};

export const register = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, locale, timezone } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError('Full name, email, and password are required.', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 409));
  }

  const passwordHash = await hashPassword(password);

  const newUser = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    locale: locale || 'en',
    timezone: timezone || 'UTC',
    status: 'active',
  });

  // Create default user settings
  await UserSettings.create({
    user: newUser._id,
  });

  const token = signToken({ id: newUser._id, email: newUser.email });

  return sendSuccess(
    res,
    {
      user: sanitizeUser(newUser),
      token,
    },
    'Account registered successfully',
    201
  );
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required.', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // Account lock check
  if (user.security?.lockUntil && user.security.lockUntil > new Date()) {
    const minutesLeft = Math.ceil((user.security.lockUntil - new Date()) / 60000);
    return next(
      new AppError(`Account is temporarily locked due to failed attempts. Try again in ${minutesLeft} minute(s).`, 403)
    );
  }

  const isPasswordMatch = await comparePassword(password, user.passwordHash);

  if (!isPasswordMatch) {
    const failedCount = (user.security?.failedLoginCount || 0) + 1;
    let lockUntil = null;

    // Lock account for 15 minutes after 5 consecutive failures
    if (failedCount >= 5) {
      lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    user.security = {
      failedLoginCount: failedCount,
      lockUntil,
    };
    await user.save();

    return next(new AppError('Invalid email or password.', 401));
  }

  // Reset failed login counter and set lastLoginAt
  user.security = { failedLoginCount: 0, lockUntil: null };
  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ id: user._id, email: user.email });

  return sendSuccess(
    res,
    {
      user: sanitizeUser(user),
      token,
    },
    'Logged in successfully'
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const settings = await UserSettings.findOne({ user: req.user._id });
  return sendSuccess(
    res,
    {
      user: sanitizeUser(req.user),
      settings,
    },
    'Current user profile retrieved'
  );
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const { fullName, avatarUrl, locale, timezone } = req.body;

  const allowedUpdates = {};
  if (fullName !== undefined) allowedUpdates.fullName = fullName.trim();
  if (avatarUrl !== undefined) allowedUpdates.avatarUrl = avatarUrl;
  if (locale !== undefined) allowedUpdates.locale = locale;
  if (timezone !== undefined) allowedUpdates.timezone = timezone;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, allowedUpdates, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, { user: sanitizeUser(updatedUser) }, 'Profile updated successfully');
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Current password and new password are required.', 400));
  }

  const user = await User.findById(req.user._id);
  const isMatch = await comparePassword(currentPassword, user.passwordHash);

  if (!isMatch) {
    return next(new AppError('Current password is incorrect.', 400));
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  const token = signToken({ id: user._id, email: user.email });

  return sendSuccess(
    res,
    {
      user: sanitizeUser(user),
      token,
    },
    'Password changed successfully'
  );
});

export default {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};

