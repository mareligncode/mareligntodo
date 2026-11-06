import Device from '../models/Device.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDevices = asyncHandler(async (req, res) => {
  const devices = await Device.find({ user: req.user._id, revokedAt: null }).sort({ lastSeenAt: -1 });
  return sendSuccess(res, { devices }, 'Devices retrieved');
});

export const registerDevice = asyncHandler(async (req, res, next) => {
  const { deviceId, platform, appVersion, pushToken, pushProvider } = req.body;

  if (!deviceId || !platform) {
    return next(new AppError('deviceId and platform are required.', 400));
  }

  const device = await Device.findOneAndUpdate(
    { user: req.user._id, deviceId },
    {
      user: req.user._id,
      deviceId,
      platform,
      appVersion: appVersion || null,
      pushToken: pushToken || null,
      pushProvider: pushProvider || 'none',
      lastSeenAt: new Date(),
      revokedAt: null,
    },
    { new: true, upsert: true, runValidators: true }
  );

  return sendSuccess(res, { device }, 'Device registered/updated successfully');
});

export const revokeDevice = asyncHandler(async (req, res, next) => {
  const device = await Device.findOne({ user: req.user._id, deviceId: req.params.deviceId });
  if (!device) {
    return next(new AppError('Device not found.', 404));
  }

  device.revokedAt = new Date();
  await device.save();

  return sendSuccess(res, null, 'Device revoked');
});

export default {
  getDevices,
  registerDevice,
  revokeDevice,
};

