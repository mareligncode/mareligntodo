import UserSettings from '../models/UserSettings.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await UserSettings.findOne({ user: req.user._id });

  if (!settings) {
    settings = await UserSettings.create({ user: req.user._id });
  }

  return sendSuccess(res, { settings }, 'User settings retrieved');
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { appearance, defaults, notifications, privacy } = req.body;

  let settings = await UserSettings.findOne({ user: req.user._id });
  if (!settings) {
    settings = new UserSettings({ user: req.user._id });
  }

  if (appearance) {
    settings.appearance = { ...settings.appearance.toObject(), ...appearance };
  }
  if (defaults) {
    settings.defaults = { ...settings.defaults.toObject(), ...defaults };
  }
  if (notifications) {
    settings.notifications = { ...settings.notifications.toObject(), ...notifications };
  }
  if (privacy) {
    settings.privacy = { ...settings.privacy.toObject(), ...privacy };
  }

  await settings.save();

  return sendSuccess(res, { settings }, 'User settings updated successfully');
});

export default {
  getSettings,
  updateSettings,
};

